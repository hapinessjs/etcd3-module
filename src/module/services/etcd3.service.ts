import { Injectable, Inject } from '@hapiness/core';

import { Etcd3, Namespace, Watcher, Lock, IPutResponse, IDeleteRangeResponse, Lease } from 'etcd3';
import { Observable } from 'rxjs';

import { ResponseFormat } from '../interfaces';
import { Etcd3Ext } from '../etcd3.extension';

@Injectable()
export class Etcd3Service {

    /**
     *
     * @member {string} _basePath The base path from which all future key will be added
     *
     */
    private _basePath: string;

    /**
     *
     * @member {Namespace} _client The client having the base path to not concat manually all entry keys
     *
     */
    private _client: Namespace;


    constructor(@Inject(Etcd3Ext) private _manager) {
        this._basePath = (this._manager.config.basePath || '').trim().length ?
            this._manager.config.basePath : '/';
        this._client = this._manager.client.namespace(this._basePath);
    }

    protected _fixKey(key: string) {
        if (!key || !key.trim().length || key === '/') {
            return '/';
        }

        return `${this._basePath.endsWith('/') ? '' : '/'}${key.split('/').filter(_ => _.trim().length).join('/')}`;
    }

    /**
     *
     * @returns {string} The value of the base path
     *
     */
    public get basePath(): string {
        return this._basePath;
    }

    /**
     *
     * Retrieve the client without basePath consideration
     *
     * @returns {Namespace} the client for the namespace
     *
     */
    public get client(): Namespace {
        return this._client;
    }

    /**
     *
     * Retrieve the client without basePath consideration
     *
     * @returns {Etcd3} the normal client (without namespace consideration)
     *
     */
    public etcd3Client(): Etcd3 {
        return this._manager.client;
    }


    /******************************************************************************************
     *
     *  KV operations
     *
     ******************************************************************************************/

    /**
     *
     * Get the value stored at path `key`.
     *
     * @param {string} key The key you want to retrieve the value
     * @param {ResponseFormat} format The format you want for the result (default is string)
     *
     * @returns {string | object | number | Buffer | null | Error} The value of the object stored
     *
     */
    public get(_key: string, format: ResponseFormat = ResponseFormat.String):
        Observable<string | object | Buffer | number | null | Error> {
        const key = this._fixKey(_key);
        const promise = this.client.get(key);
        switch (format) {
            case ResponseFormat.String:
                return Observable.fromPromise(promise.string());
            case ResponseFormat.Number:
                return Observable.fromPromise(promise.number());
            case ResponseFormat.Json:
                return Observable.fromPromise(promise.json());
            case ResponseFormat.Buffer:
                return Observable.fromPromise(promise.buffer());
            default:
                return Observable.throw(new Error('Format not supported'));
        }
    }

    /**
     *
     * Delete the key `key`.
     *
     * @param {string} key The key you want to delete
     *
     * @returns {IDeleteRangeResponse} The result of the operation
     *
     */
    public delete(_key: string): Observable<IDeleteRangeResponse> {
        const key = this._fixKey(_key);
        return Observable.fromPromise(this.client.delete().key(key));
    }

    /**
     *
     * Delete all registered keys for the etcd3 client.
     *
     * @returns {IDeleteRangeResponse} The result of the operation
     *
     */
    public deleteAll(): Observable<IDeleteRangeResponse> {
        return Observable.fromPromise(this.client.delete().all());
    }

    /**
     *
     * Append the value `value` at path `key`.
     *
     * @param {string} key The key you want to retrieve the value
     * @param {string | Buffer | number} value The format you want for the result (default is string)
     * @param {boolean} returnResult If you want to retrieve the value that was put
     *
     * @returns {IPutResponse} The result of the operation
     *
     */
    public put(_key: string, value: string | number | Object | Buffer, returnResult: boolean = true):
        Observable<IPutResponse | string | number | Object | Buffer> {

        const key = this._fixKey(_key);
        if (!value) {
            return Observable.throw(new Error('"value" should not be null nor undefined'));
        }

        const _types = {
            string: () => ResponseFormat.String,
            number: () => ResponseFormat.Number,
            object: () => {
                const _obj = JSON.parse(JSON.stringify(value));
                if (_obj.type !== 'Buffer') {
                    return ResponseFormat.Json;
                } else {
                    return ResponseFormat.Buffer;
                }
            }
        };

        let _value: string | number | Buffer;
        if (typeof value === 'object') {
            const tmp = JSON.parse(JSON.stringify(value));
            if (tmp.type !== 'Buffer') {
                _value = JSON.stringify(value);
            } else {
                _value = <Buffer> value;
            }
        } else {
            _value = value;
        }

        const returnResult$ = Observable
            .of(returnResult)
            .switchMap(_ => Observable
                .fromPromise(this.client.put(key).value(_value).exec())
                .map(__ => ({ put_result: __, return_result: _ }))
            )
            .share();

        return Observable.merge(
            returnResult$.filter(_ => !_.return_result)
                .map(_ => _.put_result),
            returnResult$.filter(_ => !!_.return_result)
                .map(_ => _types[typeof value]())
                .switchMap(_ => this.get(key, _))
        );
    }

    /******************************************************************************************
     *
     *  Watch operations
     *
     ******************************************************************************************/

    /**
     *
     * Create a watcher for a specific key.
     *
     * @param {string} key The key you want to watch
     * @param {string} prefix The prefix you want to watch
     *
     * @returns {Watcher} The watcher instance created
     *
     */
    public createWatcher(_key: string, prefix: boolean = false): Observable<Watcher> {
        const key = this._fixKey(_key);
        const prefix$ = Observable.of(prefix).share();
        return Observable.merge(
            prefix$.filter(_ => !!_)
                .map(_ => this.client.watch().prefix(key)),
            prefix$.filter(_ => !_)
                .map(_ => this.client.watch().key(key))
        )
        .flatMap(_ => Observable.fromPromise(_.create()));
    }

    /******************************************************************************************
     *
     *  Lock operations
     *
     ******************************************************************************************/

    /**
     *
     * Create and acquire a lock for a key `key` specifying a ttl.
     * It will automatically contact etcd to keep the connection live.
     * When the connection is broken (end of process or lock released),
     * the TTL is the time after when the lock will be released.
     *
     * @param {string} key The key
     * @param {number} ttl The TTL value in seconds. Default value is 1
     *
     * @returns {Lock} The lock instance created
     *
     */
    public acquireLock(_key: string, ttl: number = 1): Observable<Lock> {
        const key = this._fixKey(_key);
        return Observable.fromPromise(
            this.client.lock(key).ttl(ttl || 1).acquire()
        );
    }

    /******************************************************************************************
     *
     * Lease Operations
     *
     ******************************************************************************************/

    /**
     *
     * Create a lease object with a ttl.
     * The lease is automatically keeping alive until it is close.
     *
     * @param {number} ttl The TTL value in seconds. Default value is 1
     *
     * @returns {Lease} The lease instance created
     *
     */
    public createLease(ttl: number = 1): Observable<Lease> {
        return Observable.of(this.client.lease(ttl || 1));
    }

    /**
     *
     * Create a lease object with a ttl and attach directly a key-value to it.
     * The lease is automatically keeping alive until it is close.
     *
     * NOTE: Once the lease is closed, the key-value will be destroyed by etcd.
     *
     * @param {string} key The key where to store the value
     * @param {string | Buffer | number} value The value that will be stored at `key` path
     * @param {number} ttl The TTL value in seconds. Default value is 1
     *
     * @returns {Lease} The lease instance created
     *
     */
    public createLeaseWithValue(_key: string, value: string | Buffer, ttl: number = 1): Observable<Lease> {
        const key = this._fixKey(_key);
        const lease = this.client.lease(ttl || 1);
        return Observable.fromPromise(
            lease.put(key).value(value).exec().then(_ => lease)
        );
    }
}

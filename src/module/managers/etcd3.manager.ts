import { Etcd3, Namespace, Watcher, Lock, IPutResponse, IDeleteRangeResponse, Lease } from 'etcd3';
import { Observable } from 'rxjs';

import { ResponseFormat } from '../interfaces';
import { Etcd3Config } from '../interfaces';

export class Etcd3Manager {

    private _basePath: string;
    private _etcd3client: Etcd3;
    private _client: Namespace;
    private _config: Etcd3Config;

    constructor(config: Etcd3Config) {
        this._config = config;
        this._basePath = (this._config.basePath || '').trim().length ? this._config.basePath : '/';
        if (!config.is_mocking) {
            this._etcd3client = new Etcd3(config.client);
            this._client = this._etcd3client.namespace(this._basePath);
        }
    }

    get client(): Etcd3 {
        return this._etcd3client;
    }

    get namespace(): Namespace {
        return this._client;
    }

    get config(): Etcd3Config {
        return this._config;
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
        const promise = this.namespace.get(key);
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
     * Get all keys and values stored under the given `prefix`.
     *
     * @param {string} prefix The prefix under which you want to start looking
     *
     * @returns { { [key: string]: string } } An object having all path as keys and all values stored under them
     *
     */
    public getWithPrefix(_prefix: string): Observable<{ [key: string]: string }> {
        const prefix = this._fixKey(_prefix);
        return Observable.fromPromise(this.namespace.getAll().prefix(prefix));
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
        return Observable.fromPromise(this.namespace.delete().key(key));
    }

    /**
     *
     * Delete all registered keys for the etcd3 client.
     *
     * @returns {IDeleteRangeResponse} The result of the operation
     *
     */
    public deleteAll(): Observable<IDeleteRangeResponse> {
        return Observable.fromPromise(this.namespace.delete().all());
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
                _value = <Buffer>value;
            }
        } else {
            _value = value;
        }

        const returnResult$ = Observable
            .of(returnResult)
            .switchMap(_ => Observable
                .fromPromise(this.namespace.put(key).value(_value).exec())
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
                .map(_ => this.namespace.watch().prefix(key)),
            prefix$.filter(_ => !_)
                .map(_ => this.namespace.watch().key(key))
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
            this.namespace.lock(key).ttl(ttl || 1).acquire()
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
        return Observable.of(this.namespace.lease(ttl || 1));
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
        const lease = this.namespace.lease(ttl || 1);
        return Observable.fromPromise(
            lease.put(key).value(value).exec().then(_ => lease)
        );
    }

    /**
     *
     * Frees resources associated with the client.
     *
     */
    public close(): void {
        this._etcd3client.close();
    }
}

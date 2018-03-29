import { Injectable, Inject } from '@hapiness/core';

import { Watcher, Lock, IPutResponse, IDeleteRangeResponse, Lease, Namespace, Etcd3 } from 'etcd3';
import { Observable } from 'rxjs';

import { ResponseFormat } from '../interfaces';
import { Etcd3Ext } from '../etcd3.extension';
import { Etcd3Manager } from '..';

@Injectable()
export class Etcd3Service {

    constructor(@Inject(Etcd3Ext) private _manager: Etcd3Manager) {}

    public get basePath(): string {
        return this._manager.basePath;
    }

    public get client(): Etcd3 {
        return this._manager.client;
    }

    public get namespace(): Namespace {
        return this._manager.namespace;
    }

    public get(_key: string, format: ResponseFormat = ResponseFormat.String):
        Observable<string | object | Buffer | number | null | Error> {
        return this._manager.get(_key, format);
    }

    public getWithPrefix(_prefix: string): Observable<{ [key: string]: string }> {
        return this._manager.getWithPrefix(_prefix);
    }

    public delete(_key: string): Observable<IDeleteRangeResponse> {
        return this._manager.delete(_key);
    }

    public deleteAll(): Observable<IDeleteRangeResponse> {
        return this._manager.deleteAll();
    }

    public put(_key: string, value: string | number | Object | Buffer, returnResult: boolean = true):
        Observable<IPutResponse | string | number | Object | Buffer> {
        return this._manager.put(_key, value, returnResult);
    }

    public createWatcher(_key: string, prefix: boolean = false): Observable<Watcher> {
        return this._manager.createWatcher(_key, prefix);
    }

    public acquireLock(_key: string, ttl: number = 1): Observable<Lock> {
        return this._manager.acquireLock(_key, ttl);
    }

    public createLease(ttl: number = 1): Observable<Lease> {
        return this._manager.createLease(ttl);
    }

    public createLeaseWithValue(_key: string, value: string | Buffer, ttl: number = 1): Observable<Lease> {
        return this._manager.createLeaseWithValue(_key, value, ttl)
    }

    public close(): void {
        this._manager.close();
    }
}

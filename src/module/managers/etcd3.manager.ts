import { Etcd3 } from 'etcd3';

import { Etcd3Config } from '../interfaces';

export class Etcd3Manager {

    private _client: Etcd3;
    private _config: Etcd3Config;

    constructor(config: Etcd3Config) {
        this._client = new Etcd3(config.client);
        this._config = config;
    }

    get client(): Etcd3 {
        return this._client;
    }

    get config(): Etcd3Config {
        return this._config;
    }
}

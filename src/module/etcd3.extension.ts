import { CoreModule, Extension, ExtensionWithConfig, OnExtensionLoad } from '@hapiness/core';

import { Observable } from 'rxjs/Observable';

import { Etcd3Manager } from './managers';

import { Etcd3Config } from './interfaces';

export class Etcd3Ext implements OnExtensionLoad {

    public static setConfig(config: Etcd3Config): ExtensionWithConfig {
        return {
            token: Etcd3Ext,
            config
        };
    }

    /**
     * Initilization of the extension
     * Create the manager instance
     *
     * @param  {CoreModule} module
     * @param  {Etcd3Config} config
     *
     * @returns Observable
     */
    onExtensionLoad(module: CoreModule, config: Etcd3Config): Observable<Extension> {
        return Observable
            .of(new Etcd3Manager(config))
            .map(_ => ({
                instance: this,
                token: Etcd3Ext,
                value: _
            }));
    }
}

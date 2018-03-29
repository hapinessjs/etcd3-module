import {
    CoreModule,
    Extension,
    ExtensionWithConfig,
    OnExtensionLoad,
    OnShutdown,
    ExtensionShutdown,
    ExtensionShutdownPriority
} from '@hapiness/core';

import { Observable } from 'rxjs/Observable';

import { Etcd3Manager } from './managers';
import { Etcd3Config } from './interfaces';
import { Etcd3 } from '.';

export class Etcd3Ext implements OnExtensionLoad, OnShutdown {

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

    onShutdown(module: CoreModule, manager: Etcd3Manager): ExtensionShutdown {
        return {
            priority: ExtensionShutdownPriority.NORMAL,
            resolver: Observable
                .of(manager)
                .do(_ => _.close())
        };
    }
}

import { IOptions } from 'etcd3';

export interface Etcd3Config {
    basePath?: string;
    client: IOptions;
}

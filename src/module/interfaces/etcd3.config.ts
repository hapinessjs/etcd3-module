import { IOptions } from 'etcd3';

export interface Etcd3Config {
    basePath?: string;
    is_mocking?: boolean;
    client: IOptions;
}

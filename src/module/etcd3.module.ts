import { HapinessModule } from '@hapiness/core';
import { Etcd3Service } from './services';

@HapinessModule({
    version: '1.0.3',
    declarations: [],
    providers: [],
    exports: [ Etcd3Service ]
})
export class Etcd3Module {}

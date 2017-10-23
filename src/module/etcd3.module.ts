import { HapinessModule } from '@hapiness/core';
import { Etcd3Service, LeaderCandidate, WatcherWrapper } from './services';

@HapinessModule({
    version: '1.0.0',
    declarations: [],
    providers: [],
    exports: [ Etcd3Service, LeaderCandidate, WatcherWrapper ]
})
export class Etcd3Module {}

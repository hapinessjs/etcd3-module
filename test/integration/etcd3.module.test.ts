
/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';
import * as etcdLib from 'etcd3';

import { Hapiness, HapinessModule, HttpServerExt, OnStart } from '@hapiness/core';

import { Etcd3Ext, Etcd3Module, Etcd3Service } from '../../src';

@suite('- Integration tests of Etcd3Module')
export class Etcd3ModuleIntegrationTest {

    private _mock: any;

    /**
     * Function executed before the suite
     */
    static before() {}

    /**
     * Function executed after the suite
     */
    static after() {}

    /**
     * Class constructor
     * New lifecycle
     */
    constructor() {}

    /**
     * Function executed before each test
     */
    before() {
        this._mock = unit.mock(etcdLib);
        this._mock
            .expects('Etcd3')
            .withArgs({ hosts: '127.0.0.1' })
            .returns({ namespace: unit.stub().returns({ get: 'NS Client' }) });
    }

    /**
     * Function executed after each test
     */
    after() {
        this._mock.restore();
    }

    /**
     * Test if `Etcd3Module` is correctly integrated and has functions
     */
    @test('- Test if `Etcd3Module` is correctly integrated and has functions')
    testMinioModule(done) {
        @HapinessModule({
            version: '1.0.0',
            providers: [],
            imports: [Etcd3Module]
        })
        class MinioModuleTest implements OnStart {
            constructor(private _etcdService: Etcd3Service) {}

            onStart(): void {
                unit.value(this._etcdService.basePath).is('/base_path/');

                unit.function(this._etcdService.get);
                unit.function(this._etcdService.put);
                unit.function(this._etcdService.createWatcher);
                unit.function(this._etcdService.acquireLock);
                unit.function(this._etcdService.createLease);
                unit.function(this._etcdService.createLeaseWithValue);

                done();
            }
        }

        Hapiness.bootstrap(MinioModuleTest, [
            HttpServerExt.setConfig({ host: '0.0.0.0', port: 1234 }),
            Etcd3Ext.setConfig({ basePath: '/base_path', client: { hosts: '127.0.0.1' } })
        ]);
    }
}

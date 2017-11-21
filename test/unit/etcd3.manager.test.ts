
/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';
import * as etcdLib from 'etcd3';

import { Etcd3Manager } from '../../src';

@suite('- Unit tests of Etcd3Manager')
export class Etcd3ManagerTest {

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
    before() {}

    /**
     * Function executed after each test
     */
    after() {}

    /**
     * Test if `Etcd3Manager` is correctly integrated and has functions
     */
    @test('- Test if `Etcd3Manager` is correctly instanciated')
    testEtcd3ManagerCorrectlyInstanciated() {
        const options = { basePath: '/basepath', client: { hosts: 'http://myhost.com:2379' } };

        class Fake { constructor() {} }

        const mock = unit.mock(etcdLib);

        mock
            .expects('Etcd3')
            .withArgs(options.client)
            .returns(new Fake());

        const instance = new Etcd3Manager(options);

        unit.bool(instance.client instanceof Fake).isTrue();
        unit.object(instance.config).is(options);

        mock.verify();
        mock.restore();
    }
}

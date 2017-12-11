
/**
 * @see https://github.com/pana-cc/mocha-typescript
 */
import { test, suite } from 'mocha-typescript';

/**
 * @see http://unitjs.com/
 */
import * as unit from 'unit.js';

import { Observable } from 'rxjs';

import { Etcd3Service, ResponseFormat } from '../../src';

@suite('- Unit tests of Etcd3Service')
export class Etcd3ServiceTest {

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
     * Test if `Etcd3Service` is correctly instanciated with correct basePath value
     */
    @test('- Test if `Etcd3Service` is correctly instanciated with correct basePath value')
    testEtcd3ServiceCorrectlyInstanciatedWithBasePath() {
        const nsStub = unit.stub();
        const client = { test: 'Manager Client', namespace: nsStub.returns({ get: 'NS Client' }) };

        const instanceBasePath = new Etcd3Service(<any>{ client, config: { basePath: '/basepath' } });
        const instanceBasePathEndsWithSlash = new Etcd3Service(<any>{ client, config: { basePath: '/basepath/' } });
        const instanceNoBasePath = new Etcd3Service(<any>{ client, config: {} });

        unit.string(instanceBasePath.basePath).is('/basepath/');
        unit.string(instanceBasePathEndsWithSlash.basePath).is('/basepath/');
        unit.string(instanceNoBasePath.basePath).is('/');

        unit.value(instanceBasePath.client).is({ get: 'NS Client' });
        unit.value(instanceBasePathEndsWithSlash.client).is({ get: 'NS Client' });
        unit.value(instanceNoBasePath.client).is({ get: 'NS Client' });

        unit.value(instanceBasePath.etcd3Client()['test']).is('Manager Client');
        unit.value(instanceBasePathEndsWithSlash.etcd3Client()['test']).is('Manager Client');
        unit.value(instanceNoBasePath.etcd3Client()['test']).is('Manager Client');

        unit.number(nsStub.callCount).is(3);
    }

    /**
     * Test of `Etcd3Service` method get should return an error if ask for content type other than existing ones
     */
    @test('- Test of `Etcd3Service` method get should return an error if ask for content type other than existing ones')
    testEtcd3ServiceGetFunction(done) {
        const stringFuncStub = unit.stub().returns(Promise.resolve());
        const bufferFuncStub = unit.stub().returns(Promise.resolve());
        const jsonFuncStub = unit.stub().returns(Promise.resolve());
        const numberFuncStub = unit.stub().returns(Promise.resolve());

        const nsStub = unit.stub().returns({
            get: () => ({
                string: stringFuncStub,
                buffer: bufferFuncStub,
                json: jsonFuncStub,
                number: numberFuncStub
            })
        });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        // Default format is string
        instance
            .get('key')
            .switchMap(() => {
                unit.value(stringFuncStub.callCount).is(1);
                unit.value(bufferFuncStub.callCount).is(0);
                unit.value(jsonFuncStub.callCount).is(0);
                unit.value(numberFuncStub.callCount).is(0);

                // Unsupported format is string
                return instance.get('key', 100);
            })
            .catch(_ => {
                unit.value(_.message).is('Format not supported');

                // Call with string
                return instance.get('key', ResponseFormat.String);
            })
            .switchMap(_ => {
                unit.value(stringFuncStub.callCount).is(2);
                unit.value(bufferFuncStub.callCount).is(0);
                unit.value(jsonFuncStub.callCount).is(0);
                unit.value(numberFuncStub.callCount).is(0);

                return instance.get('key', ResponseFormat.Json);
            })
            .switchMap(_ => {
                unit.value(stringFuncStub.callCount).is(2);
                unit.value(bufferFuncStub.callCount).is(0);
                unit.value(jsonFuncStub.callCount).is(1);
                unit.value(numberFuncStub.callCount).is(0);

                return instance.get('key', ResponseFormat.Number);
            })
            .switchMap(_ => {
                unit.value(stringFuncStub.callCount).is(2);
                unit.value(bufferFuncStub.callCount).is(0);
                unit.value(jsonFuncStub.callCount).is(1);
                unit.value(numberFuncStub.callCount).is(1);

                return instance.get('key', ResponseFormat.Buffer);
            })
            .subscribe(
                _ => {
                    unit.value(stringFuncStub.callCount).is(2);
                    unit.value(bufferFuncStub.callCount).is(1);
                    unit.value(jsonFuncStub.callCount).is(1);
                    unit.value(numberFuncStub.callCount).is(1);

                    unit.value(nsStub.callCount).is(1);

                    done();
                },
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method put with undefined value should return error
     */
    @test('- Test of `Etcd3Service` method put with undefined value should return error')
    testEtcd3ServicePutFunctionThrowError(done) {
        const valueStub = unit.stub().returns({ exec: () => Promise.resolve() });
        const putStub = unit.stub().returns({ value: valueStub });
        const nsStub = unit.stub().returns({ put: putStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        // Default format is string
        instance
            .put('key', undefined, false)
            .subscribe(
                _ => {
                    done(new Error('Should not be there'));
                },
                err => {
                    unit.string(err.message).is('"value" should not be null nor undefined');
                    done();
                }
            );
    }

    /**
     * Test of `Etcd3Service` method put with normal object
     */
    @test('- Test of `Etcd3Service` method put with normal object')
    testEtcd3ServicePutFunctionWithObject(done) {
        const valueStub = unit.stub().returns({ exec: () => Promise.resolve() });
        const putStub = unit.stub().returns({ value: valueStub });
        const nsStub = unit.stub().returns({ put: putStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        // Default format is string
        instance
            .put('key', { test: 'micro' }, false)
            .subscribe(
                _ => {
                    unit.value(putStub.callCount).is(1);
                    unit.value(putStub.getCall(0).args[0]).is('key');

                    unit.value(valueStub.callCount).is(1);
                    unit.value(valueStub.getCall(0).args[0]).is(JSON.stringify({ test: 'micro' }));

                    unit.value(nsStub.callCount).is(1);

                    done();
                },
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method put with string
     */
    @test('- Test of `Etcd3Service` method put with string')
    testEtcd3ServicePutFunctionWithString(done) {
        const valueStub = unit.stub().returns({ exec: () => Promise.resolve() });
        const putStub = unit.stub().returns({ value: valueStub });
        const nsStub = unit.stub().returns({ put: putStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        // Default format is string
        instance
            .put('key', 'value', false)
            .subscribe(
                _ => {
                    unit.value(putStub.callCount).is(1);
                    unit.value(putStub.getCall(0).args[0]).is('key');

                    unit.value(valueStub.callCount).is(1);
                    unit.value(valueStub.getCall(0).args[0]).is('value');

                    unit.value(nsStub.callCount).is(1);

                    done();
                },
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method put with return value
     */
    @test('- Test of `Etcd3Service` method put with string')
    testEtcd3ServicePutFunctionWithReturnValue(done) {
        const valueStub = unit.stub().returns({ exec: () => Promise.resolve() });
        const putStub = unit.stub().returns({ value: valueStub });
        const nsStub = unit.stub().returns({ put: putStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        const getStub = unit.stub().returns(Observable.of('test'));
        instance.get = getStub;

        // Default format is string
        instance
            .put('key', 'value')
            .switchMap(_ => {
                // Get
                unit.value(getStub.callCount).is(1);
                unit.value(getStub.getCall(0).args[1]).is(ResponseFormat.String);

                return instance.put('key', Buffer.from('test'));
            })
            .switchMap(
                _ => {
                    // Get
                    unit.value(getStub.callCount).is(2);
                    unit.value(getStub.getCall(1).args[1]).is(ResponseFormat.Buffer);

                    return instance.put('key', 1);
                }
            )
            .switchMap(
                _ => {
                    // Get
                    unit.value(getStub.callCount).is(3);
                    unit.value(getStub.getCall(2).args[1]).is(ResponseFormat.Number);

                    return instance.put('key', { ok: 1 });
                }
            )
            .switchMap(
                _ => {
                    // Get
                    unit.value(getStub.callCount).is(4);
                    unit.value(getStub.getCall(3).args[1]).is(ResponseFormat.Json);

                    return Observable.of(null);
                }
            )
            .subscribe(
                _ => done(),
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method put with Buffer
     */
    @test('- Test of `Etcd3Service` method put with Buffer')
    testEtcd3ServicePutFunctionWithBuffer(done) {
        const valueStub = unit.stub().returns({ exec: () => Promise.resolve() });
        const putStub = unit.stub().returns({ value: valueStub });
        const nsStub = unit.stub().returns({ put: putStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        const buff: Buffer = Buffer.from('Say hi');

        // Default format is string
        instance
            .put('key', buff, false)
            .subscribe(
                _ => {
                    unit.value(putStub.callCount).is(1);
                    unit.value(putStub.getCall(0).args[0]).is('key');

                    unit.value(valueStub.callCount).is(1);
                    unit.value(valueStub.getCall(0).args[0].toString('utf8')).is(buff.toString('utf8'));

                    unit.value(nsStub.callCount).is(1);

                    done();
                },
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method put with Number
     */
    @test('- Test of `Etcd3Service` method put with Number')
    testEtcd3ServicePutFunctionWithNumber(done) {
        const valueStub = unit.stub().returns({ exec: () => Promise.resolve() });
        const putStub = unit.stub().returns({ value: valueStub });
        const nsStub = unit.stub().returns({ put: putStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        // Default format is string
        instance
            .put('key', 10, false)
            .subscribe(
                _ => {
                    unit.value(putStub.callCount).is(1);
                    unit.value(putStub.getCall(0).args[0]).is('key');

                    unit.value(valueStub.callCount).is(1);
                    unit.value(valueStub.getCall(0).args[0]).is(10);

                    unit.value(nsStub.callCount).is(1);

                    done();
                },
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method delete
     */
    @test('- Test of `Etcd3Service` method delete')
    testEtcd3ServiceDeleteFunction(done) {
        const keyStub = unit.stub().returns(Promise.resolve({ ok: 1 }));
        const delStub = unit.stub().returns({ key: keyStub });
        const nsStub = unit.stub().returns({ delete: delStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        instance
            .delete('key')
            .subscribe(
                _ => {
                    unit.number(nsStub.callCount).is(1);
                    unit.value(delStub.callCount).is(1);
                    unit.value(keyStub.callCount).is(1);

                    unit.value(keyStub.getCall(0).args[0]).is('key');

                    done();
                },
                err => {
                    done(err);
                }
            );
    }

    /**
     * Test of `Etcd3Service` method deleteAll
     */
    @test('- Test of `Etcd3Service` method deleteAll')
    testEtcd3ServiceDeleteAllFunction(done) {
        const allStub = unit.stub().returns(Promise.resolve({ ok: 1 }));
        const delAllStub = unit.stub().returns({ all: allStub });
        const nsStub = unit.stub().returns({ delete: delAllStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        instance
            .deleteAll()
            .subscribe(
                _ => {
                    unit.number(nsStub.callCount).is(1);
                    unit.value(delAllStub.callCount).is(1);
                    unit.value(allStub.callCount).is(1);

                    done();
                },
                err => {
                    done(err);
                }
            );
    }

    /**
     * Test of `Etcd3Service` method createWatcher
     */
    @test('- Test of `Etcd3Service` method createWatcher')
    testEtcd3ServiceCreateWatcherFunction(done) {
        const prefixStub = unit.stub().returns({ create: () => Promise.resolve() });
        const keyStub = unit.stub().returns({ create: () => Promise.resolve() });
        const watchStub = unit.stub().returns({ key: keyStub, prefix: prefixStub });
        const nsStub = unit.stub().returns({ watch: watchStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        // Default format is string
        instance
            .createWatcher('key')
            .flatMap(
                _ => {
                    unit.value(watchStub.callCount).is(1);

                    unit.value(prefixStub.callCount).is(0);
                    unit.value(keyStub.callCount).is(1);

                    unit.value(keyStub.getCall(0).args[0]).is('key');

                    unit.value(nsStub.callCount).is(1);

                    return instance.createWatcher('key', true);
                }
            )
            .flatMap(
                _ => {
                    unit.value(watchStub.callCount).is(2);

                    unit.value(keyStub.callCount).is(1);
                    unit.value(prefixStub.callCount).is(1);
                    unit.value(prefixStub.getCall(0).args[0]).is('key');

                    unit.value(nsStub.callCount).is(1);

                    return Observable.of(true);
                }
            )
            .subscribe(
                _ => done(),
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method acquireLock
     */
    @test('- Test of `Etcd3Service` method acquireLock')
    testEtcd3ServiceAcquireLockFunction(done) {
        const ttlStub = unit.stub().returns({ acquire: () => Promise.resolve() });
        const lockStub = unit.stub().returns({ ttl: ttlStub });
        const nsStub = unit.stub().returns({ lock: lockStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        instance
            .acquireLock('key')
            .switchMap(_ => instance.acquireLock('key', 10))
            .switchMap(_ => instance.acquireLock('key', 0))
            .subscribe(
                _ => {
                    unit.value(lockStub.callCount).is(3);
                    unit.value(lockStub.getCall(0).args[0]).is('key');
                    unit.value(lockStub.getCall(1).args[0]).is('key');
                    unit.value(lockStub.getCall(2).args[0]).is('key');

                    unit.value(ttlStub.callCount).is(3);
                    unit.value(ttlStub.getCall(0).args[0]).is(1);
                    unit.value(ttlStub.getCall(1).args[0]).is(10);
                    unit.value(ttlStub.getCall(2).args[0]).is(1);

                    unit.value(nsStub.callCount).is(1);

                    done();
                },
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method createLease
     */
    @test('- Test of `Etcd3Service` method createLease')
    testEtcd3ServiceCreateLeaseFunction(done) {
        const leaseStub = unit.stub().returns({});
        const nsStub = unit.stub().returns({ lease: leaseStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        instance
            .createLease()
            .switchMap(_ => instance.createLease(10))
            .switchMap(_ => instance.createLease(0))
            .subscribe(
                _ => {
                    unit.value(leaseStub.callCount).is(3);
                    unit.value(leaseStub.getCall(0).args[0]).is(1);
                    unit.value(leaseStub.getCall(1).args[0]).is(10);
                    unit.value(leaseStub.getCall(2).args[0]).is(1);

                    unit.value(nsStub.callCount).is(1);

                    done();
                },
                err => done(err)
            );
    }

    /**
     * Test of `Etcd3Service` method createLeaseWithValue
     */
    @test('- Test of `Etcd3Service` method createLeaseWithValue')
    testEtcd3ServiceCreateLeaseWithValueFunction(done) {
        const valueStub = unit.stub().returns({ exec: () => Promise.resolve() });
        const putStub = unit.stub().returns({ value: valueStub });
        const leaseStub = unit.stub().returns({ put: putStub });
        const nsStub = unit.stub().returns({ lease: leaseStub });

        const instance = new Etcd3Service(<any>{
            client: { namespace: nsStub },
            config: { basePath: '/basepath' }
        });

        instance
            .createLeaseWithValue('key', 'value')
            .switchMap(_ => instance.createLeaseWithValue('key', 'value', 10))
            .switchMap(_ => instance.createLeaseWithValue('key', 'value', 0))
            .subscribe(
                _ => {
                    unit.value(leaseStub.callCount).is(3);
                    unit.value(leaseStub.getCall(0).args[0]).is(1);
                    unit.value(leaseStub.getCall(1).args[0]).is(10);
                    unit.value(leaseStub.getCall(2).args[0]).is(1);

                    unit.value(putStub.callCount).is(3);
                    unit.value(putStub.getCall(0).args[0]).is('key');
                    unit.value(putStub.getCall(1).args[0]).is('key');
                    unit.value(putStub.getCall(2).args[0]).is('key');

                    unit.value(valueStub.callCount).is(3);
                    unit.value(valueStub.getCall(0).args[0]).is('value');
                    unit.value(valueStub.getCall(1).args[0]).is('value');
                    unit.value(valueStub.getCall(2).args[0]).is('value');

                    unit.value(nsStub.callCount).is(1);

                    done();
                },
                err => done(err)
            );
    }
}

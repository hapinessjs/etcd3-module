
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

    private _managerInterface: any;
    private _etcdService: Etcd3Service;

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
        this._managerInterface = {
            basePath: '',
            get: () => {},
            getWithPrefix: () => {},
            delete: () => {},
            deleteAll: () => {},
            put: () => {},
            createWatcher: () => {},
            acquireLock: () => {},
            createLease: () => {},
            createLeaseWithValue: () => {},
            close: () => {},
        };

        this._etcdService = new Etcd3Service(this._managerInterface);
    }

    /**
     * Function executed after each test
     */
    after() {}

    @test()
    testBasePath() {
        this._managerInterface.basePath = '/test';
        unit.string(this._etcdService.basePath).is('/test');
    }

    @test()
    testGet(done) {
        this._managerInterface.get = unit.stub().returns(Observable.of('test'));
        this._etcdService
            .get('/test_key')
            .subscribe(
                res => {
                    unit.string(res).is('test');
                    unit.number(this._managerInterface.get.callCount).is(1);
                    unit.string(this._managerInterface.get.getCall(0).args[0]).is('/test_key');
                    done();
                },
                err => done(err)
            );
    }

    @test()
    testGetWithPrefix(done) {
        this._managerInterface.getWithPrefix = unit.stub().returns(Observable.of('test'));
        this._etcdService
            .getWithPrefix('/test_key')
            .subscribe(
                res => {
                    unit.string(res).is('test');
                    unit.number(this._managerInterface.getWithPrefix.callCount).is(1);
                    unit.string(this._managerInterface.getWithPrefix.getCall(0).args[0]).is('/test_key');
                    done();
                },
                err => done(err)
            );
    }

    @test()
    testDelete(done) {
        this._managerInterface.delete = unit.stub().returns(Observable.of('test'));
        this._etcdService
            .delete('/test_key')
            .subscribe(
                res => {
                    unit.string(res).is('test');
                    unit.number(this._managerInterface.delete.callCount).is(1);
                    unit.string(this._managerInterface.delete.getCall(0).args[0]).is('/test_key');
                    done();
                },
                err => done(err)
            );
    }

    @test()
    testDeleteAll(done) {
        this._managerInterface.deleteAll = unit.stub().returns(Observable.of('test'));
        this._etcdService
            .deleteAll()
            .subscribe(
                res => {
                    unit.string(res).is('test');
                    unit.number(this._managerInterface.deleteAll.callCount).is(1);
                    done();
                },
                err => done(err)
            );
    }

    @test()
    testPut(done) {
        this._managerInterface.put = unit.stub().returns(Observable.of('{"test":"1 2"}'));
        this._etcdService
            .put('/test_key', '{"test":"1 2"}')
            .subscribe(
                res => {
                    unit.string(res).is('{"test":"1 2"}');
                    unit.number(this._managerInterface.put.callCount).is(1);
                    unit.string(this._managerInterface.put.getCall(0).args[0]).is('/test_key');
                    unit.string(this._managerInterface.put.getCall(0).args[1]).is('{"test":"1 2"}');
                    done();
                },
                err => done(err)
            );
    }

    @test()
    testCreateWatcher(done) {
        this._managerInterface.createWatcher = unit.stub().returns(Observable.of('{"id":"0"}'));
        this._etcdService
            .createWatcher('/test_key', true)
            .subscribe(
                res => {
                    unit.string(res).is('{"id":"0"}');
                    unit.number(this._managerInterface.createWatcher.callCount).is(1);
                    unit.string(this._managerInterface.createWatcher.getCall(0).args[0]).is('/test_key');
                    unit.bool(this._managerInterface.createWatcher.getCall(0).args[1]).isTrue();
                    done();
                },
                err => done(err)
            );
    }

    @test()
    testAcquireLock(done) {
        this._managerInterface.acquireLock = unit.stub().returns(Observable.of('{"id":"0"}'));
        this._etcdService
            .acquireLock('/test_key')
            .subscribe(
                res => {
                    unit.string(res).is('{"id":"0"}');
                    unit.number(this._managerInterface.acquireLock.callCount).is(1);
                    unit.string(this._managerInterface.acquireLock.getCall(0).args[0]).is('/test_key');
                    unit.number(this._managerInterface.acquireLock.getCall(0).args[1]).is(1);
                    done();
                },
                err => done(err)
            );
    }

    @test()
    testCreateLease(done) {
        this._managerInterface.createLease = unit.stub().returns(Observable.of('{"id":"0"}'));
        this._etcdService
            .createLease()
            .subscribe(
                res => {
                    unit.string(res).is('{"id":"0"}');
                    unit.number(this._managerInterface.createLease.callCount).is(1);
                    unit.number(this._managerInterface.createLease.getCall(0).args[0]).is(1);
                    done();
                },
                err => done(err)
            );
    }

    @test()
    testCreateLeaseWithValue(done) {
        this._managerInterface.createLeaseWithValue = unit.stub().returns(Observable.of('{"id":"0"}'));
        this._etcdService
            .createLeaseWithValue('/test_key', 'value')
            .subscribe(
                res => {
                    unit.string(res).is('{"id":"0"}');
                    unit.number(this._managerInterface.createLeaseWithValue.callCount).is(1);
                    unit.string(this._managerInterface.createLeaseWithValue.getCall(0).args[0]).is('/test_key');
                    unit.string(this._managerInterface.createLeaseWithValue.getCall(0).args[1]).is('value');
                    unit.number(this._managerInterface.createLeaseWithValue.getCall(0).args[2]).is(1);

                    done();
                },
                err => done(err)
            );
    }

    @test()
    testClose() {
        this._managerInterface.close = unit.stub().returns('');
        this._etcdService.close()
        unit.number(this._managerInterface.close.callCount).is(1);
    }
}

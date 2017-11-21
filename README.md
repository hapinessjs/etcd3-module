<img src="http://bit.ly/2mxmKKI" width="500" alt="Hapiness" />

<div style="margin-bottom:20px;">
<div style="line-height:60px">
    <a href="https://travis-ci.org/hapinessjs/etcd3-module.svg?branch=master">
        <img src="https://travis-ci.org/hapinessjs/etcd3-module.svg?branch=master" alt="build" />
    </a>
    <a href="https://coveralls.io/github/hapinessjs/etcd3-module?branch=master">
        <img src="https://coveralls.io/repos/github/hapinessjs/etcd3-module/badge.svg?branch=master" alt="coveralls" />
    </a>
    <a href="https://david-dm.org/hapinessjs/etcd3-module">
        <img src="https://david-dm.org/hapinessjs/etcd3-module.svg" alt="dependencies" />
    </a>
    <a href="https://david-dm.org/hapinessjs/etcd3-module?type=dev">
        <img src="https://david-dm.org/hapinessjs/etcd3-module/dev-status.svg" alt="devDependencies" />
    </a>
</div>
<div>
    <a href="https://www.typescriptlang.org/docs/tutorial.html">
        <img src="https://cdn-images-1.medium.com/max/800/1*8lKzkDJVWuVbqumysxMRYw.png"
             align="right" alt="Typescript logo" width="50" height="50" style="border:none;" />
    </a>
    <a href="http://reactivex.io/rxjs">
        <img src="http://reactivex.io/assets/Rx_Logo_S.png"
             align="right" alt="ReactiveX logo" width="50" height="50" style="border:none;" />
    </a>
    <a href="http://hapijs.com">
        <img src="http://bit.ly/2lYPYPw"
             align="right" alt="Hapijs logo" width="75" style="border:none;" />
    </a>
</div>
</div>

# Etcd3 Module

```Etcd3``` module for the Hapiness framework.

## Table of contents


* [Using your module inside Hapiness application](#using-your-module-inside-hapiness-application)
	* [`yarn` or `npm` it in your `package.json`](#yarn-or-npm-it-in-your-package)
    * [Importing `Etcd3Module` from the library](#importing-etcd3module-from-the-library)
    * [Using `Etcd3` inside your application](#using-etcd3-inside-your-application)
* [`Etcd3Service` api](#etcd3service-api)

## Using your module inside Hapiness application


### `yarn` or `npm` it in your `package.json`

```bash
$ npm install --save @hapiness/etcd3 @hapiness/core rxjs

or

$ yarn add @hapiness/etcd3 @hapiness/core rxjs
```

```javascript
"dependencies": {
    "@hapiness/core": "^1.2.2",
    "@hapiness/etcd3": "^1.0.0",
    "rxjs", "^5.5.2"
    //...
}
//...
```

[Back to top](#table-of-contents)


### Importing `Etcd3Module` from the library

This module provide an Hapiness extension for Etcd3.
To use it, simply register it during the ```bootstrap``` step of your project and provide the ```Etcd3Ext``` with its config

```javascript

@HapinessModule({
    version: '1.0.0',
    providers: [],
    declarations: [],
    imports: [Etcd3Module]
})
class MyApp implements OnStart {
    constructor() {}
    onStart() {}
}

Hapiness
    .bootstrap(
        MyApp,
        [
            /* ... */
            Etcd3Ext.setConfig(
                {
                    basePath: '/project/root';
                    client: <IOptions> { /* options comes here */};
                }
            )
        ]
    )
    .catch(err => {
        /* ... */
    });

```

The `basePath` key is optional and represents the prefix of all future keys. The default value is `/`.

The `IOptions` interface let you provide config to connect etcd. Allowed fields are:

```javascript
/**
 * Optional client cert credentials for talking to etcd. Describe more
 * {@link https://coreos.com/etcd/docs/latest/op-guide/security.html here},
 * passed into the createSsl function in GRPC
 * {@link http://www.grpc.io/grpc/node/module-src_credentials.html#.createSsl here}.
 */
credentials?: {
    rootCertificate: Buffer;
    privateKey?: Buffer;
    certChain?: Buffer;
},

/**
 * Internal options to configure the GRPC client. These are channel options
 * as enumerated in their [C++ documentation](https://grpc.io/grpc/cpp/group__grpc__arg__keys.html).
 */
grpcOptions?: ChannelOptions,

/**
 * Etcd password auth, if using.
 */
auth?: {
    username: string;
    password: string;
},

/**
 * A list of hosts to connect to. Hosts should include the `https?://` prefix.
 */
hosts: string[] | string,

/**
 * Duration in milliseconds to wait while connecting before timing out.
 * Defaults to 30 seconds.
 */
dialTimeout?: number,

/**
 * Backoff strategy to use for connecting to hosts. Defaults to an
 * exponential strategy, starting at a 500 millisecond
 * retry with a 30 second max.
 */
backoffStrategy?: IBackoffStrategy,

/**
 * Whether, if a query fails as a result of a primitive GRPC error, to retry
 * it on a different server (provided one is available). This can make
 * service disruptions less-severe but can cause a domino effect if a
 * particular operation causes a failure that grpc reports as some sort of
 * internal or network error.
 *
 * Defaults to false.
 */
retry?: boolean

```

[Back to top](#table-of-contents)


### Using `Etcd3` inside your application

To use the `etcd3` module, you need to inject inside your providers the ```Etcd3Service```.

```javascript

class FooProvider {

    constructor(private _etcd3: Etcd3Service) {}

    getValueForKey(key: string): Observable<string | object | Buffer | null | Error> {
    	return this._etcd3.get(key);
    }

}

```

[Back to top](#table-of-contents)


## ```Etcd3Service``` api

```javascript

/**
 *
 * @returns {string} The value of the base path
 *
 */
public get basePath(): string;

/**
 *
 * Retrieve the client without basePath consideration
 *
 * @returns {Namespace} the client for the namespace
 *
 */
public get client(): Namespace;

/**
 *
 * Retrieve the client without basePath consideration
 *
 * @returns {Etcd3} the normal client (without namespace consideration)
 *
 */
public etcd3Client(): Etcd3;

/**
 *
 * Get the value stored at path `key`.
 *
 * @param {string} key The key you want to retrieve the value
 * @param {ResponseFormat} format The format you want for the result (default is string)
 *
 * @returns {string | object | number | Buffer | null | Error} The value of the object stored
 *
 */
public get(key: string, format: ResponseFormat = ResponseFormat.String): Observable<string | object | Buffer | null | Error>;

/**
 *
 * Append the value `value` at path `key`.
 *
 * @param {string} key The key you want to retrieve the value
 * @param {string | Buffer | number} value The format you want for the result (default is string)
 *
 * @returns {IPutResponse} The result of the operation
 *
 */
public put(key: string, value: string | number | Object | Buffer): Observable<IPutResponse>;

/**
 *
 * Create a watcher for a specific key.
 *
 * @param {string} key The key you want to watch
 *
 * @returns {Watcher} The watcher instance created
 *
 */
public createWatcher(key: string): Observable<Watcher>;

/**
 *
 * Create and acquire a lock for a key `key` specifying a ttl.
 * It will automatically contact etcd to keep the connection live.
 * When the connection is broken (end of process or lock released),
 * the TTL is the time after when the lock will be released.
 *
 * @param {string} key The key
 * @param {number} ttl The TTL value in seconds. Default value is 1
 *
 * @returns {Lock} The lock instance created
 *
 */
public acquireLock(key: string, ttl: number = 1): Observable<Lock>;

/******************************************************************************************
 *
 * Lease Operations
 *
 ******************************************************************************************/

/**
 *
 * Create a lease object with a ttl.
 * The lease is automatically keeping alive until it is close.
 *
 * @param {number} ttl The TTL value in seconds. Default value is 1
 *
 * @returns {Lease} The lease instance created
 *
 */
public createLease(ttl: number = 1): Observable<Lease>;

/**
 *
 * Create a lease object with a ttl and attach directly a key-value to it.
 * The lease is automatically keeping alive until it is close.
 *
 * NOTE: Once the lease is closed, the key-value will be destroyed by etcd.
 *
 * @param {string} key The key where to store the value
 * @param {string | Buffer | number} value The value that will be stored at `key` path
 * @param {number} ttl The TTL value in seconds. Default value is 1
 *
 * @returns {Lease} The lease instance created
 *
 */
public createLeaseWithValue(key: string, value: string | Buffer, ttl: number = 1): Observable<Lease>;

```

[Back to top](#table-of-contents)


## Maintainers

<table>
    <tr>
        <td colspan="4" align="center"><a href="https://www.tadaweb.com"><img src="http://bit.ly/2xHQkTi" width="117" alt="tadaweb" /></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil"><img src="https://avatars3.githubusercontent.com/u/6546204?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/antoinegomez"><img src="https://avatars3.githubusercontent.com/u/997028?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/reptilbud"><img src="https://avatars3.githubusercontent.com/u/6841511?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/njl07"><img src="https://avatars3.githubusercontent.com/u/1673977?v=3&s=117" width="117"/></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil">Julien Fauville</a></td>
        <td align="center"><a href="https://github.com/antoinegomez">Antoine Gomez</a></td>
        <td align="center"><a href="https://github.com/reptilbud">Sébastien Ritz</a></td>
        <td align="center"><a href="https://github.com/njl07">Nicolas Jessel</a></td>
    </tr>
</table>

[Back to top](#table-of-contents)

## License

Copyright (c) 2017 **Hapiness** Licensed under the [MIT license](https://github.com/hapinessjs/minio-module/blob/master/LICENSE.md).

[Back to top](#table-of-contents)

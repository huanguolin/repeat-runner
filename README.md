# repeat-runner

[![NPM version](https://img.shields.io/npm/dt/repeat-runner.svg?style=flat)](https://www.npmjs.org/package/repeat-runner)
[![NPM version](https://img.shields.io/npm/v/repeat-runner.svg?style=flat)](https://www.npmjs.org/package/repeat-runner)
[![NPM version](https://img.shields.io/npm/l/repeat-runner.svg?style=flat)](https://www.npmjs.org/package/repeat-runner)

A javascript tool for run repeat code.




# Installing 

```shell
$ npm install repeat-runner
// or
$ npm install repeat-runner --save
```



# Example

Repeat sync code.
```js
import RepeatRunner from 'repeat-runner';

const repeatHello = new RepeatRunner( () => console.log('hello'), 1000);

// start
repeatHello.start();
// stop it at 3s later
repeatHello.stop(1000 * 3);

// result: print 'hello' every second util stop 
/*
hello
hello
hello
*/
```

Repeat async code, just return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Of course, you can use [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) grammar. 
```js
// simple-1
// use Promise only
const repeatAsyncHello = new RepeatRunner( () => {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {
            console.log('async hello');
            resolve();
        }, Math.random() * 5000);
    });
}, 1000);

// simple-2
// with async/await grammar
async function fetchUsers () {
    const userList = await fetch('/users');
    updateUserTable(userList);
}

const autoUpdateUsers = new RepeatRunner(fetchUsers, 20000);

function updateUserTable (userList) {
    /* ... update UI */
}

```



# API

### Create instance  

Syntax
> `new RepeatRunner(execFunction, interval = 0)`   

Parameters
> `execFunction` this function can return a number or promise  
> `interval` (optional, default is 0)

### Instance property & methods

> `RepeatRunner.isRunning` (read-only)     
> `RepeatRunner.prototype.start(delay = -1)`   
> `RepeatRunner.prototype.stop(delay = -1)`      


### Notice

The return value (or `Promise#resolve` parameter) of `execFunction` is use to change interval, and `Promise#reject` use to stop repeat.     
**But accept number only, other types will be discarded.**

For example: 

1. Change the time interval according to the condition.
```js
const INTERVAL = 1000; // 1s
let cnt = 0;

new RepeatRunner( () => {    
    console.log(cnt++);

    if (cnt > 2) {
        return INTERVAL * 2; // next execute, 2s later
    } else {
        return INTERVAL; // next execute, 1s later
    }
}).start();

// result
/*
0  // 0s
1  // 1s
2  // 2s
3  // 4s
4  // 6s
5  // 8s
...
*/
```

2. Change the time interval and stop repeat according to the condition.
```js
const INTERVAL = 1000; // 1s
let cnt = 0;

new RepeatRunner( () => {
    return new Promise( (resolve, reject) => {            
        console.log(cnt++);

        if (cnt > 4) {
            reject(); // stop it 
        } else if (cnt > 2) {
            resolve(INTERVAL * 2); // next execute, 2s later
        } else { 
            resolve(INTERVAL); // next execute, 1s later
        }
    });
}).start();

// result
/*
0  // 0s
1  // 1s
2  // 2s
3  // 4s
4  // 6s, and stop now
*/
```


## Promises

repeat-runner depends on a native ES6 Promise implementation to be [supported](http://caniuse.com/promises).
If your environment doesn't support ES6 Promises, you can [polyfill](https://github.com/jakearchibald/es6-promise).



# License
[MIT](https://opensource.org/licenses/MIT) 
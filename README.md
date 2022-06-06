# repeat-runner

[![Build Status](https://img.shields.io/circleci/project/huanguolin/repeat-runner/master.svg)](https://circleci.com/gh/huanguolin/repeat-runner)
[![Coverage Status](https://img.shields.io/codecov/c/github/Huanguolin/repeat-runner/master.svg)](https://codecov.io/github/Huanguolin/repeat-runner?branch=master)
[![NPM Download](https://img.shields.io/npm/dt/repeat-runner.svg?style=flat)](https://www.npmjs.org/package/repeat-runner)
[![NPM Version](https://img.shields.io/npm/v/repeat-runner.svg?style=flat)](https://www.npmjs.org/package/repeat-runner)
[![NPM License](https://img.shields.io/npm/l/repeat-runner.svg?style=flat)](https://www.npmjs.org/package/repeat-runner)

A javascript tool for run repeat code. 

> 📌 Here is 1.x version, want 0.x doc? [click me](https://github.com/huanguolin/repeat-runner/tree/0.x).


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

// start and stop it 3 seconds later, 
// it's equivalent to:
// repeatHello.start();
// repeatHello.stop(1000 * 3);
repeatHello.start().stop(1000 * 3);

// result: print 'hello' every second util stop 
/*
hello
hello
hello
*/
```

Repeat async code.   
If your code contain async process, and you hope set next repeat after async process complete.
Just make the function return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
Of course, you can use [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) grammar.    
**Notice**: Set third parameter to `true` (see [API](https://github.com/huanguolin/repeat-runner#api)), will make runner stop when `Promise#reject` or any uncatched error .

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



// simple-3
// stop repeat via Promise#reject
let cnt = 0;

new RepeatRunner(counting, 1000, true).start();

function counting () {
    return new Promise( (resolve, reject) => {   
        // print         
        console.log(cnt);
        // plus
        cnt++;

        if (cnt > 4) {
            reject(); // stop it 
        } else { 
            resolve(); 
        }
    });
};

// result
/*
0  // 0s
1  // 1s
2  // 2s
3  // 3s
4  // 4s, and stop now
*/
```



# API

### Create instance  

Syntax
> `new RepeatRunner(execFunction, interval)`   

Parameters
> `execFunction: {function}` this function wrap the code that need repeat  
> `interval: {number}` repeat interval (unit: ms)  
> `stopWhenError: {boolean}` configure whether to allow stop repeat when error occur(default is false)

### Instance property & methods

> `RepeatRunner.isRunning` [read-only] get current status    
> `RepeatRunner.interval` [read/write] get current interval or set new interval        
> `RepeatRunner.execFunc` [read/write] get current `execFunction` or set new `execFunction`    
> `RepeatRunner.lastError` [read-only] get last error that occur in `execFunction`    
> `RepeatRunner.prototype.start(delay = -1)` [return this] start runner  
> `RepeatRunner.prototype.stop(delay = -1)` [return this] stop runner   



## Dependencies

repeat-runner depends on a native ES6 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) implementation to be supported.   
If your environment doesn't support ES6 Promises, you can polyfill ([Promise](https://github.com/jakearchibald/es6-promise)).



# License
[MIT](https://opensource.org/licenses/MIT) 
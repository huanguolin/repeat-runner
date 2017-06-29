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
**Notice**: `Promise#reject` will make it stop repeat.

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
> `new RepeatRunner(execFunction, interval)`   

Parameters
> `execFunction: {function}` this function wrap the code that need repeat  
> `interval: {number}` repeat interval (unit: ms)

### Instance property & methods

> `RepeatRunner.isRunning` [read-only] get current status    
> `RepeatRunner.interval` [read/write] get current interval or set new interval    
> `RepeatRunner.prototype.start(delay = -1)` [return this] start runner  
> `RepeatRunner.prototype.stop(delay = -1)` [return this] stop runner   



## Promises

repeat-runner depends on a native ES6 [Promise](http://es6-features.org/#PromiseUsage) and [WeakMap](http://es6-features.org/#WeakLinkDataStructures) implementation to be supported.   
If your environment doesn't support ES6 Promises, you can polyfill ([Promise](https://github.com/jakearchibald/es6-promise), [Weakmap](https://github.com/Polymer/WeakMap)).



# License
[MIT](https://opensource.org/licenses/MIT) 
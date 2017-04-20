# repeat-runner
A javascript tool for run repeat code.


# Usage

1. Simple
```js
import RepeatRunner from 'repeat-runner';

// create 
const repeatHello = new RepeatRunner( () => console.log('hello'), 1000);

// start
repeatHello.start(); 

// stop
setTimeout(() => repeatHello.stop(), 1000 * 3);

// result: print 'hello' every second util stop 
/*
hello
hello
hello
*/
```

2. Async call
```js
// example 1
const repeatAsyncHello = new RepeatRunner( () => {
    return new Promis( (resolve, reject) => {
        setTimeout( () => {
            console.log('async hello');
            resolve();
        }, Math.random() * 5000);
    });
}, 1000);

// example 2
const usersData = [];
const fetchUsers = () => {
    return fetch('https://example.com/restapi/users').then( list => usersData = list);
};
const autoUpdateUsers = new RepeatRunner(fetchUsers, 20000);
```


# Install 
```shell
$ npm install repeat-runner --save
// or
$ npm install repeat-runner -S
```


# License
[MIT](https://opensource.org/licenses/MIT) 
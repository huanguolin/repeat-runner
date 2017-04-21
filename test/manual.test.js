
import RepeatRunner from '../src/index'; 

let counter = 0;

function delayPrint (msg, delay) {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {
            console.log(`${msg}-${++counter}`);
            resolve();
        }, delay);
    });
}

const repeater = new RepeatRunner( () => delayPrint('hello', 500), 5000);

console.log('isRunning: ' + repeater.isRunning);
repeater.start();
console.log('isRunning: ' + repeater.isRunning);
repeater.stop(1000 *10);
setTimeout( () => {
    console.log('isRunning: ' + repeater.isRunning);
}, 1001 * 10);


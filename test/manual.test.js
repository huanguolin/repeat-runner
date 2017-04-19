
import Repeater from '../index'; 

let counter = 0;

function delayPrint (msg, delay) {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {
            console.log(`${msg}-${++counter}`);
            resolve();
        }, delay);
    });
}

const repeater = new Repeater( () => delayPrint('hello', 500), 5000);

console.log('isRunning: ' + repeater.isRunning);
repeater.start();
console.log('isRunning: ' + repeater.isRunning);
setTimeout( () => {
    repeater.stop();
    console.log('isRunning: ' + repeater.isRunning);
}, 1000 * 10);


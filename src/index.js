/*!
 * RepeatRunner
 * 
 * (c) 2017 Alvin Huang
 * Released under the MIT License.
 */

import 'babel-polyfill';


const _ = new WeakMap();


export default class RepeatRunner {

    /**
     * RepeatRunner constructor function.
     * 
     * @param {function} fn A function wrap the code you want repeat.
     * @param {number} interval The interval time between two repeat run (unit: ms). 
     *                  And you can change it in runtime via "fn" return promise: 
     *                  resolve(interval).
     */
    constructor (fn, interval) {
        // TODO parameter error handle 

        const state = {
            isRunning: false,
            interval,
        };
        const method = {
            repeat: null,
            cancel: null
        };

        method.repeat = () => {
            state.isRunning = true;

            let isCancel = false,
                timerId = -1;

            Promise.resolve(fn())
                .then( (newInterval = state.interval) => {
                    if (isCancel) return;
                    
                    timerId = setTimeout(method.repeat, newInterval);
                    state.interval = newInterval; 
                }).catch( () => state.isRunning = false);

            method.cancel = () => { 
                isCancel = true;
                clearTimeout(timerId);
                
                // update state
                state.isRunning = false;
            };
        };

        _.set(this, { state, method });
    }

    /**
     * Read-only attribute, tell current state is running or stop.
     */
    get isRunning () {
        return _.get(this).state.isRunning;
    }

    /**
     * Start runner.
     */
    start () {
        const isRunning = _.get(this).state.isRunning;
        if (isRunning) return;

        _.get(this).method.repeat();
    }

    /**
     * Stop runner.
     */
    stop () {
        _.get(this).method.cancel();
    }
}
/*!
 * RepeatRunner
 * 
 * (c) 2017 Alvin Huang
 * Released under the MIT License.
 */


const _ = new WeakMap();

class RepeatRunner {

    /**
     * RepeatRunner constructor function.
     * 
     * @param {function} fn A function wrap the code you want repeat.
     * @param {number} interval The interval time between two repeat run (unit: ms). 
     *                  And you can change it in runtime via "fn" return promise: 
     *                  resolve(interval).
     * @return {repeatRunner}
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
                    // TODO parameter error handle 
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
     * 
     * @return {boolean}
     */
    get isRunning () {
        return _.get(this).state.isRunning;
    }

    /**
     * Start runner.
     * 
     * @param {number} delay Optional parameter use to delay start action
     */
    start (delay = -1) {
        const isRunning = _.get(this).state.isRunning;
        if (isRunning) return;

        const fn = _.get(this).method.repeat;
        delay = Number(delay);
        if (Number.isNaN(delay) || delay < 0) {
            fn();
        } else {
            setTimeout(fn, delay);
        }
    }

    /**
     * Stop runner.
     * 
     * @param {number} delay Optional parameter use to delay stop action
     */
    stop (delay = -1) {
        const isRunning = _.get(this).state.isRunning;
        if (!isRunning) return;

        // cancel method may change frequently.
        // so can't just reference it.
        const fs = _.get(this).method;
        delay = Number(delay);
        if (Number.isNaN(delay) || delay < 0) {
            fs.cancel();
        } else {
            // can't reference cancel, see above.
            setTimeout(() => fs.cancel(), delay);
        }
    }
}

export default RepeatRunner;
export { RepeatRunner };
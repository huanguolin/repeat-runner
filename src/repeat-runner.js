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
    constructor (fn, interval = 0) {
        if (typeof fn !== 'function') {
            throw new Error('Frist parameter must be a function.');
        }

        interval = Number(interval);
        interval = interval > 0 ? Math.floor(interval) : 0;

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
                .then( newInterval => {
                    if (isCancel) return;
                    
                    if (typeof newInterval === 'number' && 
                        newInterval >= 0) {
                        state.interval = newInterval; 
                    }
                    timerId = setTimeout(method.repeat, state.interval);
                }).catch( () => method.cancel());

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
     * Read-only attribute, tell current interval.
     * 
     * @return {number}
     */
    get interval () {
        return _.get(this).state.interval;
    }

    /**
     * Start runner.
     * 
     * @param {number} delay Optional parameter use to delay start action
     * @return {this}
     */
    start (delay = -1) {
        const isRunning = _.get(this).state.isRunning;
        if (isRunning) return this;

        const fn = _.get(this).method.repeat;
        delay = Number(delay);
        if (Number.isNaN(delay) || delay < 0) {
            fn();
        } else {
            setTimeout(fn, delay);
        }

        return this;
    }

    /**
     * Stop runner.
     * 
     * @param {number} delay Optional parameter use to delay stop action
     * @return {this}
     */
    stop (delay = -1) {
        const isRunning = _.get(this).state.isRunning;
        if (!isRunning) return this;

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

        return this;
    }
}

export default RepeatRunner;
export { RepeatRunner };
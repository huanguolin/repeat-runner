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
     * @param {number} interval The interval time(unit: ms) between to run next fn.
     *                  You can change it in runtime via repeatRunner#interval.
     * @return {repeatRunner} The instance.
     */
    constructor (fn, interval) {
        if (typeof fn !== 'function') {
            throw new Error('Frist parameter must be a function!');
        }

        interval = Number.parseInt(interval);
        if (Number.isNaN(interval) || interval < 0) {
            throw new Error('Second parmeter must be an non-negative integer number!');
        }

        const state = {
            isRunning: false,
            interval
        };
        const method = {
            repeat: null,
            cancel: null
        };

        method.repeat = () => {
            state.isRunning = true;

            let isCancel = false;
            let timerId = -1;

            Promise.resolve(fn())
                .then(() => {
                    if (isCancel) return;

                    timerId = setTimeout(method.repeat, state.interval);
                }).catch(() => method.cancel());

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
     * @return {boolean} Result.
     */
    get isRunning () {
        return _.get(this).state.isRunning;
    }

    /**
     * Get current interval.
     *
     * @return {number} Result.
     */
    get interval () {
        return _.get(this).state.interval;
    }

    /**
     * Set current interval.
     */
    set interval (val) {
        let v = Number.parseInt(val);
        if (Number.isNaN(v) || v < 0) throw new Error(`Invalid interval: ${val}`);

        _.get(this).state.interval = v;
    }

    /**
     * Start runner.
     *
     * @param {number} delay Optional parameter use to delay start action.
     * @return {this} The reference of this instance.
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
     * @param {number} delay Optional parameter use to delay stop action.
     * @return {this} The reference of this instance.
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

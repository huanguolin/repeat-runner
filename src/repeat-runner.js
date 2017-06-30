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
     * @param {function} func A function wrap the code that you want repeat execute.
     * @param {number} interval The interval time of repeat execute(unit: ms).
     * @param {boolean} stopWhenError Optional, configure whether to allow stop repeat
     *                  when error occur(default is false).
     * @return {repeatRunner} The instance of RepeatRunner.
     */
    constructor (func, interval, stopWhenError = false) {
        if (typeof func !== 'function') {
            throw new Error('Frist parameter must be a function!');
        }

        interval = Number.parseInt(interval);
        if (Number.isNaN(interval) || interval < 0) {
            throw new Error('Second parmeter must be an non-negative integer number!');
        }

        stopWhenError = !!stopWhenError;

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

            // Pass this as parameter for 'func', make the easy way to use
            // this#isRunning, this#interval and this#stop, except this#start.
            Promise.resolve(func(this))
                .then(() => {
                    if (isCancel) return;

                    timerId = setTimeout(method.repeat, state.interval);
                }).catch(() => {
                    if (stopWhenError) {
                        method.cancel();
                    } else {
                        timerId = setTimeout(method.repeat, state.interval);
                    }
                });

            method.cancel = () => {
                isCancel = true;

                // clearTimeout will auto ignore invaid timerId
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

        const repeat = _.get(this).method.repeat;
        delay = Number.parseInt(delay);
        if (Number.isNaN(delay) || delay < 0) {
            repeat();
        } else {
            setTimeout(repeat, delay);
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

        // The method 'cancel' be changed in every cricle.
        // So can not use it directly in some case(see below).
        const methods = _.get(this).method;
        delay = Number.parseInt(delay);
        if (Number.isNaN(delay) || delay < 0) {
            methods.cancel();
        } else {
            // 'cancel' can not be used directly here!
            // If delay > this.interval, 'cancel' must be changed.
            setTimeout(() => methods.cancel(), delay);
        }

        return this;
    }
}

export default RepeatRunner;
export { RepeatRunner };

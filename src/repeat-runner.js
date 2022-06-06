/*!
 * RepeatRunner
 *
 * (c) 2017 Alvin Huang
 * Released under the MIT License.
 */

class RepeatRunner {
    /**
     * RepeatRunner constructor function.
     *
     * @param {function} execFunc A function wrap the code that you want repeat execute.
     * @param {number} interval The interval time of repeat execute(unit: ms).
     * @param {boolean} stopWhenError Optional, configure whether to allow stop repeat
     *                  when error occur(default is false).
     * @return {repeatRunner} The instance of RepeatRunner.
     */
    constructor (execFunc, interval, stopWhenError = false) {
        if (typeof execFunc !== 'function') {
            throw new Error('First parameter must be a function!');
        }

        interval = Number.parseInt(interval);
        if (Number.isNaN(interval) || interval < 0) {
            throw new Error('Second parameter must be an non-negative integer number!');
        }

        stopWhenError = !!stopWhenError;

        this._state = {
            isRunning: false,
            interval,
            lastError: null
        };
        this._method = {
            execFunc,
            repeat: null,
            cancel: null
        };

        this._method.repeat = () => {
            this._state.isRunning = true;

            let isCancel = false;
            let timerId = -1;

            // Pass this as parameter for 'execFunc', make the easy way to use
            // this#isRunning, this#interval and this#stop, except this#start.
            new Promise(resolve => resolve(this._method.execFunc(this)))
                .then(() => {
                    this._state.lastError = null;
                    if (isCancel) return;
                    timerId = setTimeout(this._method.repeat, this._state.interval);
                }).catch(err => {
                    this._state.lastError = err;
                    if (stopWhenError) {
                        this._method.cancel();
                    } else {
                        timerId = setTimeout(this._method.repeat, this._state.interval);
                    }
                });

            this._method.cancel = () => {
                isCancel = true;

                // clearTimeout will auto ignore invalid timerId
                clearTimeout(timerId);

                // update state
                this._state.isRunning = false;
            };
        };
    }

    /**
     * Read-only attribute, tell current state is running or stop.
     *
     * @return {boolean}.
     */
    get isRunning () {
        return this._state.isRunning;
    }

    /**
     * Read-only attribute, tell the last error.
     *
     * @return {Error}.
     */
    get lastError () {
        return this._state.lastError;
    }

    /**
     * Get current interval.
     *
     * @return {number} Result.
     */
    get interval () {
        return this._state.interval;
    }

    /**
     * Set current interval.
     */
    set interval (val) {
        let v = Number.parseInt(val);
        if (Number.isNaN(v) || v < 0) throw new Error(`Invalid interval: ${val}`);

        this._state.interval = v;
    }

    /**
     * Get current 'execFunc'.
     *
     * @return {function} Result.
     */
    get execFunc () {
        return this._method.execFunc;
    }

    /**
     * Set current 'execFunc'.
     */
    set execFunc (val) {
        if (typeof val !== 'function') throw new Error(`Invalid 'execFunc': ${val}`);

        this._method.execFunc = val;
    }

    /**
     * Start runner.
     *
     * @param {number} delay Optional parameter use to delay start action.
     * @return {this} The reference of this instance.
     */
    start (delay = -1) {
        const isRunning = this._state.isRunning;
        if (isRunning) return this;

        const repeat = this._method.repeat;
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
        const isRunning = this._state.isRunning;
        if (!isRunning) return this;

        // The method 'cancel' be changed in every circle.
        // So can not use it directly in some case(see below).
        const methods = this._method;
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

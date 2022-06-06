declare module 'repeat-runner' {
    type ExecFunction = (repeatRunner: RepeatRunner) => void;

    class RepeatRunner {
        /**
         * RepeatRunner constructor function.
         * @param {ExecFunction} execFunction A function wrap the code that you want repeat execute.
         * @param {number} interval The interval time of repeat execute(unit: ms).
         * @param {boolean} stopWhenError Optional, configure whether to allow stop repeat
         *                  when error occur(default is false).
         */
        constructor(execFunction: ExecFunction, interval: number, stopWhenError?: boolean);

        /**
         * Get current status.
         */
        readonly isRunning: boolean;
        /**
         * Get the current interval or set a new interval.
         */
        interval: number;
        /**
         * Get the current execFunction or set a new execFunction.
         */
        execFunction: ExecFunction;
        /**
         * Get the last error that occur in the execFunction.
         */
        readonly lastError: unknown;

        /**
         * Start runner.
         * @param {number} delay Optional parameter use to delay start action.
         */
        start(delay?: number): RepeatRunner;
        /**
         * Stop runner.
         *
         * @param {number} delay Optional parameter use to delay stop action.
         */
        stop(delay?: number): RepeatRunner;
    }

    export default RepeatRunner;
    export { RepeatRunner, ExecFunction };
}

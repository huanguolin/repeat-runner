(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.repeatRunner = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    /*!
     * RepeatRunner
     *
     * (c) 2017 Alvin Huang
     * Released under the MIT License.
     */

    var _ = new WeakMap();

    var RepeatRunner = function () {
        /**
         * RepeatRunner constructor function.
         *
         * @param {function} func A function wrap the code that you want repeat execute.
         * @param {number} interval The interval time of repeat execute(unit: ms).
         * @param {boolean} stopWhenError Optional, configure whether to allow stop repeat
         *                  when error occur(default is false).
         * @return {repeatRunner} The instance of RepeatRunner.
         */
        function RepeatRunner(func, interval) {
            var _this = this;

            var stopWhenError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            _classCallCheck(this, RepeatRunner);

            if (typeof func !== 'function') {
                throw new Error('Frist parameter must be a function!');
            }

            interval = Number.parseInt(interval);
            if (Number.isNaN(interval) || interval < 0) {
                throw new Error('Second parmeter must be an non-negative integer number!');
            }

            stopWhenError = !!stopWhenError;

            var state = {
                isRunning: false,
                interval: interval,
                lastError: null
            };
            var method = {
                repeat: null,
                cancel: null
            };

            method.repeat = function () {
                state.isRunning = true;

                var isCancel = false;
                var timerId = -1;

                // Pass this as parameter for 'func', make the easy way to use
                // this#isRunning, this#interval and this#stop, except this#start.
                new Promise(function (resolve) {
                    return resolve(func(_this));
                }).then(function () {
                    state.lastError = null;
                    if (isCancel) return;
                    timerId = setTimeout(method.repeat, state.interval);
                }).catch(function (err) {
                    state.lastError = err;
                    if (stopWhenError) {
                        method.cancel();
                    } else {
                        timerId = setTimeout(method.repeat, state.interval);
                    }
                });

                method.cancel = function () {
                    isCancel = true;

                    // clearTimeout will auto ignore invaid timerId
                    clearTimeout(timerId);

                    // update state
                    state.isRunning = false;
                };
            };

            _.set(this, { state: state, method: method });
        }

        /**
         * Read-only attribute, tell current state is running or stop.
         *
         * @return {boolean}.
         */


        _createClass(RepeatRunner, [{
            key: 'start',
            value: function start() {
                var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

                var isRunning = _.get(this).state.isRunning;
                if (isRunning) return this;

                var repeat = _.get(this).method.repeat;
                delay = Number.parseInt(delay);
                if (Number.isNaN(delay) || delay < 0) {
                    repeat();
                } else {
                    setTimeout(repeat, delay);
                }

                return this;
            }
        }, {
            key: 'stop',
            value: function stop() {
                var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

                var isRunning = _.get(this).state.isRunning;
                if (!isRunning) return this;

                // The method 'cancel' be changed in every cricle.
                // So can not use it directly in some case(see below).
                var methods = _.get(this).method;
                delay = Number.parseInt(delay);
                if (Number.isNaN(delay) || delay < 0) {
                    methods.cancel();
                } else {
                    // 'cancel' can not be used directly here!
                    // If delay > this.interval, 'cancel' must be changed.
                    setTimeout(function () {
                        return methods.cancel();
                    }, delay);
                }

                return this;
            }
        }, {
            key: 'isRunning',
            get: function get() {
                return _.get(this).state.isRunning;
            }
        }, {
            key: 'lastError',
            get: function get() {
                return _.get(this).state.lastError;
            }
        }, {
            key: 'interval',
            get: function get() {
                return _.get(this).state.interval;
            },
            set: function set(val) {
                var v = Number.parseInt(val);
                if (Number.isNaN(v) || v < 0) throw new Error('Invalid interval: ' + val);

                _.get(this).state.interval = v;
            }
        }]);

        return RepeatRunner;
    }();

    exports.default = RepeatRunner;
    exports.RepeatRunner = RepeatRunner;
});
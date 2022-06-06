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

    var RepeatRunner = function () {
        /**
         * RepeatRunner constructor function.
         *
         * @param {function} execFunc A function wrap the code that you want repeat execute.
         * @param {number} interval The interval time of repeat execute(unit: ms).
         * @param {boolean} stopWhenError Optional, configure whether to allow stop repeat
         *                  when error occur(default is false).
         * @return {repeatRunner} The instance of RepeatRunner.
         */
        function RepeatRunner(execFunc, interval) {
            var _this = this;

            var stopWhenError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            _classCallCheck(this, RepeatRunner);

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
                interval: interval,
                lastError: null
            };
            this._method = {
                execFunc: execFunc,
                repeat: null,
                cancel: null
            };

            this._method.repeat = function () {
                _this._state.isRunning = true;

                var isCancel = false;
                var timerId = -1;

                // Pass this as parameter for 'execFunc', make the easy way to use
                // this#isRunning, this#interval and this#stop, except this#start.
                new Promise(function (resolve) {
                    return resolve(_this._method.execFunc(_this));
                }).then(function () {
                    _this._state.lastError = null;
                    if (isCancel) return;
                    timerId = setTimeout(_this._method.repeat, _this._state.interval);
                }).catch(function (err) {
                    _this._state.lastError = err;
                    if (stopWhenError) {
                        _this._method.cancel();
                    } else {
                        timerId = setTimeout(_this._method.repeat, _this._state.interval);
                    }
                });

                _this._method.cancel = function () {
                    isCancel = true;

                    // clearTimeout will auto ignore invalid timerId
                    clearTimeout(timerId);

                    // update state
                    _this._state.isRunning = false;
                };
            };
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

                var isRunning = this._state.isRunning;
                if (isRunning) return this;

                var repeat = this._method.repeat;
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

                var isRunning = this._state.isRunning;
                if (!isRunning) return this;

                // The method 'cancel' be changed in every circle.
                // So can not use it directly in some case(see below).
                var methods = this._method;
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
                return this._state.isRunning;
            }
        }, {
            key: 'lastError',
            get: function get() {
                return this._state.lastError;
            }
        }, {
            key: 'interval',
            get: function get() {
                return this._state.interval;
            },
            set: function set(val) {
                var v = Number.parseInt(val);
                if (Number.isNaN(v) || v < 0) throw new Error('Invalid interval: ' + val);

                this._state.interval = v;
            }
        }, {
            key: 'execFunc',
            get: function get() {
                return this._method.execFunc;
            },
            set: function set(val) {
                if (typeof val !== 'function') throw new Error('Invalid \'execFunc\': ' + val);

                this._method.execFunc = val;
            }
        }]);

        return RepeatRunner;
    }();

    exports.default = RepeatRunner;
    exports.RepeatRunner = RepeatRunner;
});
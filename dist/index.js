(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.RepeatRunner = mod.exports;
    }
})(this, function (exports) {
    "use strict";

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
         * @param {function} fn A function wrap the code you want repeat.
         * @param {number} interval The interval time between two repeat run (unit: ms). 
         *                  And you can change it in runtime via "fn" return promise: 
         *                  resolve(interval).
         * @return {repeatRunner}
         */
        function RepeatRunner(fn, interval) {
            _classCallCheck(this, RepeatRunner);

            // TODO parameter error handle 

            var state = {
                isRunning: false,
                interval: interval
            };
            var method = {
                repeat: null,
                cancel: null
            };

            method.repeat = function () {
                state.isRunning = true;

                var isCancel = false,
                    timerId = -1;

                Promise.resolve(fn()).then(function () {
                    var newInterval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : state.interval;

                    // TODO parameter error handle 
                    if (isCancel) return;

                    timerId = setTimeout(method.repeat, newInterval);
                    state.interval = newInterval;
                }).catch(function () {
                    return state.isRunning = false;
                });

                method.cancel = function () {
                    isCancel = true;
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
         * @return {boolean}
         */


        _createClass(RepeatRunner, [{
            key: "start",
            value: function start() {
                var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

                var isRunning = _.get(this).state.isRunning;
                if (isRunning) return;

                var fn = _.get(this).method.repeat;
                delay = Number(delay);
                if (Number.isNaN(delay) || delay < 0) {
                    fn();
                } else {
                    setTimeout(fn, delay);
                }
            }
        }, {
            key: "stop",
            value: function stop() {
                var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

                var isRunning = _.get(this).state.isRunning;
                if (!isRunning) return;

                // cancel method may change frequently.
                // so can't just reference it.
                var fs = _.get(this).method;
                delay = Number(delay);
                if (Number.isNaN(delay) || delay < 0) {
                    fs.cancel();
                } else {
                    // can't reference cancel, see above.
                    setTimeout(function () {
                        return fs.cancel();
                    }, delay);
                }
            }
        }, {
            key: "isRunning",
            get: function get() {
                return _.get(this).state.isRunning;
            }
        }]);

        return RepeatRunner;
    }();

    exports.default = RepeatRunner;
    exports.RepeatRunner = RepeatRunner;
});
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
     */


    _createClass(RepeatRunner, [{
        key: "start",


        /**
         * Start runner.
         */
        value: function start() {
            var isRunning = _.get(this).state.isRunning;
            if (isRunning) return;

            _.get(this).method.repeat();
        }

        /**
         * Stop runner.
         */

    }, {
        key: "stop",
        value: function stop() {
            _.get(this).method.cancel();
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
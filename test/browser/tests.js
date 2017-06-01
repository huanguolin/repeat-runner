(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['chai', '../src/repeat-runner'], factory);
    } else if (typeof exports !== "undefined") {
        factory(require('chai'), require('../src/repeat-runner'));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.chai, global.repeatRunner);
        global.repeatRunnerSpec = mod.exports;
    }
})(this, function (_chai, _repeatRunner) {
    'use strict';

    var _chai2 = _interopRequireDefault(_chai);

    var _repeatRunner2 = _interopRequireDefault(_repeatRunner);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var expect = _chai2.default.expect;

    describe('RepeatRunner#constructor', function () {
        it('all right', function () {
            var instance = void 0;

            expect(function () {
                instance = new _repeatRunner2.default(function () {}, 500);
            }).to.not.throw(Error);

            expect(instance).to.have.property('isRunning');
            expect(_typeof(instance.start)).to.be.equal('function');
            expect(_typeof(instance.stop)).to.be.equal('function');
        });

        it('omit second parameter is ok', function () {
            expect(function () {
                return new _repeatRunner2.default(function () {});
            }).to.not.throw(Error);
        });

        it('can not omit all parameter', function () {
            expect(function () {
                return new _repeatRunner2.default();
            }).to.be.throw(Error);
        });

        it('frist parameter should be function', function () {
            // array
            expect(function () {
                return new _repeatRunner2.default([], 500);
            }).to.be.throw(Error);
            // object
            expect(function () {
                return new _repeatRunner2.default({}, 500);
            }).to.be.throw(Error);
            // number
            expect(function () {
                return new _repeatRunner2.default(123, 500);
            }).to.be.throw(Error);
            // string
            expect(function () {
                return new _repeatRunner2.default('abc', 500);
            }).to.be.throw(Error);
            // boolean
            expect(function () {
                return new _repeatRunner2.default(true, 500);
            }).to.be.throw(Error);
        });
    });

    describe('RepeatRunner.interval', function () {
        var INTERVAL = 10;

        it('execFunction return a number can change the interval', function (done) {
            var rr = new _repeatRunner2.default(function () {
                return INTERVAL * 3;
            }, INTERVAL);
            expect(rr.interval === INTERVAL).to.be.true;

            rr.start().stop(1);
            setTimeout(function () {
                if (rr.interval === INTERVAL * 3) done();else done(new Error());
            }, 0);
        });

        it('execFunction return not a number can\'t change the interval', function (done) {
            var rr = new _repeatRunner2.default(function () {
                return '' + INTERVAL * 3;
            }, INTERVAL);
            expect(rr.interval === INTERVAL).to.be.true;

            rr.start().stop(1);
            setTimeout(function () {
                if (rr.interval !== INTERVAL * 3) done();else done(new Error());
            }, 0);
        });

        it('execFunction return Promise#resolve(number) can change the interval also', function (done) {
            var rr = new _repeatRunner2.default(function () {
                return Promise.resolve(INTERVAL * 3);
            }, INTERVAL);
            expect(rr.interval === INTERVAL).to.be.true;

            rr.start().stop(1);
            setTimeout(function () {
                if (rr.interval === INTERVAL * 3) done();else done(new Error());
            }, 0);
        });
    });

    describe('RepeatRunner.isRunning', function () {
        var INTERVAL = 100; // 0.1S
        var instance = void 0,
            cnt = void 0; // eslint-disable-line no-unused-vars

        beforeEach(function () {
            cnt = 0;
            instance = new _repeatRunner2.default(function () {
                // Here can't omit '{}', because arrow function
                // make default return value to be 'cnt++'.
                // It'll change inner interval !!
                cnt++;
            }, INTERVAL);
        });

        afterEach(function () {
            instance.stop();
            instance = null;
        });

        it('not start, should be not running', function () {
            expect(instance.isRunning).to.be.false;
        });

        it('start it and should be running', function () {
            instance.start();
            expect(instance.isRunning).to.be.true;
        });

        it('stop it and should be not running', function () {
            instance.start();
            instance.stop();
            expect(instance.isRunning).to.be.false;
        });

        it('execFunction return Promise#reject can stop it', function (done) {
            instance = new _repeatRunner2.default(function () {
                return Promise.reject(new Error());
            }, INTERVAL);
            instance.start();

            setTimeout(function () {
                if (instance.isRunning) done(new Error());else done();
            }, 0);
        });
    });

    describe('RepeatRunner#start', function () {
        var INTERVAL = 100; // 0.1S
        var instance = void 0,
            cnt = void 0;

        beforeEach(function () {
            cnt = 0;
            instance = new _repeatRunner2.default(function () {
                // Here can't omit '{}', because arrow function
                // make default return value to be 'cnt++'.
                // It'll change inner interval !!
                cnt++;
            }, INTERVAL);
        });

        afterEach(function () {
            instance.stop();
            instance = null;
        });

        it('should return this', function () {
            instance.start();
            expect(instance.start() === instance).to.be.true;
            expect(instance.stop().start() === instance).to.be.true;
        });

        it('interval is ' + INTERVAL + 'ms, run 3*' + INTERVAL + 'ms, \n        the \'execFunction\' should be executed 3 times',
        // here can't use arrow function,
        // see https://mochajs.org/#arrow-functions
        function (done) {
            this.timeout(INTERVAL * 5);

            instance.start();

            setTimeout(function () {
                if (cnt === 3) done();else done(new Error());
            }, INTERVAL * 3);
        });

        it('Runs \'start()\' several times in succession, \n        the same as the once effect', function (done) {
            this.timeout(INTERVAL * 5);

            instance.start();
            instance.start();
            instance.start();

            setTimeout(function () {
                if (cnt === 3) done();else done(new Error());
            }, INTERVAL * 3);
        });

        it('use delay parameter and delay ' + INTERVAL + 'ms, \n        the \'execFunction\' should be executed at ' + INTERVAL + 'ms later', function (done) {
            this.timeout(INTERVAL * 5);

            // before
            expect(cnt === 0).to.be.true;
            expect(instance.isRunning).to.be.false;

            instance.start(INTERVAL);

            // after
            expect(cnt === 0).to.be.true;
            expect(instance.isRunning).to.be.false;

            setTimeout(function () {
                expect(cnt === 0).to.be.true;
                expect(instance.isRunning).to.be.false;
            }, INTERVAL / 2);

            setTimeout(function () {
                if (cnt === 1 && instance.isRunning) done();else done(new Error());
            }, INTERVAL);
        });
    });

    describe('RepeatRunner#stop', function () {
        var INTERVAL = 100; // 0.1S
        var instance = void 0,
            cnt = void 0;

        beforeEach(function () {
            cnt = 0;
            instance = new _repeatRunner2.default(function () {
                // Here can't omit '{}', because arrow function
                // make default return value to be 'cnt++'.
                // It'll change inner interval !!
                cnt++;
            }, INTERVAL);
        });

        afterEach(function () {
            instance.stop();
            instance = null;
        });

        it('should return this', function () {
            expect(instance.start().stop() === instance).to.be.true;
            expect(instance.stop() === instance).to.be.true;
        });

        it('start and stop, the \'execFunction\' \n        should be executed only once', function () {
            instance.start();
            instance.stop();
            expect(cnt === 1).to.be.true;

            cnt = 0;
            instance = new _repeatRunner2.default(function () {
                return cnt++;
            }, 0);
            instance.start();
            instance.stop();
            expect(cnt === 1).to.be.true;
        });

        it('use delay parameter and delay ' + INTERVAL + 'ms, \n        the \'RepeatRunner.isRunning\' should be changed at ' + INTERVAL + 'ms later', function (done) {
            this.timeout(INTERVAL * 5);

            instance.start();

            expect(instance.isRunning).to.be.true;
            instance.stop(INTERVAL);
            expect(instance.isRunning).to.be.true;

            setTimeout(function () {
                expect(instance.isRunning).to.be.true;
            }, INTERVAL / 2);

            setTimeout(function () {
                if (cnt === 1 && !instance.isRunning) done();else done(new Error());
            }, INTERVAL);
        });
    });
});

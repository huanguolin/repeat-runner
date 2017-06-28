import chai from 'chai';
import RepeatRunner from '../src/repeat-runner';

const expect = chai.expect;

describe('RepeatRunner#constructor', () => {
    it('all right', () => {
        let instance;

        expect(() => {
            instance = new RepeatRunner(() => {}, 500);
        }).to.not.throw(Error);

        expect(instance).to.have.property('isRunning');
        expect(typeof instance.start).to.be.equal('function');
        expect(typeof instance.stop).to.be.equal('function');
    });

    it('frist parameter should be function', () => {
        // array
        expect(() => new RepeatRunner([], 500)).to.be.throw(Error);
        // object
        expect(() => new RepeatRunner({}, 500)).to.be.throw(Error);
        // number
        expect(() => new RepeatRunner(123, 500)).to.be.throw(Error);
        // string
        expect(() => new RepeatRunner('abc', 500)).to.be.throw(Error);
        // boolean
        expect(() => new RepeatRunner(true, 500)).to.be.throw(Error);
    });

    it('second parameter should be integer', () => {
        // omit
        expect(() => new RepeatRunner(() => null)).to.be.throw(Error);
        // NaN
        expect(() => new RepeatRunner(() => null, 'abc')).to.be.throw(Error);
        // negative integer
        expect(() => new RepeatRunner(() => null, -1)).to.be.throw(Error);
    });
});

describe('RepeatRunner.interval', () => {
    const INTERVAL = 100; // 0.1S
    let instance,
        cnt; // eslint-disable-line no-unused-vars

    beforeEach(() => {
        cnt = 0;
        instance = new RepeatRunner(() => {
            // Here can't omit '{}', because arrow function
            // make default return value to be 'cnt++'.
            // It'll change inner interval !!
            cnt++;
        }, INTERVAL);
    });

    afterEach(() => {
        instance.stop();
        instance = null;
    });

    it('set valid value, should get same integer value', () => {
        instance.interval = INTERVAL * 3;
        expect(instance.interval === INTERVAL * 3).to.be.true;

        instance.start();
        instance.interval = INTERVAL * 2;
        expect(instance.interval === INTERVAL * 2).to.be.true;
    });

    it('set invalid value, should throw error', () => {
        expect(() => (instance.interval = 'abc')).to.be.throw(Error);
        expect(() => (instance.interval = -5)).to.be.throw(Error);
    });

    it('set valid value and start, two circle later, cnt must be 3',
        function (done) {
            let newInterval = INTERVAL * 0.5;
            instance.interval = newInterval;
            instance.start();
            setTimeout(() => {
                if (cnt === 3) done();
                else done(new Error());
            }, newInterval * 2 + 10);
        });

    it(`set interval = ${INTERVAL * 2} after start, 
        ${INTERVAL * 2 + 1}ms later, cnt must be 2`,
        function (done) {
            instance.start();
            let newInterval = INTERVAL * 2;
            instance.interval = newInterval;
            setTimeout(() => {
                if (cnt === 2) done();
                else done(new Error());
            }, newInterval + 10);
        });
});

describe('RepeatRunner.isRunning', () => {
    const INTERVAL = 100; // 0.1S
    let instance,
        cnt; // eslint-disable-line no-unused-vars

    beforeEach(() => {
        cnt = 0;
        instance = new RepeatRunner(() => {
            // Here can't omit '{}', because arrow function
            // make default return value to be 'cnt++'.
            // It'll change inner interval !!
            cnt++;
        }, INTERVAL);
    });

    afterEach(() => {
        instance.stop();
        instance = null;
    });

    it('not start, should be not running', () => {
        expect(instance.isRunning).to.be.false;
    });

    it('start it and should be running', () => {
        instance.start();
        expect(instance.isRunning).to.be.true;
    });

    it('stop it and should be not running', () => {
        instance.start();
        instance.stop();
        expect(instance.isRunning).to.be.false;
    });

    it('execFunction return Promise#reject can stop it',
        function (done) {
            instance = new RepeatRunner(() => Promise.reject(new Error()), INTERVAL);
            instance.start();

            setTimeout(() => {
                if (instance.isRunning) done(new Error());
                else done();
            }, 0);
        });
});

describe('RepeatRunner#start', () => {
    const INTERVAL = 100; // 0.1S
    let instance,
        cnt;

    beforeEach(() => {
        cnt = 0;
        instance = new RepeatRunner(() => {
            // Here can't omit '{}', because arrow function
            // make default return value to be 'cnt++'.
            // It'll change inner interval !!
            cnt++;
        }, INTERVAL);
    });

    afterEach(() => {
        instance.stop();
        instance = null;
    });

    it(`should return this`, () => {
        instance.start();
        expect(instance.start() === instance).to.be.true;
        expect(instance.stop().start() === instance).to.be.true;
    });

    it(`interval is ${INTERVAL}ms, run 3*${INTERVAL}ms, 
        the 'execFunction' should be executed 3 times`,
        // here can't use arrow function,
        // see https://mochajs.org/#arrow-functions
        function (done) {
            this.timeout(INTERVAL * 5);

            instance.start();

            setTimeout(() => {
                if (cnt === 3) done();
                else done(new Error());
            }, INTERVAL * 3);
        });

    it(`Runs 'start()' several times in succession, 
        the same as the once effect`,
        function (done) {
            this.timeout(INTERVAL * 5);

            instance.start();
            instance.start();
            instance.start();

            setTimeout(() => {
                if (cnt === 3) done();
                else done(new Error());
            }, INTERVAL * 3);
        });

    it(`use delay parameter and delay ${INTERVAL}ms, 
        the 'execFunction' should be executed at ${INTERVAL}ms later`,
        function (done) {
            this.timeout(INTERVAL * 5);

        // before
            expect(cnt === 0).to.be.true;
            expect(instance.isRunning).to.be.false;

            instance.start(INTERVAL);

        // after
            expect(cnt === 0).to.be.true;
            expect(instance.isRunning).to.be.false;

            setTimeout(() => {
                expect(cnt === 0).to.be.true;
                expect(instance.isRunning).to.be.false;
            }, INTERVAL / 2);

            setTimeout(() => {
                if (cnt === 1 && instance.isRunning) done();
                else done(new Error());
            }, INTERVAL);
        });
});

describe('RepeatRunner#stop', () => {
    const INTERVAL = 100; // 0.1S
    let instance,
        cnt;

    beforeEach(() => {
        cnt = 0;
        instance = new RepeatRunner(() => {
            // Here can't omit '{}', because arrow function
            // make default return value to be 'cnt++'.
            // It'll change inner interval !!
            cnt++;
        }, INTERVAL);
    });

    afterEach(() => {
        instance.stop();
        instance = null;
    });

    it(`should return this`, () => {
        expect(instance.start().stop() === instance).to.be.true;
        expect(instance.stop() === instance).to.be.true;
    });

    it(`start and stop, the 'execFunction' 
        should be executed only once`,
        () => {
            instance.start();
            instance.stop();
            expect(cnt === 1).to.be.true;

            cnt = 0;
            instance = new RepeatRunner(() => cnt++, 0);
            instance.start();
            instance.stop();
            expect(cnt === 1).to.be.true;
        });

    it(`use delay parameter and delay ${INTERVAL}ms, 
        the 'RepeatRunner.isRunning' should be changed at ${INTERVAL}ms later`,
        function (done) {
            this.timeout(INTERVAL * 5);

            instance.start();

            expect(instance.isRunning).to.be.true;
            instance.stop(INTERVAL);
            expect(instance.isRunning).to.be.true;

            setTimeout(() => {
                expect(instance.isRunning).to.be.true;
            }, INTERVAL / 2);

            setTimeout(() => {
                if (cnt === 1 && !instance.isRunning) done();
                else done(new Error());
            }, INTERVAL);
        });
});

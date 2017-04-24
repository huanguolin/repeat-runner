import chai from 'chai';
import RepeatRunner from '../src/repeat-runner';

const expect = chai.expect;

describe('RepeatRunner#constructor', () => {

    it('all right', () => {
        let instance;

        expect(() => {
            instance = new RepeatRunner( () => {}, 500);
        }).to.not.throw(Error);

        expect(instance).to.have.property('isRunning');
        expect(typeof instance.start).to.be.equal('function');
        expect(typeof instance.stop).to.be.equal('function');
    });

    it('omit second parameter is ok', () => {
        expect(() => new RepeatRunner( () => {})).to.not.throw(Error);
    });
    
    it('can not omit all parameter', () => {
        expect(() => new RepeatRunner()).to.be.throw(Error);
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

}); 

describe('RepeatRunner.isRunning', () => {

    const INTERVAL = 100; //0.1S
    let instance, 
        cnt;

    beforeEach( () => {
        cnt = 0;
        instance = new RepeatRunner( () => cnt++, INTERVAL); 
    });

    afterEach( () => {
        instance.stop();
        instance = null;
    });


    it('not start, should be running', () => {
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

    it(`start and stop, the 'execFunction' 
        should be executed at least once`, 
        () => {
        instance.start();
        instance.stop();
        expect(cnt > 0).to.be.true;
    });

    it(`interval is ${INTERVAL}ms, run 3*${INTERVAL}ms, 
        the 'execFunction' should be executed 1+3 times`, 
        done => {
        console.log('start: ', cnt);
        instance.start();

        setTimeout( () => {
            instance.stop();
            console.log('stop: ', cnt);

            if (cnt === 4) done();
            else done(new Error());
        }, INTERVAL * 3);
    });

}); 
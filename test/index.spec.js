import chai from 'chai';
import Repeater from '../index';

const expect = chai.expect;

describe('Repeater basic', () => {

    function delayPrint (msg, delay) {
        return new Promise( (resolve, reject) => {
            setTimeout( () => {
                console.log(msg);
                resolve(delay);
            }, delay);
        });
    }

    let repeater;

    beforeEach( () => {
        repeater = new Repeater( () => { 
            return delayPrint('hello', 500); 
        }, 1000);
    });

    it('loop', () => {
        repeater.start();
        expect(repeater.isRunning).to.be.true;
    });

}); 


const _ = new WeakMap();

class Repeater {

    constructor (fn, interval) {
        // TODO parameter error handle 

        const state = {
            isRunning: false,
            interval,
        };
        let cancel;

        const repeat = () => {
            state.isRunning = true;

            let isCancel = false,
                timerId = -1;
            fn.then( (newInterval = state.interval) => {
                if (isCancel) return;
                
                timerId = setTimeout(repeat, newInterval);
                state.interval = newInterval; 
            }).catch( () => state.isRunning = false);

            cancel = () => { 
                isCancel = true;
                clearTimeout(timerId);
                
                // update state
                state.isRunning = false;
            };
        };

        _.set(this, { state, repeat, cancel });
    }

    start () {
        const isRunning = _.get(this).state.isRunning;
        if (isRunning) return;

        _.get(this).repeat();
    }

    stop () {
        _.get(this).cancel();
    }
}
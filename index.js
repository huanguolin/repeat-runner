
const _ = new WeakMap();

export default class RepeatRunner {

    constructor (fn, interval) {
        // TODO parameter error handle 

        const state = {
            isRunning: false,
            interval,
        };
        const method = {
            repeat: null,
            cancel: null
        };

        method.repeat = () => {
            state.isRunning = true;

            let isCancel = false,
                timerId = -1;
            fn().then( (newInterval = state.interval) => {
                if (isCancel) return;
                
                timerId = setTimeout(method.repeat, newInterval);
                state.interval = newInterval; 
            }).catch( () => state.isRunning = false);

            method.cancel = () => { 
                isCancel = true;
                clearTimeout(timerId);
                
                // update state
                state.isRunning = false;
            };
        };

        _.set(this, { state, method });
    }

    get isRunning () {
        return _.get(this).state.isRunning;
    }

    start () {
        const isRunning = _.get(this).state.isRunning;
        if (isRunning) return;

        _.get(this).method.repeat();
    }

    stop () {
        _.get(this).method.cancel();
    }
}
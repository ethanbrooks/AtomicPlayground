/*
 *  Pure Ecmascript eventloop example.
 *  Original Version: https://github.com/svaarala/duktape/blob/master/examples/eventloop/ecma_eventloop.js
 *
 *  Timer state handling is inefficient in this trivial example.  Timers are
 *  kept in an array sorted by their expiry time which works well for expiring
 *  timers, but has O(n) insertion performance.  A better implementation would
 *  use a heap or some other efficient structure for managing timers so that
 *  all operations (insert, remove, get nearest timer) have good performance.
 *
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Timers
 *
 *  CHANGES
 *  TSH - 19-Aug 2015
 *      - Removed EventLoop.run as it was looking at Sockets which Atomic doesn't provide.  Now, the Atomic update/afterUpdate manually calls the eventloop processTimers method
 *      - Modified the way that setTimeout,clearTimeout,setInterval,clearInterval are loaded into global scope
 *      - TODO: replace the array of timers with a Heap of timers ordered by expiration time..should be more performant that way
 *      - TODO: figure out a way to not need to use Date.now() and instead use the timeStep coming in from the Update method
 */

/*
 *  Event loop
 *
 *  Timers are sorted by 'target' property which indicates expiry time of
 *  the timer.  The timer expiring next is last in the array, so that
 *  removals happen at the end, and inserts for timers expiring in the
 *  near future displace as few elements in the array as possible.
 */

EventLoop = {
    currentTime: 0,     // Current timer in the system.  Need to make sure this doesn't overflow
    // timers
    timers: [],         // active timers, sorted (nearest expiry last)
    expiring: null,     // set to timer being expired (needs special handling in clearTimeout/clearInterval)
    nextTimerId: 1,
    minimumDelay: 1,
    minimumWait: 1,
    maximumWait: 60000,
    maxExpirys: 10,

    // sockets
    socketListening: {},  // fd -> callback
    socketReading: {},    // fd -> callback
    socketConnecting: {}, // fd -> callback

    // misc
    exitRequested: false
};

EventLoop.dumpState = function() {
    print('TIMER STATE:');
    this.timers.forEach(function(t) {
        print('    ' + Duktape.enc('jx', t));
    });
    if (this.expiring) {
        print('    EXPIRING: ' + Duktape.enc('jx', this.expiring));
    }
}

// Get timer with lowest expiry time.  Since the active timers list is
// sorted, it's always the last timer.
EventLoop.getEarliestTimer = function() {
    var timers = this.timers;
    n = timers.length;
    return (n > 0 ? timers[n - 1] : null);
}

EventLoop.getEarliestWait = function() {
    var t = this.getEarliestTimer();
    return (t ? t.target - Date.now() : null);
}

EventLoop.insertTimer = function(timer) {
    var timers = this.timers;
    var i, n, t;

    /*
     *  Find 'i' such that we want to insert *after* timers[i] at index i+1.
     *  If no such timer, for-loop terminates with i-1, and we insert at -1+1=0.
     */

    n = timers.length;
    for (i = n - 1; i >= 0; i--) {
        t = timers[i];
        if (timer.target <= t.target) {
            // insert after 't', to index i+1
            break;
        }
    }

    timers.splice(i + 1 /*start*/, 0 /*deleteCount*/, timer);
}

// Remove timer/interval with a timer ID.  The timer/interval can reside
// either on the active list or it may be an expired timer (this.expiring)
// whose user callback we're running when this function gets called.
EventLoop.removeTimerById = function(timer_id) {
    var timers = this.timers;
    var i, n, t;

    t = this.expiring;
    if (t) {
        if (t.id === timer_id) {
            // Timer has expired and we're processing its callback.  User
            // callback has requested timer deletion.  Mark removed, so
            // that the timer is not reinserted back into the active list.
            // This is actually a common case because an interval may very
            // well cancel itself.
            t.removed = true;
            return;
        }
    }

    n = timers.length;
    for (i = 0; i < n; i++) {
        t = timers[i];
        if (t.id === timer_id) {
            // Timer on active list: mark removed (not really necessary, but
            // nice for dumping), and remove from active list.
            t.removed = true;
            this.timers.splice(i /*start*/, 1 /*deleteCount*/);
            return;
        }
    }

   // no such ID, ignore
}

EventLoop.processTimers = function() {
    var now = Date.now();
    var timers = this.timers;
    var sanity = this.maxExpirys;
    var n, t;

    /*
     *  Here we must be careful with mutations: user callback may add and
     *  delete an arbitrary number of timers.
     *
     *  Current solution is simple: check whether the timer at the end of
     *  the list has expired.  If not, we're done.  If it has expired,
     *  remove it from the active list, record it in this.expiring, and call
     *  the user callback.  If user code deletes the this.expiring timer,
     *  there is special handling which just marks the timer deleted so
     *  it won't get inserted back into the active list.
     *
     *  This process is repeated at most maxExpirys times to ensure we don't
     *  get stuck forever; user code could in principle add more and more
     *  already expired timers.
     */

    while (sanity-- > 0) {
        // If exit requested, don't call any more callbacks.  This allows
        // a callback to do cleanups and request exit, and can be sure that
        // no more callbacks are processed.

        if (this.exitRequested) {
            //print('exit requested, exit');
            break;
        }

        // Timers to expire?

        n = timers.length;
        if (n <= 0) {
            break;
        }
        t = timers[n - 1];
        if (now <= t.target) {
            // Timer has not expired, and no other timer could have expired
            // either because the list is sorted.
            break;
        }
        timers.pop();

        // Remove the timer from the active list and process it.  The user
        // callback may add new timers which is not a problem.  The callback
        // may also delete timers which is not a problem unless the timer
        // being deleted is the timer whose callback we're running; this is
        // why the timer is recorded in this.expiring so that clearTimeout()
        // and clearInterval() can detect this situation.

        if (t.oneshot) {
            t.removed = true;  // flag for removal
        } else {
            t.target = now + t.delay;
        }
        this.expiring = t;
        try {
            t.cb();
        } catch (e) {
            print('timer callback failed, ignored: ' + e);
        }
        this.expiring = null;

        // If the timer was one-shot, it's marked 'removed'.  If the user callback
        // requested deletion for the timer, it's also marked 'removed'.  If the
        // timer is an interval (and is not marked removed), insert it back into
        // the timer list.

        if (!t.removed) {
            // Reinsert interval timer to correct sorted position.  The timer
            // must be an interval timer because one-shot timers are marked
            // 'removed' above.
            this.insertTimer(t);
        }
    }
}

EventLoop.requestExit = function() {
    this.exitRequested = true;
}

EventLoop.server = function(address, port, cb_accepted) {
    var fd = Socket.createServerSocket(address, port);
    this.socketListening[fd] = cb_accepted;
}

EventLoop.connect = function(address, port, cb_connected) {
    var fd = Socket.connect(address, port);
    this.socketConnecting[fd] = cb_connected;
}

EventLoop.close = function(fd) {
    delete this.socketReading[fd];
    delete this.socketListening[fd];
}

EventLoop.setReader = function(fd, cb_read) {
    this.socketReading[fd] = cb_read;
}

EventLoop.write = function(fd, data) {
    // This simple example doesn't have support for write blocking / draining
    var rc = Socket.write(fd, Duktape.Buffer(data));
}


/*
 *  Timer API
 *
 *  These interface with the singleton EventLoop.
 */

function setTimeout(func, delay) {
    var cb_func;
    var bind_args;
    var timer_id;
    var evloop = EventLoop;

    if (typeof delay !== 'number') {
        throw new TypeError('delay is not a number');
    }
    delay = Math.max(evloop.minimumDelay, delay);

    if (typeof func === 'string') {
        // Legacy case: callback is a string.
        cb_func = eval.bind(this, func);
    } else if (typeof func !== 'function') {
        throw new TypeError('callback is not a function/string');
    } else if (arguments.length > 2) {
        // Special case: callback arguments are provided.
        bind_args = Array.prototype.slice.call(arguments, 2);  // [ arg1, arg2, ... ]
        bind_args.unshift(this);  // [ global(this), arg1, arg2, ... ]
        cb_func = func.bind.apply(func, bind_args);
    } else {
        // Normal case: callback given as a function without arguments.
        cb_func = func;
    }

    timer_id = evloop.nextTimerId++;

    evloop.insertTimer({
        id: timer_id,
        oneshot: true,
        cb: cb_func,
        delay: delay,
        target: Date.now() + delay
    });

    return timer_id;
}

function clearTimeout(timer_id) {
    var evloop = EventLoop;

    if (typeof timer_id !== 'number') {
        throw new TypeError('timer ID is not a number');
    }
    evloop.removeTimerById(timer_id);
}

function setInterval(func, delay) {
    var cb_func;
    var bind_args;
    var timer_id;
    var evloop = EventLoop;

    if (typeof delay !== 'number') {
        throw new TypeError('delay is not a number');
    }
    delay = Math.max(evloop.minimumDelay, delay);

    if (typeof func === 'string') {
        // Legacy case: callback is a string.
        cb_func = eval.bind(this, func);
    } else if (typeof func !== 'function') {
        throw new TypeError('callback is not a function/string');
    } else if (arguments.length > 2) {
        // Special case: callback arguments are provided.
        bind_args = Array.prototype.slice.call(arguments, 2);  // [ arg1, arg2, ... ]
        bind_args.unshift(this);  // [ global(this), arg1, arg2, ... ]
        cb_func = func.bind.apply(func, bind_args);
    } else {
        // Normal case: callback given as a function without arguments.
        cb_func = func;
    }

    timer_id = evloop.nextTimerId++;

    evloop.insertTimer({
        id: timer_id,
        oneshot: false,
        cb: cb_func,
        delay: delay,
        target: Date.now() + delay
    });

    return timer_id;
}

function clearInterval(timer_id) {
    var evloop = EventLoop;

    if (typeof timer_id !== 'number') {
        throw new TypeError('timer ID is not a number');
    }
    evloop.removeTimerById(timer_id);
}

/* custom call */
function requestEventLoopExit() {
    EventLoop.requestExit();
}

(function(global){

    global.setInterval = global.setInterval || setInterval;
    global.clearInterval = global.clearInterval || clearInterval;
    global.setTimeout = global.setTimeout || setTimeout;
    global.clearTimeout = global.clearTimeout || clearTimeout;
    global.requestEventLoopExit = global.requestEventLoopExit || requestEventLoopExit;


})(new Function('return this')());

module.exports = EventLoop;

'use strict';
'atomic component';
import * as triggerEvent from 'atomicTriggerEvent';
import * as metrics from 'metricsGatherer';
import gameState from '../../Modules/gameState';
import CustomJSComponent from 'CustomJSComponent';

class PlayerActions {
    static NO_ACTION = 0;
    static MOVE_LEFT = 1;
    static MOVE_RIGHT = 2;
    static MOVE_UP = 3;
    static MOVE_DOWN = 4;
    static SKIP_TURN = 5;
    static DUMP_METRICS = 6;
}

export default class PlayerInputHandler extends CustomJSComponent {

    inspectorFields = {
        debug: false
    };

    /**
     * Are we idle, waiting for an action?
     */
    idle = false;

    keymap = {
        [PlayerActions.MOVE_LEFT]: [Atomic.KEY_LEFT, Atomic.KEY_H, Atomic.KEY_A],
        [PlayerActions.MOVE_RIGHT]: [Atomic.KEY_RIGHT, Atomic.KEY_L, Atomic.KEY_D],
        [PlayerActions.MOVE_UP]: [Atomic.KEY_UP, Atomic.KEY_K, Atomic.KEY_W],
        [PlayerActions.MOVE_DOWN]: [Atomic.KEY_DOWN, Atomic.KEY_J, Atomic.KEY_S],
        [PlayerActions.SKIP_TURN]: [Atomic.KEY_SPACE],
        [PlayerActions.DUMP_METRICS]: [Atomic.KEY_0]
    };

    getCurrentAction() {
        let input = Atomic.input,
            keymap = this.keymap;
        for (let action in keymap) {
            let keys = keymap[action];
            if (keys && keys.length) {
                for (let i = 0; i < keys.length; i++) {
                    if (gameState.getCurrentLevel().turnBased) {
                        if (input.getKeyPress(keys[i])) {
                            return parseInt(action);
                        }
                    } else {
                        if (input.getKeyDown(keys[i])) {
                            return parseInt(action);
                        }
                    }
                }
            }
        }
        return PlayerActions.NO_ACTION;
    }

    /**
     * On the start of our turn, we want to start listening for player commands
     */
    onActionBegin() {
        this.idle = true;
    }

    update( /*timeStep*/) {
        if (!gameState.getCurrentLevel().isGameOver && this.idle) {
            let action = this.getCurrentAction();
            if (action !== PlayerActions.NO_ACTION) {
                this.idle = false;
                switch (action) {
                    case PlayerActions.MOVE_LEFT:
                        this.DEBUG('Processing Action: move left');
                        triggerEvent.trigger(this.node, 'onTryMove', [-1, 0]);
                        break;
                    case PlayerActions.MOVE_RIGHT:
                        this.DEBUG('Processing Action: move right');
                        triggerEvent.trigger(this.node, 'onTryMove', [1, 0]);
                        break;
                    case PlayerActions.MOVE_UP:
                        this.DEBUG('Processing Action: move up');
                        triggerEvent.trigger(this.node, 'onTryMove', [0, 1]);
                        break;
                    case PlayerActions.MOVE_DOWN:
                        this.DEBUG('Processing Action: move down');
                        triggerEvent.trigger(this.node, 'onTryMove', [0, -1]);
                        break;
                    case PlayerActions.SKIP_TURN:
                        this.DEBUG('Processing Action: skip turn');
                        triggerEvent.trigger(this.node, 'onSkipTurn');
                        break;
                    case PlayerActions.DUMP_METRICS:
                        this.DEBUG('Processing Action: dump metrics');
                        metrics.dumpMetrics();
                        this.idle = true;
                        break;

                    default:
                        this.idle = true;
                        break;
                }
            }
        }
    }

    DEBUG(msg) {
        if (this.debug) {
            console.log(`PlayerInputHandler: ${msg}`);
        }
    }

}

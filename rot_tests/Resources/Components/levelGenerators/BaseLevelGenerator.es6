'use strict';
// 'noatomic component'; -- don't want to expose to the editor since this is more like an abstract base class
import * as triggerEvent from 'atomicTriggerEvent';
export default class BaseLevelGenerator extends Atomic.JSComponent {
    inspectorFields = {
        width: 80,
        height: 25
    };
    mapData = null;

    start() {
        this.generateLevel();
    }

    generateLevel() {
        this.mapData = this.buildMap();
        triggerEvent.trigger(this.node, 'onLevelGenerated', this.mapData);
        return this.mapData;
    }

    /** overridable */
    buildMap() {
        console.log('should not be called');
    }
}

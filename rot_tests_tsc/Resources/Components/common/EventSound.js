'use strict';
'atomic component';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var CustomJSComponent_1 = require("CustomJSComponent");
//import * as triggerEvent from 'atomicTriggerEvent';
/*
 * This component will listen for an event and play the mapped sound.  You must
 * use the trigger method in the atomicTriggerEvent and send the appropriate event name.
 * this component listens to all events on a node and only responds when there is a match.
 * eventMap example:
 * @example
 * eventMap: {
 *   onOpen: 'Sounds/customsound.ogg'
 *   onClose: 'Sounds/customsound2.ogg'
 * }
 */
var EventSound = (function (_super) {
    __extends(EventSound, _super);
    function EventSound() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inspectorFields = {
            debug: false,
            eventMessage01: [Atomic.VariantType.VAR_STRING],
            eventSound01: ['Sound'],
            eventMessage02: [Atomic.VariantType.VAR_STRING],
            eventSound02: ['Sound'],
            eventMessage03: [Atomic.VariantType.VAR_STRING],
            eventSound03: ['Sound'],
            eventMessage04: [Atomic.VariantType.VAR_STRING],
            eventSound04: ['Sound'],
        };
        _this.eventMap = {};
        return _this;
    }
    EventSound.prototype.mapEventToMap = function (eventMessage, eventSound) {
        if (eventMessage) {
            this.eventMap[eventMessage] = eventSound;
        }
    };
    EventSound.prototype.start = function () {
        this.soundSource = this.node.createComponent('SoundSource');
        //this.soundSource.soundType = Atomic.SOUND_EFFECT;
        this.soundSource.gain = 0.75;
        this.mapEventToMap(this.eventMessage01, this.eventSound01);
        this.mapEventToMap(this.eventMessage02, this.eventSound02);
        this.mapEventToMap(this.eventMessage03, this.eventSound03);
        this.mapEventToMap(this.eventMessage04, this.eventSound04);
    };
    EventSound.prototype.onAny = function (eventName) {
        var sound = this.eventMap[eventName];
        if (sound) {
            this.DEBUG("Playing sound for event: " + eventName);
            this.soundSource.play(sound);
        }
    };
    return EventSound;
}(CustomJSComponent_1.default));
exports.default = EventSound;

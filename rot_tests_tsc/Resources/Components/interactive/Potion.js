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
var triggerEvent = require("atomicTriggerEvent");
var CustomJSComponent_1 = require("CustomJSComponent");
var Potion = (function (_super) {
    __extends(Potion, _super);
    function Potion() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inspectorFields = {
            debug: false,
            addHealth: 0,
            drinkSound: ['Sound'],
            drinkMessage: 'You feel healthier!'
        };
        _this.addHealth = 0;
        return _this;
    }
    Potion.prototype.onBump = function (bumperComponent, bumperNode) {
        this.DEBUG("Bumped by: " + bumperComponent.node.name + " ");
        if (this.addHealth !== 0) {
            triggerEvent.trigger(bumperNode, 'onAdjustHealth', this.addHealth);
        }
        if (this.drinkSound) {
            var soundSource = this.node.createComponent('SoundSource');
            // TODO: Atomic.SOUND_EFFECT is undefined
            // soundSource.soundType = Atomic.SOUND_EFFECT;
            soundSource.gain = 0.75;
            var sound = this.drinkSound;
            soundSource.play(sound);
            soundSource.autoRemoveMode = Atomic.AutoRemoveMode.REMOVE_COMPONENT;
        }
        // Not sure how to make a sprite invisible, so just make it too small to see
        this.node.scale2D = [0, 0];
        triggerEvent.trigger(bumperNode, 'onLogAction', this.drinkMessage);
    };
    Potion.prototype.update = function () {
        var soundSource = this.node.getComponent('SoundSource');
        if (soundSource) {
            if (!soundSource.isPlaying()) {
                triggerEvent.trigger(this.node, 'onDestroy');
                Atomic.destroy(this.node);
            }
        }
    };
    return Potion;
}(CustomJSComponent_1.default));
exports.default = Potion;

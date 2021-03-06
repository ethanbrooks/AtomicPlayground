"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameState = (function () {
    function GameState() {
    }
    GameState.prototype.getCurrentLevel = function () {
        return this._level;
    };
    GameState.prototype.setCurrentLevel = function (level) {
        this._level = level;
    };
    GameState.prototype.getCurrentLevelRenderer = function () {
        return this._levelRenderer;
    };
    GameState.prototype.setCurrentLevelRenderer = function (levelRenderer) {
        this._levelRenderer = levelRenderer;
    };
    return GameState;
}());
exports.GameState = GameState;
var gameState = new GameState();
exports.default = gameState;

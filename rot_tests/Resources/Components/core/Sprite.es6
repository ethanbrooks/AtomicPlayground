'use strict';

var game = Atomic.game;
var node = self.node;

var defaultBlueprint = {
    spriteSheet: null,
    spriteName: null,
    spriteTexture: null,
    blendMode: Atomic.BLEND_ALPHA,
    orderInLayer: 0,
    scale: [1, 1],
    color: [1, 1, 1, 1],
    debug: false
};

// Initialize the blueprint here for elements that need to happen prior to start
var blueprint = node.getComponentBlueprint(self, defaultBlueprint);
/**
 * Perform any setup required before the first start iteration
 */
(function () {
    // add a sprite component to our node
    var sprite2D = node.Sprite2D = node.createComponent("StaticSprite2D");
    sprite2D.blendMode = blueprint.blendMode;
    sprite2D.orderInLayer = blueprint.orderInLayer;

    // are we a spritesheet or a sprite texture
    if (blueprint.spriteSheet) {
        if (blueprint.debug) {
            print(`Loading spritesheet named: ${blueprint.spriteSheet} `);
        }
        var sheet = game.getSpriteSheet(blueprint.spriteSheet);
        if (blueprint.spriteName) {
            if (blueprint.debug) {
                print(`Loading sprite named: ${blueprint.spriteName} `);
            }
            var sprite = sheet.getSprite(blueprint.spriteName);
            sprite2D.sprite = sheet.getSprite(blueprint.spriteName);
        }
    }

    if (blueprint.spriteTexture) {
        if (blueprint.debug) {
            print(`Loading sprite texture: ${blueprint.spriteTexture} `);
        }
        sprite2D.sprite = game.getSprite2D(blueprint.spriteTexture);
    }

    sprite2D.setColor(blueprint.color);

    node.scale2D = blueprint.scale;

}());
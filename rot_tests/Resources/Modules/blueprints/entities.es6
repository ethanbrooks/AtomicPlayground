export const entities = {

    entity_base: {
        Entity: { }
    },

    actor: {
        inherits: 'entity_base',
        Entity: {
            blocksPath: true,
            blocksLight: false,
            bumpable: true
        }
    },


    hero: {
        inherits: 'actor',
        StaticSprite2D: {
            sprite: 'Sprites/hero_0.png',
            orderInLayer: 12
        },
        PlayerInputHandler: {
            debug: true
        },
        PointLight2D: {
            castShadows: true,
            radius: 2,
            numRays: 64,
            color: [0.9, 0.7, 0.5, 0.7],
            backtrace: true
        },
        LightFlicker: {
            baseRange: 2,
            speed: 0.2
        },
        Mover: {
            usePhysics: false,
            speed: 3
        }
    },

    // doesn't work -- here for future research
    physicsHero: {
        inherits: 'hero',
        CollisionBox2D: {
            density: 19.0,
            friction: 15.0,
            restitution: 0.1,
            size: [7 * Atomic.PIXEL_SIZE, 7 * Atomic.PIXEL_SIZE]
        },
        RigidBody2D: {
            allowSleep: true,
            bodyType: Atomic.BT_STATIC,
            bullet: false,
            castShadows: false,
            fixedRotation: true,
            linearVelocity: [0,0],
            mass: 50
        }
    },

    fred: {
        inherits: 'actor',
        Mover: {
            usePhysics: false,
            speed: 3
        },
        StaticSprite2D: {
            sprite: 'Sprites/rodent0_10.png',
            orderInLayer: 12
        },
        MonsterAi: {

        }
    },

    // placeholder
    door: {
        Entity: {
            blocksPath: true,
            blocksLight: true,
            bumpable: true
        },
        StaticSprite2D: {
            sprite: 'Sprites/door_ns_c.png',
            orderInLayer: 10
        },
        RigidBody2D: {
            bodyType:Atomic.BT_STATIC,
            castShadows: true
        },
        CollisionBox2D: {
            size: [16 * Atomic.PIXEL_SIZE, 16 * Atomic.PIXEL_SIZE]
        },
        Door: {
            debug: true
        }
    },
    door_ns: {
        inherits: 'door',
        Door: {
            open: false,
            openSprite: 'Sprites/door_ns_o.png',
            closedSprite: 'Sprites/door_ns_c.png'
        }
    },
    door_ew: {
        inherits: 'door',
        Door: {
            open: false,
            openSprite: 'Sprites/door_ew_o.png',
            closedSprite: 'Sprites/door_ew_c.png'
        }
    }

};

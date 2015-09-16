export const entities = {

    entity_base: {
        Entity: { }
    },

    actor: {
        inherits: 'entity_base',
        RigidBody2D: {
            bodyType:Atomic.BT_STATIC,
            castShadows: false
        },
        CollisionBox2D: {
            size: [7 * Atomic.PIXEL_SIZE, 7 * Atomic.PIXEL_SIZE]
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
        CollisionBox2D: {
            friction: 15.0,
            density: 19.0,
            restitution: 0.1
        },
        RigidBody2D: {
            linearVelocity: [0,0],
            allowSleep: true,
            bodyType: Atomic.BT_STATIC,
            mass: 50,
            bullet: false,
            fixedRotation: true
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

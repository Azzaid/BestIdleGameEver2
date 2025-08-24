import * as PIXI from 'pixi.js';

export type EntityId = number;
export type Vector2 = { x: number; y: number };

export interface WorldConfig {
    battlefieldWidth: number;   // world units
    battlefieldHeight: number;  // world units
    wallY: number;              // world Y where melee enemies apply pressure
    app: PIXI.Application;
}

export interface World {
    nextEntityId: number;
    config: WorldConfig;

    // Components
    transforms: Map<EntityId, Transform>;
    movementWander: Map<EntityId, MovementWander>;
    movementLinear: Map<EntityId, MovementLinear>;
    lifespans: Map<EntityId, Lifespan>;
    healths: Map<EntityId, Health>;
    towersData: Map<EntityId, TowerData>;
    weaponsData: Map<EntityId, WeaponData>;
    enemiesData: Map<EntityId, EnemyData>;

    // Role tags
    roles: {
        enemies: Set<EntityId>;
        towers: Set<EntityId>;
        projectiles: Set<EntityId>;
    };

    // View (Pixi)
    worldLayer: PIXI.Container;          // camera container adds this
    sprites: Map<EntityId, PIXI.DisplayObject>;

    // Housekeeping
    toRemove: Set<EntityId>;
}

// --- Components (imported types) ---
import { Transform } from '../components/transform';
import { MovementWander, MovementLinear } from '../components/movement';
import { Lifespan } from '../components/lifespan';
import { Health } from '../components/health';
import { TowerData } from '../components/tower';
import { WeaponData } from '../components/weapon';
import { EnemyData } from '../components/enemy';

export function createWorld(config: WorldConfig): World {
    const worldLayer = new PIXI.Container();
    worldLayer.sortableChildren = true;

    return {
        nextEntityId: 1,
        config,
        transforms: new Map(),
        movementWander: new Map(),
        movementLinear: new Map(),
        lifespans: new Map(),
        healths: new Map(),
        towersData: new Map(),
        weaponsData: new Map(),
        enemiesData: new Map(),
        roles: {
            enemies: new Set(),
            towers: new Set(),
            projectiles: new Set(),
        },
        worldLayer,
        sprites: new Map(),
        toRemove: new Set(),
    };
}

export function createEntityId(world: World): EntityId {
    const id = world.nextEntityId++;
    return id;
}

/** Utility: iterate entities present in all provided maps */
export function* withAll(
    ...maps: { has(id: EntityId): boolean; keys(): IterableIterator<EntityId> }[]
): Generator<EntityId> {
    if (maps.length === 0) return;
    const [first, ...rest] = maps;
    for (const id of first.keys()) {
        let ok = true;
        for (const m of rest) if (!m.has(id)) { ok = false; break; }
        if (ok) yield id;
    }
}

import { SpriteInfo } from './spriteInfo.ts';
import { EnemyKind } from './enemy.ts';
import { MovementController } from './movement.ts';
import { World } from '../../pages/Battle/core/world.ts';

export type MovementFactory = (
    spawnX: number,
    spawnY: number,
    world: World
) => MovementController;

/**
 * Everything you need to spawn a specific enemy kind.
 * These objects can live in your data layer / DB.
 */
export interface EnemyBlueprint {
    id: string;
    displayName: string;

    // Planner knobs
    strengthCost: number;        // how much of the wave "budget" this unit consumes
    selectionWeight?: number;    // relative chance when planner randomly picks candidates

    // Battle stats
    kind: EnemyKind;             // 'melee' | 'ranged'
    pressure: number;
    maxHitPoints: number;
    armor: number;
    hitRadius: number;
    shotDistance?: number;       // for ranged pressure threshold
    keywords: Set<string>;

    // Visuals
    sprite: SpriteInfo;          // must exist in loaded atlas(es)

    // Movement factory (can randomize params each spawn)
    createMovement: MovementFactory;

    // Optional: spawns N copies as a "swarm" cluster
    swarmSize?: number;          // e.g. 3..6 means 3 to 6 copies
    swarmSizeMax?: number;       // if provided, use [swarmSize..swarmSizeMax] random
}

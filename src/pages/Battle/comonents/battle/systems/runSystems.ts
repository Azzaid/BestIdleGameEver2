// /battle/systems/runSystems.ts
import { World } from '../core/world';
import { WanderMovementSystem } from './wanderMovement';
import { TargetingSystem } from './targeting';
import { AimingSystem } from './aiming';
import { FiringSystem } from './firing';
import { ProjectilesSystem } from './projectiles';
import { StatusSystem } from './statuses';
import { DeathCleanupSystem } from './deathCleanup';
import { PixiSyncSystem } from './pixiSync';

export function runSystems(world: World, dt: number) {
    // update
    TargetingSystem(world);
    AimingSystem(world, dt);
    FiringSystem(world, dt);
    ProjectilesSystem(world, dt);
    StatusSystem(world, dt);
    WanderMovementSystem(world, dt);
    DeathCleanupSystem(world);
    // render
    PixiSyncSystem(world);
}

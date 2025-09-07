import type { World } from '../core/world';
import { TargetingSystem } from './targeting';
import { AimingSystem } from './aiming';
import { FiringSystem } from './firing';
import { MovementSystem } from './movementSystem';
import { LifespanSystem } from './lifespan';
import { ProjectilesSystem } from './projectiles';
import { HealthBarSystem } from './uiHealthBars';
import { PixiSyncSystem } from './pixiSync';
import {SpawnerSystem} from "./spawnerSystem.ts";

/** Per-frame update orchestrator */
export function runSystems(world: World, dt: number) {
    SpawnerSystem(world, dt);
  TargetingSystem(world);
  AimingSystem(world, dt);
  FiringSystem(world, dt);

  MovementSystem(world, dt);
  LifespanSystem(world, dt);
  ProjectilesSystem(world, dt);

  HealthBarSystem(world);

  // Cleanup
  if (world.toRemove.size) {
    for (const id of world.toRemove) {
      world.transforms.delete(id);
      world.movements.delete(id);
      world.lifespans.delete(id);
      world.healths.delete(id);
      world.towersData.delete(id);
      world.enemiesData.delete(id);
      const hb = world.healthBars.get(id);
      if (hb) { hb.destroy(); world.healthBars.delete(id); }
      const view = world.sprites.get(id);
      if (view) { (view as any).destroy?.({ children: true }); world.sprites.delete(id); }
      world.projectileInfo.delete(id);
    }
    world.toRemove.clear();
  }

  PixiSyncSystem(world);
}

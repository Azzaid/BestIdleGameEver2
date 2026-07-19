import type { World } from '../../../models/battle/world.ts';
import { TargetingSystem } from './targeting';
import { AimingSystem } from './aiming';
import { FiringSystem } from './firing';
import { MonsterMovementSystem } from './monsterMovementSystem.ts';
import { ProjectileMovementSystem } from './projectileMovementSystem.ts';
import { LifespanSystem } from './lifespan';
import { ProjectilesSystem } from './projectiles';
import { HealthBarSystem } from './uiHealthBars';
import { PixiSyncSystem } from './pixiSync';
import {SpawnerSystem} from "./spawnerSystem.ts";
import { HealthSystem } from './healthSystem.ts';
import { WallLoadSystem } from './wallLoadSystem.ts';
import { SiegeSystem } from './siegeSystem.ts';
import { WallZoneEffectsSystem } from './wallZoneEffectsSystem.ts';
import { TowerZoneEffectsSystem } from './towerZoneEffectsSystem.ts';
import { DamageAreaVfxSystem } from './damageAreaVfxSystem.ts';
import { DebugTowerTargetingRadiusSystem } from './debugTowerTargetingRadiusSystem.ts';
import { StatusEffectsSystem } from './statusEffectsSystem.ts';

/** Per-frame update orchestrator */
export function runSystems(world: World, dt: number) {
  SpawnerSystem(world, dt);
  TargetingSystem(world);
  AimingSystem(world, dt);
  FiringSystem(world, dt);

  TowerZoneEffectsSystem(world, dt);
  StatusEffectsSystem(world, dt);
  MonsterMovementSystem(world, dt);
  ProjectileMovementSystem(world, dt);
  LifespanSystem(world, dt);
  ProjectilesSystem(world);
  WallZoneEffectsSystem(world, dt);
  HealthSystem(world);
  WallLoadSystem(world);
  SiegeSystem(world, dt);
  DamageAreaVfxSystem(world, dt);

  HealthBarSystem(world);
  DebugTowerTargetingRadiusSystem(world);

  cleanupRemovedEntities(world);
  PixiSyncSystem(world);
}

export function cleanupRemovedEntities(world: World) {
  if (world.toRemove.size) {
    for (const id of world.toRemove) {
      world.transforms.delete(id);
      world.movements.delete(id);
      world.lifespans.delete(id);
      world.healths.delete(id);
      world.towersData.delete(id);
      world.enemiesData.delete(id);
      world.towerReloadRemainingSeconds.delete(id);
      world.enemyPushBackCooldownRemainingSeconds.delete(id);
      world.enemyPushBackRemainingSeconds.delete(id);
      world.enemyTowerMovementOverrides.delete(id);
      world.enemyTowerStunRemainingSeconds.delete(id);
      world.enemyInfections.delete(id);
      world.retreatingEnemyIds.delete(id);
      world.towerZoneDotProgress.delete(id);
      deleteTowerZoneEffectKeysForEntity(world.enemyTowerZoneCooldownRemainingSeconds, id);
      deleteTowerZoneEffectKeysForEntity(world.enemyTowerPushBacks, id);
      deleteTowerZoneEffectKeysForEntity(world.enemyTowerZoneDotProgress, id);
      deleteDamageAreaVfxPulseKeysForEntity(world.damageAreaVfxPulseTriggers, id);
      const hb = world.healthBars.get(id);
      if (hb) { hb.destroy(); world.healthBars.delete(id); }
      const targetingRing = world.debugTowerTargetingRings.get(id);
      if (targetingRing) { targetingRing.destroy(); world.debugTowerTargetingRings.delete(id); }
      const view = world.sprites.get(id);
      if (view) { view.destroy({ children: true }); world.sprites.delete(id); }
      world.projectileInfo.delete(id);
    }
    world.toRemove.clear();
  }
}

function deleteTowerZoneEffectKeysForEntity(map: Pick<Map<string, unknown>, 'keys' | 'delete'>, entityId: number) {
  for (const key of map.keys()) {
    const [towerId, enemyId] = key.split('|').map(Number);
    if (towerId === entityId || enemyId === entityId) {
      map.delete(key);
    }
  }
}

function deleteDamageAreaVfxPulseKeysForEntity(map: Pick<Map<string, unknown>, 'keys' | 'delete'>, entityId: number) {
  const towerPrefix = `tower:${entityId}:`;

  for (const key of map.keys()) {
    if (key.startsWith(towerPrefix)) {
      map.delete(key);
    }
  }
}

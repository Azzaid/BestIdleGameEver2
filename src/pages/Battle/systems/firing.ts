import type { World } from '../../../models/battle/world.ts';
import { createEntityId } from '../core/world';
import * as PIXI from 'pixi.js';
import { getProjectileSpawnPosition, predictProjectileAimAngle, shortestAngleDelta } from './towerAim.ts';

/** Spawns burst and sets retarget cooldown to hold current target briefly. */
export function FiringSystem(world: World, dt: number) {
  for (const [towerId, tower] of world.towersData) {
    const reloadRemaining = (world.towerReloadRemainingSeconds.get(towerId) ?? 0) - dt;
    world.towerReloadRemainingSeconds.set(towerId, reloadRemaining);
    if (reloadRemaining > 0) continue;
    if (!tower.currentTarget) continue;

    const baseTf = world.transforms.get(towerId)!;
    const gunTf = world.transforms.get(tower.gunEntity)!;
    const targetTransform = world.transforms.get(tower.currentTarget);
    if (!targetTransform) continue;

    const center = gunTf.rotationRadians;
    const desired = predictProjectileAimAngle({
      basePosition: baseTf.position,
      currentAngleRadians: center,
      projectileSpawnOffset: tower.projectileSpawnOffset,
      targetTransform,
      targetMovement: world.movements.get(tower.currentTarget),
      projectileSpeed: tower.projectileSpeed,
      monsterMovementModifiers: world.config.monsterMovementModifiers,
    });
    const triggerTolerance = Math.max(0, tower.triggerTolerance);
    if (triggerTolerance < Math.PI && Math.abs(shortestAngleDelta(center, desired)) > triggerTolerance) {
      continue;
    }

    for (let i = 0; i < tower.burstCount; i++) {
      const t = tower.burstCount === 1 ? 0 : (i / (tower.burstCount - 1) - 0.5);
      const angle = center + t * tower.projectileSpread;
      const spawnPosition = getProjectileSpawnPosition(baseTf.position, center, tower.projectileSpawnOffset);
      const id = createEntityId(world);
      world.transforms.set(id, { position: spawnPosition, rotationRadians: angle });
      world.lifespans.set(id, { remainingSeconds: 2.0 });
      world.projectileInfo.set(id, {
        damage: tower.projectileDamage,
        projectileRadius: tower.projectileRadius,
        aoeRadius: tower.aoeRadius,
        keywords: tower.keywords,
        speedPixelsPerSecond: tower.projectileSpeed,
        directionRadians: angle,
      });

      const projectile = new PIXI.Graphics();
      projectile.circle(0, 0, Math.max(1, tower.projectileRadius)).fill(tower.aoeRadius > 0 ? 0xffb347 : 0xeaf2ff);
      projectile.zIndex = 20;
      world.worldLayer.addChild(projectile);
      world.sprites.set(id, projectile);
    }

    // Reset weapon timer & hold current target to prevent wobble
    world.towerReloadRemainingSeconds.set(towerId, 1 / Math.max(0.0001, tower.shotsPerSecond));
    tower.retargetRemainingSeconds = tower.retargetCooldownSeconds;
  }
}

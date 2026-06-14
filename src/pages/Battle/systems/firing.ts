import type { World } from '../../../models/battle/world.ts';
import { createEntityId } from '../core/world';
import * as PIXI from 'pixi.js';

/** Spawns burst and sets retarget cooldown to hold current target briefly. */
export function FiringSystem(world: World, dt: number) {
  for (const [towerId, tower] of world.towersData) {
    const reloadRemaining = (world.towerReloadRemainingSeconds.get(towerId) ?? 0) - dt;
    world.towerReloadRemainingSeconds.set(towerId, reloadRemaining);
    if (reloadRemaining > 0) continue;
    if (!tower.currentTarget) continue;

    const baseTf = world.transforms.get(towerId)!;
    const gunTf = world.transforms.get(tower.gunEntity)!;
    const spread = 0.06; // TODO: from parts
    const center = gunTf.rotationRadians;

    for (let i = 0; i < tower.burstCount; i++) {
      const t = tower.burstCount === 1 ? 0 : (i / (tower.burstCount - 1) - 0.5);
      const angle = center + t * spread;
      const id = createEntityId(world);
      world.transforms.set(id, { position: { ...baseTf.position }, rotationRadians: angle });
      world.movements.set(id, { kind: 'linear', velocityPixelsPerSecond: { x: Math.cos(angle) * tower.projectileSpeed, y: Math.sin(angle) * tower.projectileSpeed } });
      world.lifespans.set(id, { remainingSeconds: 2.0 });
      world.projectileInfo.set(id, { damage: tower.projectileDamage, aoeRadius: tower.aoeRadius, keywords: tower.keywords });

      const projectile = new PIXI.Graphics();
      projectile.circle(0, 0, tower.aoeRadius > 0 ? 5 : 3).fill(tower.aoeRadius > 0 ? 0xffb347 : 0xeaf2ff);
      projectile.zIndex = 20;
      world.worldLayer.addChild(projectile);
      world.sprites.set(id, projectile);
    }

    // Reset weapon timer & hold current target to prevent wobble
    world.towerReloadRemainingSeconds.set(towerId, 1 / Math.max(0.0001, tower.reloadSpeed));
    tower.retargetRemainingSeconds = tower.retargetCooldownSeconds;
  }
}

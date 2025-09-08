import type { World } from '../core/world';
import { createEntityId } from '../core/world';

/** Spawns burst and sets retarget cooldown to hold current target briefly. */
export function FiringSystem(world: World, dt: number) {
  for (const [towerId, tower] of world.towersData) {
    const key = `reload_${towerId}` as const;
    (world as any)[key] = (world as any)[key] ?? 0;
    (world as any)[key] -= dt;
    if ((world as any)[key] > 0) continue;
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
      world.projectileInfo.set(id, { damage: tower.projectileDamage, keywords: tower.keywords });
      // TODO: Attach projectile sprite from your assets
    }

    // Reset weapon timer & hold current target to prevent wobble
    (world as any)[key] = 1 / Math.max(0.0001, tower.reloadSpeed);
    tower.retargetRemainingSeconds = tower.retargetCooldownSeconds;
  }
}

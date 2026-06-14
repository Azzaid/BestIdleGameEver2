import type { World } from '../../../models/battle/world.ts';

export function HealthSystem(world: World) {
  for (const [entityId, health] of world.healths) {
    if (health.hitPoints > 0) continue;

    if (world.enemiesData.has(entityId) && !world.toRemove.has(entityId)) {
      world.defeatedEnemies += 1;
    }

    world.toRemove.add(entityId);
  }
}

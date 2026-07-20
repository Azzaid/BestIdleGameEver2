import type { World } from '../../../models/battle/world.ts';

export function HealthSystem(world: World) {
  for (const [entityId, health] of world.healths) {
    if (health.hitPoints > 0) continue;

    const enemy = world.enemiesData.get(entityId);
    if (enemy && !world.toRemove.has(entityId)) {
      world.defeatedEnemies += 1;
      world.siegeDefeatedStrength += enemy.strengthCost;
    }

    world.toRemove.add(entityId);
  }
}

import type { World } from '../../../models/battle/world.ts';

function enemyContributesSiegePressure(world: World, enemyId: number) {
  const enemy = world.enemiesData.get(enemyId);
  const transform = world.transforms.get(enemyId);
  if (!enemy || !transform) return false;

  return transform.position.y + enemy.hitRadius >= world.config.wallContactY;
}

export function WallLoadSystem(world: World) {
  let pressure = 0;

  for (const [enemyId, enemy] of world.enemiesData) {
    if (world.toRemove.has(enemyId)) continue;

    if (enemyContributesSiegePressure(world, enemyId)) {
      pressure += Math.max(0, enemy.pressure - world.config.wallIgnoredThreat);
    }
  }

  world.siegePressure = pressure;
}

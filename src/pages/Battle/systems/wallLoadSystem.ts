import type { World } from '../core/world';

function enemyContributesWallLoad(world: World, enemyId: number) {
  const enemy = world.enemiesData.get(enemyId);
  const transform = world.transforms.get(enemyId);
  if (!enemy || !transform) return false;

  if (enemy.kind === 'ranged') {
    const shotDistance = enemy.shotDistance ?? 0;
    return world.config.wallY - transform.position.y <= shotDistance;
  }

  return transform.position.y + enemy.hitRadius >= world.config.wallY;
}

export function WallLoadSystem(world: World) {
  let load = 0;

  for (const [enemyId, enemy] of world.enemiesData) {
    if (world.toRemove.has(enemyId)) continue;

    if (enemyContributesWallLoad(world, enemyId)) {
      load += enemy.pressure;
    }
  }

  world.wallLoad = load;
}

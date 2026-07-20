import type { EntityId } from '../../../models/battle/common.ts';
import type { World } from '../../../models/battle/world.ts';

export function EnemyCloakSystem(world: World) {
  for (const [enemyId, enemy] of world.enemiesData) {
    if (enemy.cloakRange <= 0) {
      enemy.cloakVisibility = 1;
      continue;
    }

    const transform = world.transforms.get(enemyId);
    if (!transform) continue;

    enemy.cloakVisibility = Math.max(
      enemy.cloakVisibility,
      getEnemyCloakVisibility(world, enemyId),
    );
  }
}

export function isEnemyTargetable(world: World, enemyId: EntityId): boolean {
  const enemy = world.enemiesData.get(enemyId);
  if (!enemy) return false;

  return enemy.cloakVisibility >= 1;
}

function getEnemyCloakVisibility(world: World, enemyId: EntityId): number {
  const enemy = world.enemiesData.get(enemyId);
  const transform = world.transforms.get(enemyId);
  if (!enemy || !transform) return 0;
  if (enemyIsInsideWallDetectionRange(world, enemyId)) return 1;

  return clamp(transform.position.y / enemy.cloakRange, 0, 1);
}

function enemyIsInsideWallDetectionRange(world: World, enemyId: EntityId): boolean {
  const enemy = world.enemiesData.get(enemyId);
  const transform = world.transforms.get(enemyId);
  const detectionRange = Math.max(0, world.config.cloakRevealRange);
  if (!enemy || !transform || detectionRange <= 0) return false;

  return transform.position.y + enemy.hitRadius >= world.config.wallContactY - detectionRange;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

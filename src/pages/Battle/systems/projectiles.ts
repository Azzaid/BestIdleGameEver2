import type { World } from '../core/world';
import { applyDamageModifiers } from '../keywords/damageResolver';

export function ProjectilesSystem(world: World) {
  for (const [projId, info] of world.projectileInfo) {
    const projTf = world.transforms.get(projId);
    if (!projTf) continue;

    for (const [enemyId, enemy] of world.enemiesData) {
      const enemyTf = world.transforms.get(enemyId);
      if (!enemyTf) continue;
      const dx = enemyTf.position.x - projTf.position.x;
      const dy = enemyTf.position.y - projTf.position.y;
      const r = enemy.hitRadius ?? 14;
      if (dx*dx + dy*dy <= r*r) {
        applyProjectileDamage(world, enemyId, info);
        applyAreaDamage(world, enemyId, info);
        world.toRemove.add(projId);
        break;
      }
    }
  }
}

function applyProjectileDamage(
  world: World,
  enemyId: number,
  info: { damage: number; keywords: Set<string> }
) {
  const hp = world.healths.get(enemyId);
  const enemy = world.enemiesData.get(enemyId);
  if (!hp || !enemy) return;

  const dmg = applyDamageModifiers({ baseDamage: info.damage, keywords: info.keywords }, enemy);
  hp.hitPoints -= dmg;
}

function applyAreaDamage(
  world: World,
  primaryEnemyId: number,
  info: { damage: number; aoeRadius: number; keywords: Set<string> }
) {
  if (info.aoeRadius <= 0) return;

  const impactPosition = world.transforms.get(primaryEnemyId)?.position;
  if (!impactPosition) return;

  const radiusSquared = info.aoeRadius * info.aoeRadius;
  for (const [enemyId] of world.enemiesData) {
    if (enemyId === primaryEnemyId) continue;

    const enemyPosition = world.transforms.get(enemyId)?.position;
    if (!enemyPosition) continue;

    const dx = enemyPosition.x - impactPosition.x;
    const dy = enemyPosition.y - impactPosition.y;
    if (dx * dx + dy * dy <= radiusSquared) {
      applyProjectileDamage(world, enemyId, { damage: info.damage * 0.6, keywords: info.keywords });
    }
  }
}

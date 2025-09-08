import type { World } from '../core/world';
import { applyDamageModifiers } from '../keywords/damageResolver';

export function ProjectilesSystem(world: World, dt: number) {
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
        const hp = world.healths.get(enemyId);
        if (hp) {
          const dmg = applyDamageModifiers({ baseDamage: info.damage, keywords: info.keywords }, enemy);
          hp.hitPoints -= dmg;
        }
        world.toRemove.add(projId);
        break;
      }
    }
  }
}

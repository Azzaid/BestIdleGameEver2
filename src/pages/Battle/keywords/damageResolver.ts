import type { EnemyData } from '../../../models/battle/enemy.ts';
import type { Health } from '../../../models/battle/health.ts';
import type { DamageModifier, ProjectileForDamage } from '../../../models/battle/damage.ts';

const damageRules: DamageModifier[] = [
  (raw, proj, enemy) => {
    if (!enemy.keywords.has('flying')) return raw;
    if (proj.keywords.has('ignoreFlying') || proj.keywords.has('antiAir')) return raw;
    return 0;
  },
  (raw, proj, enemy) => {
    if (enemy.keywords.has('undead') && proj.keywords.has('holy')) return raw * 1.5;
    return raw;
  },
  (raw, proj, _enemy, health) => {
    if (proj.keywords.has('ignoreArmor')) return raw;

    const armorIgnoredRatio = proj.keywords.has('armorPiercing') ? 0.5 : 0;
    const effectiveArmor = health.armor * (1 - armorIgnoredRatio);

    return raw - effectiveArmor;
  },
];

export function applyDamageModifiers(projectile: ProjectileForDamage, enemy: EnemyData, health: Health): number {
  let dmg = projectile.baseDamage;
  for (const rule of damageRules) dmg = rule(dmg, projectile, enemy, health);
  return Math.max(0, dmg);
}

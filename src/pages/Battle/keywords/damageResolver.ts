import type { EnemyData } from '../../../models/battle/enemy.ts';
import type { DamageModifier, ProjectileForDamage } from '../../../models/battle/damage.ts';

const damageRules: DamageModifier[] = [
  (raw, proj, enemy) => {
    if (!enemy.keywords.has('armored')) return raw;
    if (proj.keywords.has('ignoreArmor')) return raw;
    if (proj.keywords.has('armorPiercing')) return raw * 0.5;
    return raw * 0.25;
  },
  (raw, proj, enemy) => {
    if (!enemy.keywords.has('flying')) return raw;
    if (proj.keywords.has('ignoreFlying') || proj.keywords.has('antiAir')) return raw;
    return 0;
  },
  (raw, proj, enemy) => {
    if (enemy.keywords.has('undead') && proj.keywords.has('holy')) return raw * 1.5;
    return raw;
  },
];

export function applyDamageModifiers(projectile: ProjectileForDamage, enemy: EnemyData): number {
  let dmg = projectile.baseDamage;
  for (const rule of damageRules) dmg = rule(dmg, projectile, enemy);
  return Math.max(0, dmg);
}

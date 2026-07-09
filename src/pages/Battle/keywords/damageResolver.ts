import type { EnemyData } from '../../../models/battle/enemy.ts';
import type { Health } from '../../../models/battle/health.ts';
import { DAMAGE_KEYWORDS, type DamageModifier, type DamageProfile } from '../../../models/battle/damage.ts';

const damageRules: DamageModifier[] = [
  (raw, damage, enemy) => {
    if (!enemy.keywords.has('flying')) return raw;
    if (damage.keywords.has(DAMAGE_KEYWORDS.ignoreFlying) || damage.keywords.has(DAMAGE_KEYWORDS.antiAir)) return raw;
    return 0;
  },
  (raw, damage, enemy) => {
    if (enemy.keywords.has('undead') && damage.keywords.has(DAMAGE_KEYWORDS.holy)) return raw * 1.5;
    return raw;
  },
  (raw, damage, _enemy, health) => {
    if (damage.keywords.has(DAMAGE_KEYWORDS.ignoreArmor)) return raw;

    const armorIgnoredRatio = damage.keywords.has(DAMAGE_KEYWORDS.armorPiercing) ? 0.5 : 0;
    const effectiveArmor = health.armor * (1 - armorIgnoredRatio);

    return raw - effectiveArmor;
  },
];

export function applyDamageModifiers(damage: DamageProfile, enemy: EnemyData, health: Health): number {
  let dmg = damage.amount;
  for (const rule of damageRules) dmg = rule(dmg, damage, enemy, health);
  return Math.max(0, dmg);
}

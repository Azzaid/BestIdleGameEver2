import type { EnemyData } from './enemy.ts';
import type { Health } from './health.ts';
import type { HomogeneousValueEffect, HomogeneousValueId } from '../homogeneousValues.ts';

export const DAMAGE_KEYWORDS = {
  antiAir: 'damage.antiAir',
  armorPiercing: 'damage.armorPiercing',
  holy: 'damage.holy',
  ignoreArmor: 'damage.ignoreArmor',
  ignoreFlying: 'damage.ignoreFlying',
  poison: 'damage.poison',
} as const;

export interface DamageProfile {
  amount: number;
  keywords: Set<string>;
}

export type TowerDamageProfiles = {
  projectile: DamageProfile;
  zoneDot: DamageProfile;
  singleTargetDot: DamageProfile;
};

export type DamageModifier = (
  raw: number,
  damage: DamageProfile,
  enemy: EnemyData,
  health: Health,
) => number;

export function createDamageProfile(
  amount: number,
  baseKeywords: Iterable<string>,
  damageValueId: HomogeneousValueId,
  contributions: readonly HomogeneousValueEffect[],
): DamageProfile {
  const keywords = new Set(baseKeywords);

  for (const contribution of contributions) {
    if (contribution.valueId !== damageValueId) continue;

    for (const keyword of contribution.additionalKeywords ?? []) {
      keywords.add(keyword);
    }
  }

  return {
    amount,
    keywords,
  };
}

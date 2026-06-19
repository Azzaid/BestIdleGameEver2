import type { TowerBuild, TowerStatsResolved, GunPart } from '../../../models/battle/towerParts.ts';
import { TOWER_WEIGHT_ROTATION_PENALTY } from '../../../data/constants.ts';
import {
  homogeneousValueTotalsToTowerStats,
  towerModifiersToHomogeneousValueEffects,
  towerWeightToHomogeneousValueEffects
} from '../../../models/homogeneousValueAdapters.ts';
import type { HomogeneousValueEffect } from '../../../models/homogeneousValues.ts';
import { resolveTower } from '../../../models/homogeneousValueResolution.ts';

export function resolveTowerStats(build: TowerBuild): TowerStatsResolved {
  const keywords = new Set<string>();
  const towerValueEffects: HomogeneousValueEffect[] = [];

  function applyPart(part: GunPart) {
    part.keywords.forEach(k => keywords.add(k));
    towerValueEffects.push(
      ...towerWeightToHomogeneousValueEffects(part.weight),
      ...towerModifiersToHomogeneousValueEffects(part.modifiers),
      ...(part.homogeneousValueEffects ?? []),
    );
    part.children?.forEach(applyPart);
  }

  (Object.keys(build.slots) as unknown as Array<keyof typeof build.slots>).forEach((dir) => {
    const chain = build.slots[dir];
    chain?.forEach(applyPart);
  });

  const stats = homogeneousValueTotalsToTowerStats(
    resolveTower({
      id: 'towerBuild',
      entityType: 'tower',
      keywords: [...keywords],
      contributions: towerValueEffects,
    }).values,
    keywords,
  );
  stats.rotationSpeed = Math.max(0.25, stats.rotationSpeed - stats.weight * TOWER_WEIGHT_ROTATION_PENALTY);

  return stats;
}

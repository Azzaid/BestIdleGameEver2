import type { TowerBuild, TowerStatsResolved, GunPart, TowerModifiers } from '../../../models/battle/towerParts.ts';
import { BASE_TOWER_STATS, TOWER_WEIGHT_ROTATION_PENALTY } from '../../../data/constants.ts';

export function resolveTowerStats(build: TowerBuild): TowerStatsResolved {
  const stats: TowerStatsResolved = { ...BASE_TOWER_STATS, keywords: new Set<string>() };

  function applyPart(part: GunPart) {
    stats.weight += part.weight ?? 0;
    part.keywords.forEach(k => stats.keywords.add(k));
    if (part.modifiers) {
      for (const [field, value] of Object.entries(part.modifiers)) {
        const key = field as keyof TowerModifiers;
        if (value !== undefined) {
          stats[key] += value;
        }
      }
    }
    part.children?.forEach(applyPart);
  }

  (Object.keys(build.slots) as unknown as Array<keyof typeof build.slots>).forEach((dir) => {
    const chain = build.slots[dir];
    chain?.forEach(applyPart);
  });

  stats.rotationSpeed = Math.max(0.25, stats.rotationSpeed - stats.weight * TOWER_WEIGHT_ROTATION_PENALTY);

  return stats;
}

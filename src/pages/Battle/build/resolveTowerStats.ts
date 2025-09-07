import type { TowerBuild, TowerStatsResolved, GunPart, TowerModifiers } from '../../../models/battle/towerParts.ts';
import { BASE_TOWER } from '../../../models/battle/towerParts.ts';

export function resolveTowerStats(build: TowerBuild): TowerStatsResolved {
  const stats: TowerStatsResolved = { ...BASE_TOWER, keywords: new Set(BASE_TOWER.keywords) };

  function applyPart(part: GunPart) {
    part.keywords.forEach(k => stats.keywords.add(k));
    if (part.modifiers) {
      for (const [field, value] of Object.entries(part.modifiers)) {
        const key = field as keyof TowerModifiers;
        (stats as any)[key] = ((stats as any)[key] ?? 0) + (value as number);
      }
    }
    part.children?.forEach(applyPart);
  }

  (Object.keys(build.slots) as Array<keyof typeof build.slots>).forEach((dir) => {
    const chain = build.slots[dir];
    chain?.forEach(applyPart);
  });

  return stats;
}

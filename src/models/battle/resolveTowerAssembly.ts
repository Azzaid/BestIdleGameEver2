import { TOWER_PARTS_BY_ID, TOWER_PART_SLOT_ORDER, TOWER_SYNERGY_RULES, REQUIRED_TOWER_PART_SLOTS } from '../../data/gunParts/index.ts';
import { TOWER_WEIGHT_ROTATION_PENALTY } from '../../data/constants.ts';
import { UPKEEP_TYPES, UPKEEP_SPRITES, type UpkeepAmount, type UpkeepTypesValue } from '../Upkeep.ts';
import type { GunPart, TowerAssembly, TowerAssemblyResolved, TowerPartSlot } from './towerParts.ts';
import {
  homogeneousValueTotalsToUpkeepAmount,
  homogeneousValueTotalsToTowerStats,
} from '../homogeneousValueAdapters.ts';
import type {
  HomogeneousAdjacencyRule,
  HomogeneousDerivedValueEffect,
  HomogeneousResolvedValueMap,
  HomogeneousValueEffect,
} from '../homogeneousValues.ts';
import {
  getAvailableValues,
  getUpkeepValues,
  resolveTower,
} from '../homogeneousValueResolution.ts';
import { createDamageProfile, type TowerDamageProfiles } from './damage.ts';
import { HOMOGENEOUS_VALUE_IDS } from '../../data/homogeneousValues/index.ts';

function addAimKeywords(target: string[], source?: string[]) {
  if (!source) return;

  for (const keyword of source) {
    if (!target.includes(keyword)) {
      target.push(keyword);
    }
  }
}

function isPartUnlocked(part: GunPart, unlockedTowerPartIds: readonly string[]) {
  return unlockedTowerPartIds.includes(part.id);
}

export function resolveTowerAssembly(
  assembly: TowerAssembly,
  unlockedTowerPartIds: readonly string[] = []
): TowerAssemblyResolved {
  const keywords = new Set<string>();
  const selectedParts: TowerAssemblyResolved['selectedParts'] = {};
  const aimKeywords: string[] = [];
  const warnings: TowerAssemblyResolved['warnings'] = [];
  const values: HomogeneousValueEffect[] = [];
  const derivedValues: HomogeneousDerivedValueEffect[] = [];
  const effects: HomogeneousAdjacencyRule[] = [];

  for (const { key: slot } of TOWER_PART_SLOT_ORDER) {
    const partId = assembly.selectedPartIds[slot];
    if (!partId) continue;

    const part = TOWER_PARTS_BY_ID[partId];
    if (!part) {
      warnings.push({
        id: `unknown-${slot}`,
        kind: 'conflict',
        message: `Selected ${slot} part could not be found.`,
      });
      continue;
    }

    selectedParts[slot] = part;
    part.keywords.forEach((keyword) => keywords.add(keyword));
    values.push(...(part.values ?? []));
    derivedValues.push(...(part.derivedValues ?? []));
    effects.push(...(part.effects ?? []));
    addAimKeywords(aimKeywords, part.aimKeywords);

    if (!isPartUnlocked(part, unlockedTowerPartIds)) {
      warnings.push({
        id: `locked-${part.id}`,
        kind: 'lockedPart',
        message: `${part.name} is visible, but not permanently unlocked yet.`,
      });
    }
  }

  for (const slot of REQUIRED_TOWER_PART_SLOTS) {
    if (!selectedParts[slot]) {
      warnings.push({
        id: `missing-${slot}`,
        kind: 'missingSlot',
        message: `${formatTowerSlot(slot)} is required before the tower can be field-tested.`,
      });
    }
  }

  for (const part of Object.values(selectedParts)) {
    if (!part?.conflictsWithKeywords) continue;

    const conflict = part.conflictsWithKeywords.find((keyword) => keywords.has(keyword));
    if (conflict) {
      warnings.push({
        id: `conflict-${part.id}-${conflict}`,
        kind: 'conflict',
        message: `${part.name} conflicts with ${conflict} components.`,
      });
    }
  }

  const synergies = TOWER_SYNERGY_RULES.flatMap((rule) => {
    const active = rule.requiredKeywords.every((keyword) => keywords.has(keyword));
    if (!active) return [];

    values.push(...(rule.values ?? []));
    derivedValues.push(...(rule.derivedValues ?? []));
    effects.push(...(rule.effects ?? []));
    rule.addKeywords?.forEach((keyword) => keywords.add(keyword));
    addAimKeywords(aimKeywords, rule.addAimKeywords);

    return [{
      id: rule.id,
      name: rule.name,
      description: rule.description,
    }];
  });

  if (aimKeywords.length === 0) {
    aimKeywords.push('closestToWall');
  }

  const resolvedTower = resolveTower({
    id: 'towerAssembly',
    entityType: 'tower',
    keywords: [...keywords],
    values,
    effects,
  });
  const resolvedValues = resolvedTower.resolvedValues;
  const {stats, supportCost} = resolveTowerAssemblyStatsAndSupport(
    resolvedValues,
    keywords,
  );
  const damageProfiles = createTowerDamageProfiles(stats, keywords, resolvedTower.resolvedContributions);

  return {
    selectedParts,
    stats,
    damageProfiles,
    supportCost,
    values,
    derivedValues,
    effects,
    homogeneousResolvedValues: resolvedValues,
    keywords,
    aimKeywords,
    synergies,
    warnings,
  };
}

export function resolveTowerAssemblyStatsAndSupport(
  resolvedValues: HomogeneousResolvedValueMap,
  keywords: Set<string>,
): Pick<TowerAssemblyResolved, 'stats' | 'supportCost'> {
  const stats = homogeneousValueTotalsToTowerStats(getAvailableValues(resolvedValues), keywords);
  const supportCost = homogeneousValueTotalsToUpkeepAmount(getUpkeepValues(resolvedValues));
  stats.rotationSpeed -= stats.weight * TOWER_WEIGHT_ROTATION_PENALTY;

  return {stats, supportCost};
}

export function createTowerDamageProfiles(
  stats: TowerAssemblyResolved['stats'],
  keywords: Set<string>,
  contributions: readonly HomogeneousValueEffect[],
): TowerDamageProfiles {
  return {
    projectile: createDamageProfile(
      stats.projectileDamage,
      keywords,
      HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
      contributions,
    ),
    zoneDot: createDamageProfile(
      stats.zoneDotDamage,
      keywords,
      HOMOGENEOUS_VALUE_IDS.towerZoneDotDamage,
      contributions,
    ),
    singleTargetDot: createDamageProfile(
      stats.singleTargetDotDamage,
      keywords,
      HOMOGENEOUS_VALUE_IDS.towerSingleTargetDotDamage,
      contributions,
    ),
  };
}

export function formatTowerSlot(slot: TowerPartSlot): string {
  return TOWER_PART_SLOT_ORDER.find((item) => item.key === slot)?.label ?? slot;
}

export function formatSupportCost(cost: UpkeepAmount): string[] {
  return (Object.values(UPKEEP_TYPES) as UpkeepTypesValue[])
    .map((symbol) => {
      const amount = cost[symbol] ?? 0;
      if (amount <= 0) return undefined;
      return `${UPKEEP_SPRITES[symbol]} ${amount}`;
    })
    .filter((item): item is string => Boolean(item));
}

import { TOWER_PARTS_BY_ID, TOWER_PART_SLOT_ORDER, TOWER_SYNERGY_RULES, REQUIRED_TOWER_PART_SLOTS } from '../../data/towers/index.ts';
import { BASE_TOWER_STATS, TOWER_WEIGHT_ROTATION_PENALTY } from '../../data/constants.ts';
import { UPKEEP_TYPES, UPKEEP_SPRITES, type UpkeepAmount, type UpkeepTypesValue } from '../Upkeep.ts';
import type { GunPart, TowerAssembly, TowerAssemblyResolved, TowerModifiers, TowerPartSlot } from './towerParts.ts';

const MINIMUM_STAT_VALUES: Pick<TowerModifiers, 'rotationSpeed' | 'reloadSpeed' | 'burstCount' | 'projectileDamage' | 'projectileSpeed' | 'targetingDistanceLimit' | 'retargetCooldownSeconds'> = {
  rotationSpeed: 0.25,
  reloadSpeed: 0.1,
  burstCount: 1,
  projectileDamage: 1,
  projectileSpeed: 80,
  targetingDistanceLimit: 80,
  retargetCooldownSeconds: 0,
};

function applyModifiers(stats: TowerAssemblyResolved['stats'], modifiers?: Partial<TowerModifiers>) {
  if (!modifiers) return;

  for (const key of Object.keys(modifiers) as Array<keyof TowerModifiers>) {
    stats[key] += modifiers[key] ?? 0;
  }
}

function addSupportCost(target: UpkeepAmount, source?: UpkeepAmount) {
  if (!source) return;

  for (const symbol of Object.getOwnPropertySymbols(source) as UpkeepTypesValue[]) {
    target[symbol] = (target[symbol] ?? 0) + (source[symbol] ?? 0);
  }
}

function addAimKeywords(target: string[], source?: string[]) {
  if (!source) return;

  for (const keyword of source) {
    if (!target.includes(keyword)) {
      target.push(keyword);
    }
  }
}

function clampStats(stats: TowerAssemblyResolved['stats']) {
  for (const key of Object.keys(MINIMUM_STAT_VALUES) as Array<keyof typeof MINIMUM_STAT_VALUES>) {
    stats[key] = Math.max(MINIMUM_STAT_VALUES[key], stats[key]);
  }
}

function isPartUnlocked(part: GunPart, purchasedTechIds: readonly string[]) {
  return (part.unlockRequirements ?? []).every((requirement) => purchasedTechIds.includes(requirement.researchId));
}

export function resolveTowerAssembly(
  assembly: TowerAssembly,
  purchasedTechIds: readonly string[] = []
): TowerAssemblyResolved {
  const stats = { ...BASE_TOWER_STATS, keywords: new Set<string>() };
  const selectedParts: TowerAssemblyResolved['selectedParts'] = {};
  const supportCost: UpkeepAmount = {};
  const aimKeywords: string[] = [];
  const warnings: TowerAssemblyResolved['warnings'] = [];

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
    stats.weight += part.weight ?? 0;
    part.keywords.forEach((keyword) => stats.keywords.add(keyword));
    applyModifiers(stats, part.modifiers);
    addSupportCost(supportCost, part.supportCost);
    addAimKeywords(aimKeywords, part.aimKeywords);

    if (!isPartUnlocked(part, purchasedTechIds)) {
      const missing = part.unlockRequirements
        ?.filter((requirement) => !purchasedTechIds.includes(requirement.researchId))
        .map((requirement) => requirement.label)
        .join(', ');
      warnings.push({
        id: `locked-${part.id}`,
        kind: 'lockedPart',
        message: `${part.name} needs ${missing ?? 'more research'} before it can be installed.`,
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

    const conflict = part.conflictsWithKeywords.find((keyword) => stats.keywords.has(keyword));
    if (conflict) {
      warnings.push({
        id: `conflict-${part.id}-${conflict}`,
        kind: 'conflict',
        message: `${part.name} conflicts with ${conflict} components.`,
      });
    }
  }

  const synergies = TOWER_SYNERGY_RULES.flatMap((rule) => {
    const active = rule.requiredKeywords.every((keyword) => stats.keywords.has(keyword));
    if (!active) return [];

    applyModifiers(stats, rule.modifiers);
    rule.addKeywords?.forEach((keyword) => stats.keywords.add(keyword));
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

  stats.rotationSpeed -= stats.weight * TOWER_WEIGHT_ROTATION_PENALTY;
  clampStats(stats);

  return {
    selectedParts,
    stats,
    supportCost,
    keywords: stats.keywords,
    aimKeywords,
    synergies,
    warnings,
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

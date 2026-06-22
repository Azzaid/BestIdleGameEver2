import type {DevelopmentVectorKey} from "../../../models/DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../../models/homogeneousValues.ts";
import type {Requirement} from "../../../models/progression/requirements.ts";
import type {UpkeepAmount} from "../../../models/Upkeep.ts";
import type {GunPart, TowerModifiers, TowerPartSlot} from "../../../models/battle/towerParts.ts";
import {upkeepAmountToHomogeneousValueEffects} from "../../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../homogeneousValues/index.ts";

type TowerPartStatKey = keyof TowerModifiers | "projectileSize";
type TowerPartStats = Partial<Record<TowerPartStatKey, number>>;

type TowerPartFactoryOptions = {
  vector: DevelopmentVectorKey;
  defaultKeywords?: string[];
};

type TowerPartOptions = {
  keywords?: string[];
  supportCost?: UpkeepAmount;
  requirements?: Requirement[];
  buildRequirements?: Requirement[];
  spriteTextureKey?: string;
  aimKeywords?: string[];
  conflictsWithKeywords?: string[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  children?: GunPart[];
};

const statValueIds: Record<TowerPartStatKey, string> = {
  rotationSpeed: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed,
  shotsPerSecond: HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond,
  burstCount: HOMOGENEOUS_VALUE_IDS.towerBurstCount,
  projectileDamage: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
  projectileSpeed: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
  projectileSize: HOMOGENEOUS_VALUE_IDS.towerProjectileRadius,
  projectileRadius: HOMOGENEOUS_VALUE_IDS.towerProjectileRadius,
  projectileSpread: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
  aoeRadius: HOMOGENEOUS_VALUE_IDS.towerAoeRadius,
  targetingDistanceLimit: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
  maximumRange: HOMOGENEOUS_VALUE_IDS.towerMaximumRange,
  minimumRange: HOMOGENEOUS_VALUE_IDS.towerMinimumRange,
  maximumRotationAngle: HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle,
  retargetCooldownSeconds: HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds,
  triggerTolerance: HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance,
  weight: HOMOGENEOUS_VALUE_IDS.towerWeight,
};

export function createTowerPartFactory({vector, defaultKeywords = []}: TowerPartFactoryOptions) {
  function part(
    id: string,
    slot: TowerPartSlot,
    name: string,
    description: string,
    stats: TowerPartStats = {},
    options: TowerPartOptions = {},
  ): GunPart {
    const values = [
      ...towerStatsToHomogeneousValueEffects(stats),
      ...upkeepAmountToHomogeneousValueEffects(options.supportCost ?? {}, "upkeep"),
      ...(options.values ?? []),
    ];

    return {
      id,
      slot,
      name,
      description,
      vector,
      sprite: {textureKey: options.spriteTextureKey ?? id},
      keywords: new Set([...defaultKeywords, slot, ...(options.keywords ?? [])]),
      requirements: options.requirements,
      buildRequirements: options.buildRequirements,
      aimKeywords: options.aimKeywords,
      conflictsWithKeywords: options.conflictsWithKeywords,
      children: options.children,
      values,
      effects: options.effects,
    };
  }

  return {
    part,
  };
}

function towerStatsToHomogeneousValueEffects(stats: TowerPartStats): HomogeneousValueEffect[] {
  return (Object.entries(stats) as Array<[TowerPartStatKey, number | undefined]>)
    .flatMap(([stat, additive]) => {
      if (additive === undefined || additive === 0) return [];

      return [{
        valueId: statValueIds[stat],
        additionalKeywords: ["production"],
        additive,
      }];
    });
}

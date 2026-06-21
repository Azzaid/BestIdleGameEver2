import type { SpriteInfo } from './spriteInfo.ts';
import type { DevelopmentVectorKey } from '../DevlopmentVector.ts';
import type { UpkeepAmount } from '../Upkeep.ts';
import type {
  HomogeneousAdjacencyRule,
  HomogeneousResolvedValueMap,
  HomogeneousValueEffect,
} from '../homogeneousValues.ts';
import type {RequirementGate} from '../progression/requirements.ts';

export interface TowerModifiers {
  rotationSpeed: number;
  shotsPerSecond: number;
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  projectileRadius: number;
  projectileSpread: number;
  aoeRadius: number;
  targetingDistanceLimit: number;
  maximumRange: number;
  minimumRange: number;
  maximumRotationAngle: number;
  retargetCooldownSeconds: number;
  triggerTolerance: number;
  weight: number;
}

export type TowerPartSlot =
  | 'platform'
  | 'barrel'
  | 'ammo'
  | 'aimSystem'
  | 'barrelAttachment'
  | 'loadingSystem'
  | 'launchSystem';

export interface GunPart extends RequirementGate {
  id: string;
  name: string;
  slot?: TowerPartSlot;
  description?: string;
  vector?: DevelopmentVectorKey;
  sprite: SpriteInfo;
  keywords: Set<string>;
  aimKeywords?: string[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  conflictsWithKeywords?: string[];
  children?: GunPart[]; // chain within a slot
}

export interface TowerAssembly {
  selectedPartIds: Partial<Record<TowerPartSlot, string>>;
}

export interface TowerSynergyRule {
  id: string;
  name: string;
  description: string;
  requiredKeywords: string[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  addKeywords?: string[];
  addAimKeywords?: string[];
}

export type TowerPartsAtlas = Record<DevelopmentVectorKey, Record<string, GunPart>>;

export interface ResolvedTowerSynergy {
  id: string;
  name: string;
  description: string;
}

export type TowerBuildWarningKind = 'missingSlot' | 'lockedPart' | 'conflict';

export interface TowerBuildWarning {
  id: string;
  kind: TowerBuildWarningKind;
  message: string;
}

export interface TowerStatsResolved {
  rotationSpeed: number;
  shotsPerSecond: number;
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  projectileRadius: number;
  projectileSpread: number;
  aoeRadius: number;
  targetingDistanceLimit: number;
  maximumRange: number;
  minimumRange: number;
  maximumRotationAngle: number;
  retargetCooldownSeconds: number;
  triggerTolerance: number;
  weight: number;
  keywords: Set<string>;
}

export interface TowerAssemblyResolved {
  selectedParts: Partial<Record<TowerPartSlot, GunPart>>;
  stats: TowerStatsResolved;
  supportCost: UpkeepAmount;
  values: HomogeneousValueEffect[];
  effects: HomogeneousAdjacencyRule[];
  homogeneousResolvedValues: HomogeneousResolvedValueMap;
  keywords: Set<string>;
  aimKeywords: string[];
  synergies: ResolvedTowerSynergy[];
  warnings: TowerBuildWarning[];
}

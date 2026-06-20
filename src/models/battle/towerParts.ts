import type { SpriteInfo } from './spriteInfo.ts';
import type { DevelopmentVectorKey } from '../DevlopmentVector.ts';
import type { UpkeepAmount } from '../Upkeep.ts';
import type { HomogeneousValueEffect } from '../homogeneousValues.ts';
import type { HomogeneousResolvedValueMap } from '../homogeneousValues.ts';
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
  gunHomogeneousValueEffects?: HomogeneousValueEffect[];
  cityHomogeneousValueEffects?: HomogeneousValueEffect[];
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
  gunHomogeneousValueEffects?: HomogeneousValueEffect[];
  cityHomogeneousValueEffects?: HomogeneousValueEffect[];
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
  gunHomogeneousValueEffects: HomogeneousValueEffect[];
  cityHomogeneousValueEffects: HomogeneousValueEffect[];
  gunHomogeneousResolvedValues: HomogeneousResolvedValueMap;
  cityHomogeneousResolvedValues: HomogeneousResolvedValueMap;
  keywords: Set<string>;
  aimKeywords: string[];
  synergies: ResolvedTowerSynergy[];
  warnings: TowerBuildWarning[];
}

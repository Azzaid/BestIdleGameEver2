import type { GunSlotDirection } from './tower.ts';
import type { SpriteInfo } from './spriteInfo.ts';
import type { DevelopmentVectorKey } from '../DevlopmentVector.ts';
import type { UpkeepAmount } from '../Upkeep.ts';
import type { HomogeneousValueEffect } from '../homogeneousValues.ts';
import type { HomogeneousResolvedValueMap } from '../homogeneousValues.ts';

export interface TowerModifiers {
  rotationSpeed: number;
  reloadSpeed: number;
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  aoeRadius: number;
  targetingDistanceLimit: number;
  retargetCooldownSeconds: number;
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

export interface TowerPartUnlockRequirement {
  researchId: string;
  label: string;
}

export interface GunPart {
  id: string;
  name: string;
  slot?: TowerPartSlot;
  description?: string;
  vector?: DevelopmentVectorKey;
  sprite: SpriteInfo;
  attachmentOffset: { x: number; y: number };
  keywords: Set<string>;
  aimKeywords?: string[];
  homogeneousValueEffects?: HomogeneousValueEffect[];
  unlockRequirements?: TowerPartUnlockRequirement[];
  conflictsWithKeywords?: string[];
  children?: GunPart[]; // chain within a slot
}

export interface TowerBuild {
  slots: Partial<Record<GunSlotDirection, GunPart[]>>;
}

export interface TowerAssembly {
  selectedPartIds: Partial<Record<TowerPartSlot, string>>;
}

export interface TowerSynergyRule {
  id: string;
  name: string;
  description: string;
  requiredKeywords: string[];
  homogeneousValueEffects?: HomogeneousValueEffect[];
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
  reloadSpeed: number;
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  aoeRadius: number;
  targetingDistanceLimit: number;
  retargetCooldownSeconds: number;
  weight: number;
  keywords: Set<string>;
}

export interface TowerAssemblyResolved {
  selectedParts: Partial<Record<TowerPartSlot, GunPart>>;
  stats: TowerStatsResolved;
  supportCost: UpkeepAmount;
  homogeneousValueEffects: HomogeneousValueEffect[];
  homogeneousResolvedValues: HomogeneousResolvedValueMap;
  keywords: Set<string>;
  aimKeywords: string[];
  synergies: ResolvedTowerSynergy[];
  warnings: TowerBuildWarning[];
}

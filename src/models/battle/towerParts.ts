import type { GunSlotDirection } from './tower.ts';
import type { SpriteInfo } from './spriteInfo.ts';
import type { DevelopmentVectorKey } from '../DevlopmentVector.ts';
import type { UpkeepAmount } from '../Upkeep.ts';

export interface TowerModifiers {
  rotationSpeed: number;
  reloadSpeed: number;
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  aoeRadius: number;
  targetingDistanceLimit: number;
  retargetCooldownSeconds: number;
}

export type TowerPartSlot =
  | 'base'
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
  modifiers?: Partial<TowerModifiers>;
  supportCost?: UpkeepAmount;
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
  modifiers?: Partial<TowerModifiers>;
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
  keywords: Set<string>;
}

export interface TowerAssemblyResolved {
  selectedParts: Partial<Record<TowerPartSlot, GunPart>>;
  stats: TowerStatsResolved;
  supportCost: UpkeepAmount;
  keywords: Set<string>;
  aimKeywords: string[];
  synergies: ResolvedTowerSynergy[];
  warnings: TowerBuildWarning[];
}

export const BASE_TOWER: TowerStatsResolved = {
  rotationSpeed: 2.5,
  reloadSpeed: 1.0,
  burstCount: 1,
  projectileDamage: 10,
  projectileSpeed: 500,
  aoeRadius: 0,
  targetingDistanceLimit: 360,
  retargetCooldownSeconds: 0.25,
  keywords: new Set(),
};

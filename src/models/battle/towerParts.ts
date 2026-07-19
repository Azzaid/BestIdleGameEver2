import type { SpriteInfo } from './spriteInfo.ts';
import type { TowerDamageProfiles } from './damage.ts';
import type { DevelopmentVectorKey } from '../DevlopmentVector.ts';
import type { UpkeepAmount } from '../Upkeep.ts';
import type {
  HomogeneousAdjacencyRule,
  HomogeneousDerivedValueEffect,
  HomogeneousResolvedValueMap,
  HomogeneousValueEffect,
} from '../homogeneousValues.ts';
import type {RequirementGate} from '../progression/requirements.ts';
import type {ProgressionMetadata} from '../progression/metadata.ts';

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
  zonePushBackDistance: number;
  zonePushBacksPerSecond: number;
  zonePushBackZoneSize: number;
  zoneFleeDuration: number;
  zoneFleesPerSecond: number;
  zoneFleeZoneSize: number;
  zoneCircleDuration: number;
  zoneCirclesPerSecond: number;
  zoneCircleZoneSize: number;
  zoneDotDamage: number;
  zoneDotTicksPerSecond: number;
  zoneDotZoneSize: number;
  zoneStunDuration: number;
  zoneStunsPerSecond: number;
  zoneStunZoneSize: number;
  singleTargetPushBackDistance: number;
  singleTargetPushBacksPerSecond: number;
  singleTargetPushBackRange: number;
  singleTargetFleeDuration: number;
  singleTargetFleesPerSecond: number;
  singleTargetFleeRange: number;
  singleTargetCircleDuration: number;
  singleTargetCirclesPerSecond: number;
  singleTargetCircleRange: number;
  singleTargetDotDamage: number;
  singleTargetDotTicksPerSecond: number;
  singleTargetDotRange: number;
  singleTargetStunDuration: number;
  singleTargetStunsPerSecond: number;
  singleTargetStunRange: number;
  singleTargetInfectionDuration: number;
  singleTargetInfectionsPerSecond: number;
  singleTargetInfectionRange: number;
  singleTargetInfectionStacks: number;
  singleTargetInfectionMaxStacks: number;
  singleTargetInfectionSlowPerStack: number;
  singleTargetInfectionDamagePerSecond: number;
  projectileInfectionDuration: number;
  projectileInfectionStacks: number;
  projectileInfectionMaxStacks: number;
  projectileInfectionSlowPerStack: number;
  projectileInfectionDamagePerSecond: number;
  weight: number;
  maximumWeight: number;
}

export type TowerPartSlot =
  | 'platform'
  | 'barrel'
  | 'ammo'
  | 'aimSystem'
  | 'barrelAttachment'
  | 'loadingSystem'
  | 'launchSystem';

export interface GunPart extends RequirementGate, ProgressionMetadata {
  id: string;
  name: string;
  slot?: TowerPartSlot;
  description?: string;
  vector?: DevelopmentVectorKey;
  sprite: SpriteInfo;
  zIndex: number;
  projectileSprite?: SpriteInfo;
  keywords: Set<string>;
  aimKeywords?: string[];
  values?: HomogeneousValueEffect[];
  derivedValues?: HomogeneousDerivedValueEffect[];
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
  derivedValues?: HomogeneousDerivedValueEffect[];
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

export type TowerBuildWarningKind = 'missingSlot' | 'lockedPart' | 'conflict' | 'overweight';

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
  zonePushBackDistance: number;
  zonePushBacksPerSecond: number;
  zonePushBackZoneSize: number;
  zoneFleeDuration: number;
  zoneFleesPerSecond: number;
  zoneFleeZoneSize: number;
  zoneCircleDuration: number;
  zoneCirclesPerSecond: number;
  zoneCircleZoneSize: number;
  zoneDotDamage: number;
  zoneDotTicksPerSecond: number;
  zoneDotZoneSize: number;
  zoneStunDuration: number;
  zoneStunsPerSecond: number;
  zoneStunZoneSize: number;
  singleTargetPushBackDistance: number;
  singleTargetPushBacksPerSecond: number;
  singleTargetPushBackRange: number;
  singleTargetFleeDuration: number;
  singleTargetFleesPerSecond: number;
  singleTargetFleeRange: number;
  singleTargetCircleDuration: number;
  singleTargetCirclesPerSecond: number;
  singleTargetCircleRange: number;
  singleTargetDotDamage: number;
  singleTargetDotTicksPerSecond: number;
  singleTargetDotRange: number;
  singleTargetStunDuration: number;
  singleTargetStunsPerSecond: number;
  singleTargetStunRange: number;
  singleTargetInfectionDuration: number;
  singleTargetInfectionsPerSecond: number;
  singleTargetInfectionRange: number;
  singleTargetInfectionStacks: number;
  singleTargetInfectionMaxStacks: number;
  singleTargetInfectionSlowPerStack: number;
  singleTargetInfectionDamagePerSecond: number;
  projectileInfectionDuration: number;
  projectileInfectionStacks: number;
  projectileInfectionMaxStacks: number;
  projectileInfectionSlowPerStack: number;
  projectileInfectionDamagePerSecond: number;
  weight: number;
  maximumWeight: number;
  keywords: Set<string>;
}

export interface TowerAssemblyResolved {
  selectedParts: Partial<Record<TowerPartSlot, GunPart>>;
  stats: TowerStatsResolved;
  damageProfiles: TowerDamageProfiles;
  supportCost: UpkeepAmount;
  values: HomogeneousValueEffect[];
  derivedValues: HomogeneousDerivedValueEffect[];
  effects: HomogeneousAdjacencyRule[];
  homogeneousResolvedValues: HomogeneousResolvedValueMap;
  keywords: Set<string>;
  aimKeywords: string[];
  synergies: ResolvedTowerSynergy[];
  warnings: TowerBuildWarning[];
}

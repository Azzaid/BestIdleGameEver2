import type { EntityId } from './common.ts';
import type { DamageProfile, TowerDamageProfiles } from './damage.ts';
import type { SpriteInfo } from './spriteInfo.ts';
import type { InfectionApplication } from './statusEffects.ts';
import type { TowerStatsResolved } from './towerParts.ts';

export const INITIAL_TOWER_AIM_RADIANS = -Math.PI / 2;

export interface TowerData {
  // Resolved from the build phase (keywords + numeric mods)
  rotationSpeed: number;   // deg/sec
  shotsPerSecond: number;
  burstCount: number;
  projectileDamageProfile: DamageProfile;
  projectileSpeed: number;
  projectileRadius: number;
  projectileSpread: number; // deg
  projectileSprite?: SpriteInfo;
  aoeRadius: number;
  keywords: Set<string>;
  targetingDistanceLimit: number;
  maximumRange: number;
  minimumRange: number;
  maximumRotationAngle: number; // deg
  zeroRotationRadians: number;
  triggerTolerance: number; // deg
  zonePushBackDistance: number;
  zonePushBacksPerSecond: number;
  zonePushBackZoneSize: number;
  zoneFleeDuration: number;
  zoneFleesPerSecond: number;
  zoneFleeZoneSize: number;
  zoneCircleDuration: number;
  zoneCirclesPerSecond: number;
  zoneCircleZoneSize: number;
  zoneDotDamageProfile: DamageProfile;
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
  singleTargetDotDamageProfile: DamageProfile;
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
  singleTargetInfectionDamageProfile: DamageProfile;
  projectileInfection?: InfectionApplication;

  // Runtime targeting state
  rangeCityPixels: number;
  currentTarget?: EntityId;
  gunEntity: EntityId;
  projectileSpawnOffset: { x: number; y: number };

    aimKeywords: string[]; // TODO: set from Redux build results

    // Retarget hold
    retargetCooldownSeconds: number;
    retargetRemainingSeconds: number;
}

export interface StandaloneTowerDefense {
  id: string;
  wallCellKey?: string;
  wallColumn?: number;
  stats: TowerStatsResolved;
  damageProfiles: TowerDamageProfiles;
  keywords: Set<string>;
  aimKeywords: string[];
}

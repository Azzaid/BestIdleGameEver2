import type { EntityId } from './common.ts';
import type { SpriteInfo } from './spriteInfo.ts';
import type { TowerStatsResolved } from './towerParts.ts';

export const INITIAL_TOWER_AIM_RADIANS = -Math.PI / 2;

export interface TowerData {
  // Resolved from the build phase (keywords + numeric mods)
  rotationSpeed: number;   // rad/sec
  shotsPerSecond: number;
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  projectileRadius: number;
  projectileSpread: number;
  projectileSprite?: SpriteInfo;
  aoeRadius: number;
  keywords: Set<string>;
  targetingDistanceLimit: number;
  maximumRange: number;
  minimumRange: number;
  maximumRotationAngle: number;
  zeroRotationRadians: number;
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

  // Runtime targeting state
  rangePixels: number;
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
  keywords: Set<string>;
  aimKeywords: string[];
}

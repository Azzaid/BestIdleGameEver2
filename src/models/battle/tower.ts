import type { EntityId } from './common.ts';
import type { SpriteInfo } from './spriteInfo.ts';

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

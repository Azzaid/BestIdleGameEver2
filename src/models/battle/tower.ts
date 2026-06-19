import type { EntityId } from './common.ts';

export type GunSlotDirection = 0 | 1 | 2 | 3;

export const INITIAL_TOWER_AIM_RADIANS = -Math.PI / 2;

export interface TowerData {
  // Resolved from the build phase (keywords + numeric mods)
  rotationSpeed: number;   // rad/sec
  reloadSpeed: number;     // shots/sec
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  projectileRadius: number;
  projectileSpread: number;
  aoeRadius: number;
  keywords: Set<string>;
  targetingDistanceLimit: number;
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

import type * as PIXI from 'pixi.js';
import type { EntityId } from './common.ts';
import type { Transform } from './transform.ts';
import type { MovementController } from './movement.ts';
import type { Lifespan } from './lifespan.ts';
import type { Health } from './health.ts';
import type { TowerData } from './tower.ts';
import type { EnemyData } from './enemy.ts';
import type { WaveSchedulerConfig, WaveSchedulerState } from './wave.ts';
import type { WaveSpawner } from './waveSpawner.ts';
import type { EnemyBlueprint } from './enemyBlueprints.ts';
import type { DamageProfile } from './damage.ts';

export interface DamageAreaVfxView {
  container: PIXI.Container;
  content: PIXI.Container;
  mask: PIXI.Graphics;
  elapsedSeconds: number;
  renderKey: string;
  pulseElapsedSeconds: number;
  lastPulseTriggerCount: number;
}

export interface TowerPushBackState {
  remainingSeconds: number;
  speedPixelsPerSecond: number;
  directionX: number;
  directionY: number;
}

export interface TowerMovementOverrideState {
  remainingSeconds: number;
  originalMovement: MovementController;
}

export interface MonsterMovementModifiers {
  speedFlat: number;
  speedMultiplier: number;
  swayFlat: number;
  swayMultiplier: number;
}

export interface WallZoneEffects {
  pushBackDistance: number;
  pushBacksPerSecond: number;
  pushBackEffectZoneSize: number;
  zoneDotDamageProfile: DamageProfile;
  zoneDotTicksPerSecond: number;
  zoneDotZoneSize: number;
}

export interface ProjectileInfo {
  damageProfile: DamageProfile;
  projectileRadius: number;
  aoeRadius: number;
  speedPixelsPerSecond: number;
  directionRadians: number;
}

export interface WorldConfig {
  battlefieldWidth: number;
  battlefieldHeight: number;
  wallY: number;
  wallContactY: number;
  app: PIXI.Application;
  initialThreat: number;
  targetThreat: number;
  threatGrowthPerSecond: number;
  waveThreatToCityThreatRatio: number;
  simultaneousMonstersLimit: number;
  timeBetweenWavesSeconds: number;
  fastForwardWavesWhenCleared: boolean;
  completesWhenThreatTargetReached: boolean;
  wallResilience: number;
  wallIgnoredThreat: number;
  monsterMovementModifiers: MonsterMovementModifiers;
  wallZoneEffects: WallZoneEffects;
  onBattleMetrics?: (metrics: BattleMetrics) => void;
  onBattleEnded?: (result: BattleResult) => void;
}

export interface BattleMetrics {
  threat: number;
  targetThreat: number;
  siegeElapsedSeconds: number;
  siegePressure: number;
  wallResilience: number;
}

export interface BattleResult extends BattleMetrics {
  outcome: "held" | "overwhelmed";
}

export interface World {
  nextEntityId: number;
  config: WorldConfig;
    spawners: WaveSpawner[];
    waveScheduler: {
        config: WaveSchedulerConfig;
        state: WaveSchedulerState;
        enemyIds: string[];
        blueprints: Record<string, EnemyBlueprint>;
    };

  transforms: Map<EntityId, Transform>;
  movements: Map<EntityId, MovementController>;
  lifespans: Map<EntityId, Lifespan>;
  healths: Map<EntityId, Health>;
  towersData: Map<EntityId, TowerData>;
  enemiesData: Map<EntityId, EnemyData>;

  worldLayer: PIXI.Container;
  sprites: Map<EntityId, PIXI.ContainerChild>;
  healthBars: Map<EntityId, PIXI.Graphics>;
  debugTowerTargetingRings: Map<EntityId, PIXI.Graphics>;
  damageAreaVfxViews: Map<string, DamageAreaVfxView>;
  damageAreaVfxPulseTriggers: Map<string, number>;

  toRemove: Set<EntityId>;
  siegePressure: number;
  siegeElapsedSeconds: number;
  defeatedEnemies: number;
  currentThreat: number;
  battleEnded: boolean;
  lastBattleEndWasHandled: boolean;
  towerReloadRemainingSeconds: Map<EntityId, number>;
  enemyPushBackCooldownRemainingSeconds: Map<EntityId, number>;
  enemyPushBackRemainingSeconds: Map<EntityId, number>;
  wallZoneDotProgress: number;
  enemyTowerZoneCooldownRemainingSeconds: Map<string, number>;
  enemyTowerPushBacks: Map<string, TowerPushBackState>;
  enemyTowerZoneDotProgress: Map<string, number>;
  towerZoneDotProgress: Map<EntityId, number>;
  enemyTowerMovementOverrides: Map<EntityId, TowerMovementOverrideState>;
  enemyTowerStunRemainingSeconds: Map<EntityId, number>;

  projectileInfo: Map<EntityId, ProjectileInfo>;
}

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

export interface WorldConfig {
  battlefieldWidth: number;
  battlefieldHeight: number;
  wallY: number;
  app: PIXI.Application;
  initialThreat: number;
  targetThreat: number;
  threatGrowthPerSecond: number;
  waveThreatToCityThreatRatio: number;
  timeBetweenWavesSeconds: number;
  fastForwardWavesWhenCleared: boolean;
  completesWhenThreatTargetReached: boolean;
  wallResilience: number;
  wallIgnoredThreat: number;
  onBattleMetrics?: (metrics: BattleMetrics) => void;
  onBattleEnded?: (result: BattleResult) => void;
}

export interface BattleMetrics {
  threat: number;
  targetThreat: number;
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

  toRemove: Set<EntityId>;
  siegePressure: number;
  defeatedEnemies: number;
  currentThreat: number;
  battleEnded: boolean;
  towerReloadRemainingSeconds: Map<EntityId, number>;

  projectileInfo: Map<EntityId, { damage: number; aoeRadius: number; keywords: Set<string> }>;
}

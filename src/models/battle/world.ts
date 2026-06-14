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
  onWaveThreatReached?: (threat: number) => void;
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
  wallLoad: number;
  defeatedEnemies: number;
  towerReloadRemainingSeconds: Map<EntityId, number>;

  projectileInfo: Map<EntityId, { damage: number; aoeRadius: number; keywords: Set<string> }>;
}

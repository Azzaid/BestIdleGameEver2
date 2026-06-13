import * as PIXI from 'pixi.js';
import type { EntityId } from '../../../models/battle/common.ts';
import type { Transform } from '../../../models/battle/transform.ts';
import type { MovementController } from '../../../models/battle/movement.ts';
import type { Lifespan } from '../../../models/battle/lifespan.ts';
import type { Health } from '../../../models/battle/health.ts';
import type { TowerData } from '../../../models/battle/tower.ts';
import type { EnemyData } from '../../../models/battle/enemy.ts';
import type { WaveSchedulerConfig, WaveSchedulerState } from '../../../models/battle/wave.ts';
import { WaveSpawner } from '../spawn/waveSpawner';
import type { EnemyBlueprint } from '../../../models/battle/enemyBlueprints';
import { BATTLE_ENEMY_BLUEPRINTS, BATTLE_ENEMY_IDS } from '../../../data/battle/enemies.ts';

export interface WorldConfig {
  battlefieldWidth: number;
  battlefieldHeight: number;
  wallY: number;
  app: PIXI.Application;
}

export interface World {
  nextEntityId: number;
  config: WorldConfig;
    spawners: WaveSpawner[];              // active spawners for current waves
    waveScheduler: {
        config: WaveSchedulerConfig;        // fixed per battle (set on scene start)
        state: WaveSchedulerState;          // changes during battle
        /** Enemy content feed for planning (TODO: wire from your Redux content). */
        enemyIds: string[];
        blueprints: Record<string, EnemyBlueprint>;
    };

  // Components (presence in these maps implies role)
  transforms: Map<EntityId, Transform>;
  movements: Map<EntityId, MovementController>;
  lifespans: Map<EntityId, Lifespan>;
  healths: Map<EntityId, Health>;
  towersData: Map<EntityId, TowerData>;
  enemiesData: Map<EntityId, EnemyData>;

  // View
  worldLayer: PIXI.Container;
  sprites: Map<EntityId, PIXI.ContainerChild>;
  healthBars: Map<EntityId, PIXI.Graphics>;

  // Housekeeping
  toRemove: Set<EntityId>;
  wallLoad: number;
  defeatedEnemies: number;
  towerReloadRemainingSeconds: Map<EntityId, number>;

  // Projectiles metadata (POC; formalize later if you prefer)
  projectileInfo: Map<EntityId, { damage: number; aoeRadius: number; keywords: Set<string> }>;
}

export function createWorld(config: WorldConfig): World {
  const worldLayer = new PIXI.Container();
  worldLayer.sortableChildren = true;
  return {
      nextEntityId: 1,
      config,
      transforms: new Map(),
      movements: new Map(),
      lifespans: new Map(),
      healths: new Map(),
      towersData: new Map(),
      enemiesData: new Map(),
      worldLayer,
      sprites: new Map(),
      healthBars: new Map(),
      toRemove: new Set(),
      wallLoad: 0,
      defeatedEnemies: 0,
      towerReloadRemainingSeconds: new Map(),
      projectileInfo: new Map(),
      spawners: [],
      waveScheduler: {
          config: {
              timeBetweenWavesSeconds: 12,     // TODO: set from battle rules
              initialWaveStrength: 60,         // TODO: set from battle rules
              waveStrengthIncrementFactor: 1.15, // TODO: set from battle rules
              maxConcurrentSpawners: 3,
          },
          state: {
              timeUntilNextWaveSeconds: 0,     // start immediately
              currentWaveIndex: 0,
              totalWavesSpawned: 0,
              enabled: true,
          },
          enemyIds: BATTLE_ENEMY_IDS,
          blueprints: BATTLE_ENEMY_BLUEPRINTS,
      },
  };
}

export function createEntityId(world: World): EntityId {
  const id = world.nextEntityId++;
  return id;
}

export function* withAll(
  ...maps: { has(id: EntityId): boolean; keys(): IterableIterator<EntityId> }[]
): Generator<EntityId> {
  if (maps.length === 0) return;
  const [first, ...rest] = maps;
  for (const id of first.keys()) {
    let ok = true;
    for (const m of rest) if (!m.has(id)) { ok = false; break; }
    if (ok) yield id;
  }
}

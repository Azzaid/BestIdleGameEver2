import * as PIXI from 'pixi.js';
import type { EntityId } from '../../../models/battle/common.ts';
import type { World, WorldConfig } from '../../../models/battle/world.ts';
import { BATTLE_ENEMY_BLUEPRINTS, BATTLE_ENEMY_IDS } from '../../../data/enemies/index.ts';

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
      siegePressure: 0,
      defeatedEnemies: 0,
      currentThreat: config.initialThreat,
      battleEnded: false,
      towerReloadRemainingSeconds: new Map(),
      projectileInfo: new Map(),
      spawners: [],
      waveScheduler: {
          config: {
              timeBetweenWavesSeconds: config.timeBetweenWavesSeconds,
              initialWaveStrength: Math.max(1, config.initialThreat),
              waveStrengthIncrementFactor: 1,
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

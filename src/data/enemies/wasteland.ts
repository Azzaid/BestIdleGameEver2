import type {EnemyBlueprint} from "../../models/battle/enemyBlueprints.ts";
import {enemies} from "../identificators/index.ts";

function createWallboundMovement(speedPixelsPerSecond: number, wobbleAmplitudePixels = 0): EnemyBlueprint['createMovement'] {
  return (spawnX, _spawnY, world) => ({
    kind: 'wobble',
    baseSpeedPixelsPerSecond: speedPixelsPerSecond,
    wobbleAmplitudePixels,
    wobbleFrequencyHz: 0.25,
    timeAliveSeconds: 0,
    goalY: world.config.wallContactY,
    initialX: spawnX,
  });
}

export const wastelandEnemies: Record<string, EnemyBlueprint> = {
  [enemies.wasteland.scrapling]: {
    id: enemies.wasteland.scrapling,
    displayName: 'Scrapling',
    strengthCost: 8,
    selectionWeight: 5,
    kind: 'melee',
    pressure: 2,
    maxHitPoints: 2,
    armor: 0,
    hitRadius: 12,
    keywords: new Set(['small', 'swarm']),
    sprite: { textureKey: 'enemy_scrapling' },
    createMovement: createWallboundMovement(58, 14),
    swarmSize: 3,
    swarmSizeMax: 5,
  },
  [enemies.wasteland.platedCrawler]: {
    id: enemies.wasteland.platedCrawler,
    displayName: 'Plated Crawler',
    strengthCost: 22,
    selectionWeight: 2,
    kind: 'melee',
    pressure: 8,
    maxHitPoints: 10,
    armor: 3,
    hitRadius: 18,
    keywords: new Set(['armored']),
    sprite: { textureKey: 'enemy_plated_crawler' },
    createMovement: createWallboundMovement(34, 6),
  },
  [enemies.wasteland.ridgeSpitter]: {
    id: enemies.wasteland.ridgeSpitter,
    displayName: 'Ridge Spitter',
    strengthCost: 18,
    selectionWeight: 2.5,
    kind: 'ranged',
    pressure: 5,
    maxHitPoints: 4,
    armor: 1,
    hitRadius: 15,
    shotDistance: 180,
    keywords: new Set(['ranged']),
    sprite: { textureKey: 'enemy_ridge_spitter' },
    createMovement: createWallboundMovement(42, 10),
  },
};

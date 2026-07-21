import * as PIXI from 'pixi.js';
import type { EntityId } from '../../../models/battle/common.ts';
import type { TowerData } from '../../../models/battle/tower.ts';
import type { World } from '../../../models/battle/world.ts';

const RING_COLOR = 0x45a7ff;
const RING_ALPHA = 0.85;
const RING_WIDTH = 2;

export function DebugTowerTargetingRadiusSystem(world: World) {
  if (!import.meta.env.DEV) return;

  for (const [towerId, tower] of world.towersData) {
    const transform = world.transforms.get(towerId);
    const radius = getEffectiveTargetingRadius(tower);
    if (!transform || radius <= 0) {
      destroyRing(world, towerId);
      continue;
    }

    let ring = world.debugTowerTargetingRings.get(towerId);
    if (!ring) {
      ring = createRing(radius);
      world.debugTowerTargetingRings.set(towerId, ring);
      world.worldLayer.addChild(ring);
    }

    ring.position.set(transform.position.x, transform.position.y);
  }

  for (const towerId of world.debugTowerTargetingRings.keys()) {
    if (!world.towersData.has(towerId)) {
      destroyRing(world, towerId);
    }
  }
}

function createRing(radius: number) {
  const ring = new PIXI.Graphics()
    .circle(0, 0, radius)
    .stroke({ color: RING_COLOR, alpha: RING_ALPHA, width: RING_WIDTH });

  ring.zIndex = 12;
  return ring;
}

function destroyRing(world: World, towerId: EntityId) {
  const ring = world.debugTowerTargetingRings.get(towerId);
  if (!ring) return;

  ring.parent?.removeChild(ring);
  ring.destroy();
  world.debugTowerTargetingRings.delete(towerId);
}

function getEffectiveTargetingRadius(tower: TowerData) {
  return Number.isFinite(tower.maximumRange)
    ? Math.min(tower.targetingDistanceLimit, tower.maximumRange)
    : tower.targetingDistanceLimit;
}

import type { World } from '../../../models/battle/world.ts';
import { predictProjectileAimAngle } from './towerAim.ts';

function shortestAngleDelta(current: number, desired: number): number {
  let d = desired - current;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

export function AimingSystem(world: World, dt: number) {
  for (const [towerId, tower] of world.towersData) {
    if (!tower.currentTarget) continue;

    const baseTf = world.transforms.get(towerId);
    const gunTf = world.transforms.get(tower.gunEntity);
    if (!baseTf || !gunTf) continue;

    const targetTransform = world.transforms.get(tower.currentTarget);
    if (!targetTransform) continue;

    const desired = predictProjectileAimAngle({
      basePosition: baseTf.position,
      currentAngleRadians: gunTf.rotationRadians,
      projectileSpawnOffset: tower.projectileSpawnOffset,
      targetTransform,
      targetMovement: world.movements.get(tower.currentTarget),
      projectileSpeed: tower.projectileSpeed,
    });
    const delta = shortestAngleDelta(gunTf.rotationRadians, desired);
    const maxTurn = tower.rotationSpeed * dt;
    const applied = Math.max(-maxTurn, Math.min(maxTurn, delta));

    gunTf.rotationRadians += applied;
    baseTf.rotationRadians = gunTf.rotationRadians;
    gunTf.position.x = baseTf.position.x;
    gunTf.position.y = baseTf.position.y;
  }
}

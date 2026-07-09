import type { World } from '../../../models/battle/world.ts';
import { predictProjectileAimAngle, shortestAngleDelta } from './towerAim.ts';

export function AimingSystem(world: World, dt: number) {
  for (const [towerId, tower] of world.towersData) {
    if (!tower.currentTarget) continue;

    const baseTf = world.transforms.get(towerId);
    const gunTf = world.transforms.get(tower.gunEntity);
    if (!baseTf || !gunTf) continue;

    const targetTransform = world.transforms.get(tower.currentTarget);
    if (!targetTransform) continue;
    const targetEnemy = world.enemiesData.get(tower.currentTarget);

    const desired = predictProjectileAimAngle({
      basePosition: baseTf.position,
      currentAngleRadians: gunTf.rotationRadians,
      projectileSpawnOffset: tower.projectileSpawnOffset,
      targetTransform,
      targetMovement: targetEnemy?.mode === 'attack' ? undefined : world.movements.get(tower.currentTarget),
      projectileSpeed: tower.projectileSpeed,
      monsterMovementModifiers: world.config.monsterMovementModifiers,
    });
    const constrainedDesired = constrainTowerAimAngle(
      desired,
      tower.zeroRotationRadians,
      tower.maximumRotationAngle,
    );
    const delta = shortestAngleDelta(gunTf.rotationRadians, constrainedDesired);
    const maxTurn = tower.rotationSpeed * dt;
    const applied = Math.max(-maxTurn, Math.min(maxTurn, delta));

    gunTf.rotationRadians = constrainTowerAimAngle(
      gunTf.rotationRadians + applied,
      tower.zeroRotationRadians,
      tower.maximumRotationAngle,
    );
    baseTf.rotationRadians = gunTf.rotationRadians;
    gunTf.position.x = baseTf.position.x;
    gunTf.position.y = baseTf.position.y;
  }
}

function constrainTowerAimAngle(
  angleRadians: number,
  zeroRotationRadians: number,
  maximumRotationAngle: number,
): number {
  if (!Number.isFinite(maximumRotationAngle)) return angleRadians;

  const delta = shortestAngleDelta(zeroRotationRadians, angleRadians);
  const constrainedDelta = Math.max(-maximumRotationAngle, Math.min(maximumRotationAngle, delta));
  return zeroRotationRadians + constrainedDelta;
}

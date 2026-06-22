import type { Transform } from '../../../models/battle/transform.ts';
import type { MovementController } from '../../../models/battle/movement.ts';
import type { MonsterMovementModifiers } from '../../../models/battle/world.ts';

export function shortestAngleDelta(current: number, desired: number): number {
  let d = desired - current;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

export function getProjectileSpawnPosition(
  basePosition: { x: number; y: number },
  angleRadians: number,
  spawnOffset: { x: number; y: number }
) {
  return {
    x: basePosition.x + Math.cos(angleRadians) * spawnOffset.x - Math.sin(angleRadians) * spawnOffset.y,
    y: basePosition.y + Math.sin(angleRadians) * spawnOffset.x + Math.cos(angleRadians) * spawnOffset.y,
  };
}

function predictAimAngleFromPoint(
  projectileOrigin: { x: number; y: number },
  targetTransform: Transform,
  targetMovement: MovementController | undefined,
  projectileSpeed: number,
  monsterMovementModifiers: MonsterMovementModifiers
) {
  const rx = targetTransform.position.x - projectileOrigin.x;
  const ry = targetTransform.position.y - projectileOrigin.y;

  if (!targetMovement || targetMovement.kind !== 'linear') {
    return Math.atan2(ry, rx);
  }

  const baseVelocity = targetMovement.velocityPixelsPerSecond;
  const baseSpeed = Math.hypot(baseVelocity.x, baseVelocity.y);
  const speed = Math.max(0, (baseSpeed + monsterMovementModifiers.speedFlat) * monsterMovementModifiers.speedMultiplier);
  const directionRadians = Math.atan2(baseVelocity.y, baseVelocity.x);
  const vx = Math.cos(directionRadians) * speed;
  const vy = Math.sin(directionRadians) * speed;
  const v2 = vx * vx + vy * vy;
  const s2 = projectileSpeed * projectileSpeed;
  const a = v2 - s2;
  const b = 2 * (rx * vx + ry * vy);
  const c = rx * rx + ry * ry;
  let t: number;

  if (Math.abs(a) < 1e-6) {
    if (Math.abs(b) < 1e-6) return Math.atan2(ry, rx);
    t = -c / b;
  } else {
    const disc = b * b - 4 * a * c;
    if (disc < 0) return Math.atan2(ry, rx);

    const sqrt = Math.sqrt(disc);
    const t1 = (-b - sqrt) / (2 * a);
    const t2 = (-b + sqrt) / (2 * a);
    t = Math.min(t1, t2);
    if (t < 0) t = Math.max(t1, t2);
    if (t < 0) return Math.atan2(ry, rx);
  }

  const aimX = targetTransform.position.x + vx * t;
  const aimY = targetTransform.position.y + vy * t;
  return Math.atan2(aimY - projectileOrigin.y, aimX - projectileOrigin.x);
}

export function predictProjectileAimAngle(args: {
  basePosition: { x: number; y: number };
  currentAngleRadians: number;
  projectileSpawnOffset: { x: number; y: number };
  targetTransform: Transform;
  targetMovement: MovementController | undefined;
  projectileSpeed: number;
  monsterMovementModifiers: MonsterMovementModifiers;
}) {
  let angle = args.currentAngleRadians;

  for (let i = 0; i < 4; i++) {
    const projectileOrigin = getProjectileSpawnPosition(
      args.basePosition,
      angle,
      args.projectileSpawnOffset
    );
    angle = predictAimAngleFromPoint(
      projectileOrigin,
      args.targetTransform,
      args.targetMovement,
      args.projectileSpeed,
      args.monsterMovementModifiers
    );
  }

  return angle;
}

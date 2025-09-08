import type { World } from '../core/world';

function shortestAngleDelta(current: number, desired: number): number {
  let d = desired - current;
  while (d > Math.PI) d -= 2*Math.PI;
  while (d < -Math.PI) d += 2*Math.PI;
  return d;
}

/** Lead prediction for linear movement only. Returns desired angle. */
function predictAimAngleForLinear(world: World, towerId: number, targetId: number, projectileSpeed: number): number {
  const towerPos = world.transforms.get(towerId)!.position;
  const enemyTf = world.transforms.get(targetId)!;
  const mv = world.movements.get(targetId);
  if (!mv || mv.kind !== 'linear') {
    // no prediction for non-linear — aim at current pos
    return Math.atan2(enemyTf.position.y - towerPos.y, enemyTf.position.x - towerPos.x);
    }
  const ex = enemyTf.position.x, ey = enemyTf.position.y;
  const vx = mv.velocityPixelsPerSecond.x, vy = mv.velocityPixelsPerSecond.y;
  const rx = ex - towerPos.x, ry = ey - towerPos.y;
  const v2 = vx*vx + vy*vy;
  const s2 = projectileSpeed * projectileSpeed;

  // Solve |r + v t|^2 = (s t)^2  -> (v.v - s^2) t^2 + 2 r.v t + r.r = 0
  const a = v2 - s2;
  const b = 2 * (rx*vx + ry*vy);
  const c = rx*rx + ry*ry;
  let t: number;

  if (Math.abs(a) < 1e-6) {
    if (Math.abs(b) < 1e-6) return Math.atan2(ry, rx); // no relative motion
    t = -c / b;
  } else {
    const disc = b*b - 4*a*c;
    if (disc < 0) return Math.atan2(ry, rx);
    const sqrt = Math.sqrt(disc);
    const t1 = (-b - sqrt) / (2*a);
    const t2 = (-b + sqrt) / (2*a);
    t = Math.min(t1, t2);
    if (t < 0) t = Math.max(t1, t2);
    if (t < 0) return Math.atan2(ry, rx);
  }

  const aimX = ex + vx * t;
  const aimY = ey + vy * t;
  return Math.atan2(aimY - towerPos.y, aimX - towerPos.x);
}

export function AimingSystem(world: World, dt: number) {
  for (const [towerId, tower] of world.towersData) {
    if (!tower.currentTarget) continue;
    const baseTf = world.transforms.get(towerId);
    const gunTf = world.transforms.get(tower.gunEntity);
    if (!baseTf || !gunTf) continue;

    const desired = predictAimAngleForLinear(world, towerId, tower.currentTarget, tower.projectileSpeed);

    const delta = shortestAngleDelta(gunTf.rotationRadians, desired);
    const maxTurn = tower.rotationSpeed * dt;
    const applied = Math.max(-maxTurn, Math.min(maxTurn, delta));
    gunTf.rotationRadians += applied;

    gunTf.position.x = baseTf.position.x;
    gunTf.position.y = baseTf.position.y;
  }
}

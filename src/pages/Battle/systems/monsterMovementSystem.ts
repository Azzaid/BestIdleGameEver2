import type { World } from '../../../models/battle/world.ts';
import type { MovementController } from '../../../models/battle/movement.ts';
import type { Transform } from '../../../models/battle/transform.ts';

const DEFAULT_MONSTER_SWAY_FREQUENCY_HZ = 0.25;

export function MonsterMovementSystem(world: World, dt: number) {
  for (const [entityId, enemy] of world.enemiesData) {
    const movement = world.movements.get(entityId);
    const transform = world.transforms.get(entityId);
    if (!movement || !transform) continue;

    const stunRemaining = world.enemyTowerStunRemainingSeconds.get(entityId) ?? 0;
    if (stunRemaining > 0) {
      const nextStunRemaining = Math.max(0, stunRemaining - dt);
      if (nextStunRemaining > 0) {
        world.enemyTowerStunRemainingSeconds.set(entityId, nextStunRemaining);
      } else {
        world.enemyTowerStunRemainingSeconds.delete(entityId);
      }
      stopEnemyAtEngagementLine(world, entityId, enemy.hitRadius, getEnemyWallEngagementDistance(enemy.kind, enemy.shotDistance));
      continue;
    }

    switch (movement.kind) {
      case 'linear': {
        const baseVelocity = movement.velocityPixelsPerSecond;
        const baseSpeed = Math.hypot(baseVelocity.x, baseVelocity.y);
        const speed = getMonsterMovementSpeed(world, baseSpeed);
        const directionRadians = Math.atan2(baseVelocity.y, baseVelocity.x);

        transform.position.x += Math.cos(directionRadians) * speed * dt;
        transform.position.y += Math.sin(directionRadians) * speed * dt;
        transform.rotationRadians = directionRadians;
        applyMonsterSway(world, entityId, movement, transform, directionRadians, dt);
        break;
      }
      case 'wobble': {
        const speed = getMonsterMovementSpeed(world, movement.baseSpeedPixelsPerSecond);
        const swayAmplitude = getMonsterSwayAmplitude(world, movement.wobbleAmplitudePixels);

        movement.timeAliveSeconds += dt;
        transform.position.y += speed * dt;
        transform.position.x = movement.initialX + Math.sin(
          movement.timeAliveSeconds * 2 * Math.PI * movement.wobbleFrequencyHz
        ) * swayAmplitude;
        transform.rotationRadians = Math.PI / 2;
        break;
      }
      case 'polyline': {
        if (!movement.currentTarget || movement.trajectoryRemainingSeconds <= 0) {
          movement.currentTarget = createRandomPolylineTarget(movement, transform);
          movement.trajectoryRemainingSeconds = Math.max(0.05, movement.sameTrajectoryTimeSeconds);
        }

        const deltaX = movement.currentTarget.x - transform.position.x;
        const deltaY = movement.currentTarget.y - transform.position.y;
        const distanceToTarget = Math.hypot(deltaX, deltaY);
        if (distanceToTarget <= 1e-3) {
          movement.currentTarget = null;
          movement.trajectoryRemainingSeconds = 0;
          break;
        }

        const stepSeconds = Math.min(dt, movement.trajectoryRemainingSeconds);
        const stepDistance = getMonsterMovementSpeed(world, movement.speedPixelsPerSecond) * stepSeconds;
        const directionRadians = Math.atan2(deltaY, deltaX);

        if (distanceToTarget <= stepDistance) {
          transform.position.x = movement.currentTarget.x;
          transform.position.y = movement.currentTarget.y;
          movement.currentTarget = null;
          movement.trajectoryRemainingSeconds = 0;
        } else {
          transform.position.x += (deltaX / distanceToTarget) * stepDistance;
          transform.position.y += (deltaY / distanceToTarget) * stepDistance;
          movement.trajectoryRemainingSeconds -= stepSeconds;
        }
        transform.rotationRadians = directionRadians;
        applyMonsterSway(world, entityId, movement, transform, directionRadians, stepSeconds);
        break;
      }
      case 'wander': {
        movement.retargetRemainingSeconds -= dt;
        if (movement.retargetRemainingSeconds <= 0 || !movement.currentTarget) {
          movement.retargetRemainingSeconds = movement.retargetCooldownSeconds;
          const angle = Math.random() * Math.PI * 2;
          const radius = movement.jitterRadius;
          movement.currentTarget = {
            x: transform.position.x + Math.cos(angle) * radius,
            y: transform.position.y + Math.sin(angle) * radius,
          };
        }

        const deltaX = movement.currentTarget.x - transform.position.x;
        const deltaY = movement.currentTarget.y - transform.position.y;
        const distanceToTarget = Math.hypot(deltaX, deltaY);
        if (distanceToTarget > 1e-3) {
          const stepDistance = getMonsterMovementSpeed(world, movement.speedPixelsPerSecond) * dt;
          const unitX = deltaX / distanceToTarget;
          const unitY = deltaY / distanceToTarget;
          const directionRadians = Math.atan2(unitY, unitX);

          transform.position.x += unitX * stepDistance;
          transform.position.y += unitY * stepDistance;
          transform.rotationRadians = directionRadians;
          applyMonsterSway(world, entityId, movement, transform, directionRadians, dt);
        }
        break;
      }
      case 'flee': {
        const deltaX = transform.position.x - movement.threatPoint.x;
        const deltaY = transform.position.y - movement.threatPoint.y;
        const distanceFromThreat = Math.hypot(deltaX, deltaY) || 1;
        const stepDistance = getMonsterMovementSpeed(world, movement.speedPixelsPerSecond) * dt;
        const directionRadians = Math.atan2(deltaY, deltaX);

        transform.position.x += (deltaX / distanceFromThreat) * stepDistance;
        transform.position.y += (deltaY / distanceFromThreat) * stepDistance;
        transform.rotationRadians = directionRadians;
        applyMonsterSway(world, entityId, movement, transform, directionRadians, dt);
        break;
      }
      case 'circle': {
        const deltaX = transform.position.x - movement.centerPoint.x;
        const deltaY = transform.position.y - movement.centerPoint.y;
        const distanceFromCenter = Math.hypot(deltaX, deltaY) || 1;
        const tangentSign = movement.clockwise ? 1 : -1;
        const unitTangentX = (-deltaY / distanceFromCenter) * tangentSign;
        const unitTangentY = (deltaX / distanceFromCenter) * tangentSign;
        const stepDistance = getMonsterMovementSpeed(world, movement.speedPixelsPerSecond) * dt;
        const directionRadians = Math.atan2(unitTangentY, unitTangentX);

        transform.position.x += unitTangentX * stepDistance;
        transform.position.y += unitTangentY * stepDistance;
        transform.rotationRadians = directionRadians;
        applyMonsterSway(world, entityId, movement, transform, directionRadians, dt);
        break;
      }
      case 'blink': {
        const baseDriftSpeed = Math.hypot(movement.driftVelocity.x, movement.driftVelocity.y);
        const driftDirectionRadians = Math.atan2(movement.driftVelocity.y, movement.driftVelocity.x);
        const driftSpeed = getMonsterMovementSpeed(world, baseDriftSpeed);

        movement.blinkRemainingSeconds -= dt;
        transform.position.x += Math.cos(driftDirectionRadians) * driftSpeed * dt;
        transform.position.y += Math.sin(driftDirectionRadians) * driftSpeed * dt;
        applyMonsterSway(world, entityId, movement, transform, driftDirectionRadians, dt);

        if (movement.blinkRemainingSeconds <= 0) {
          movement.blinkRemainingSeconds = movement.blinkCooldownSeconds;
          const angle = Math.random() * Math.PI * 2;
          const nextX = transform.position.x + Math.cos(angle) * movement.blinkDistancePixels;
          const nextY = transform.position.y + Math.sin(angle) * movement.blinkDistancePixels;
          if (movement.bounds) {
            transform.position.x = Math.max(movement.bounds.x0, Math.min(nextX, movement.bounds.x1));
            transform.position.y = Math.max(movement.bounds.y0, Math.min(nextY, movement.bounds.y1));
          } else {
            transform.position.x = nextX;
            transform.position.y = nextY;
          }
        }
        break;
      }
    }

    stopEnemyAtEngagementLine(world, entityId, enemy.hitRadius, getEnemyWallEngagementDistance(enemy.kind, enemy.shotDistance));
  }
}

function getMonsterMovementSpeed(world: World, baseSpeed: number) {
  const { speedFlat, speedMultiplier } = world.config.monsterMovementModifiers;
  return Math.max(0, (baseSpeed + speedFlat) * speedMultiplier);
}

function getMonsterSwayAmplitude(world: World, baseSwayAmplitude: number) {
  const { swayFlat, swayMultiplier } = world.config.monsterMovementModifiers;
  return Math.max(0, (baseSwayAmplitude + swayFlat) * swayMultiplier);
}

function createRandomPolylineTarget(
  movement: Extract<MovementController, {kind: 'polyline'}>,
  transform: Transform,
) {
  const sameTrajectoryTimeSeconds = Math.max(0.05, movement.sameTrajectoryTimeSeconds);
  const forwardDistance = movement.speedPixelsPerSecond * sameTrajectoryTimeSeconds * randomBetween(0.5, 1);
  const lateralDistance = movement.lateralSpeedPixelsPerSecond * sameTrajectoryTimeSeconds * randomBetween(0.5, 1);
  const lateralSign = Math.random() < 0.5 ? -1 : 1;
  const target = {
    x: transform.position.x + lateralDistance * lateralSign,
    y: transform.position.y + forwardDistance,
  };

  if (!movement.bounds) return target;

  return {
    x: clamp(target.x, movement.bounds.x0, movement.bounds.x1),
    y: clamp(target.y, movement.bounds.y0, movement.bounds.y1),
  };
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function applyMonsterSway(
  world: World,
  entityId: number,
  movement: MovementController,
  transform: Transform,
  movementDirectionRadians: number,
  dt: number,
) {
  const swayAmplitude = getMonsterSwayAmplitude(world, 0);
  if (swayAmplitude <= 0) return;

  movement.swayElapsedSeconds = (movement.swayElapsedSeconds ?? 0) + dt;
  movement.swaySeedRadians ??= (entityId * 12.9898) % (Math.PI * 2);

  const nextSwayOffset = Math.sin(
    movement.swayElapsedSeconds * 2 * Math.PI * DEFAULT_MONSTER_SWAY_FREQUENCY_HZ
      + movement.swaySeedRadians
  ) * swayAmplitude;
  const previousSwayOffset = movement.previousSwayOffsetPixels ?? nextSwayOffset;
  const swayDelta = nextSwayOffset - previousSwayOffset;

  movement.previousSwayOffsetPixels = nextSwayOffset;
  transform.position.x += Math.cos(movementDirectionRadians + Math.PI / 2) * swayDelta;
  transform.position.y += Math.sin(movementDirectionRadians + Math.PI / 2) * swayDelta;
}

function stopEnemyAtEngagementLine(world: World, entityId: number, enemyHitRadius: number, wallEngagementDistance: number) {
  const transform = world.transforms.get(entityId);
  if (!transform) return;

  const engagementY = world.config.wallContactY - wallEngagementDistance - enemyHitRadius;
  if (transform.position.y < engagementY) return;

  transform.position.y = engagementY;
  transform.rotationRadians = Math.PI / 2;
}

function getEnemyWallEngagementDistance(enemyKind: string, shotDistance: number | undefined) {
  if (enemyKind !== 'ranged') return 0;

  return Math.max(0, shotDistance ?? 0);
}

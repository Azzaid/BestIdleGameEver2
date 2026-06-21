import type { World } from '../../../models/battle/world.ts';
import type { MovementController } from '../../../models/battle/movement.ts';
import type { Transform } from '../../../models/battle/transform.ts';

const DEFAULT_MONSTER_SWAY_FREQUENCY_HZ = 0.25;

export function MonsterMovementSystem(world: World, dt: number) {
  for (const [entityId, enemy] of world.enemiesData) {
    const movement = world.movements.get(entityId);
    const transform = world.transforms.get(entityId);
    if (!movement || !transform) continue;

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
        const waypoint = movement.waypoints[movement.currentIndex];
        if (waypoint) {
          const deltaX = waypoint.x - transform.position.x;
          const deltaY = waypoint.y - transform.position.y;
          const distanceToWaypoint = Math.hypot(deltaX, deltaY);
          const stepDistance = getMonsterMovementSpeed(world, movement.speedPixelsPerSecond) * dt;
          const directionRadians = Math.atan2(deltaY, deltaX);

          if (distanceToWaypoint <= stepDistance) {
            transform.position.x = waypoint.x;
            transform.position.y = waypoint.y;
            movement.currentIndex++;
          } else {
            transform.position.x += (deltaX / distanceToWaypoint) * stepDistance;
            transform.position.y += (deltaY / distanceToWaypoint) * stepDistance;
          }

          transform.rotationRadians = directionRadians;
          applyMonsterSway(world, entityId, movement, transform, directionRadians, dt);
        }
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

    stopEnemyAtWall(world, entityId, enemy.hitRadius);
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

function stopEnemyAtWall(world: World, entityId: number, enemyHitRadius: number) {
  const transform = world.transforms.get(entityId);
  if (!transform) return;

  const wallContactY = world.config.wallContactY - enemyHitRadius;
  if (transform.position.y < wallContactY) return;

  transform.position.y = wallContactY;
  transform.rotationRadians = Math.PI / 2;
  world.movements.delete(entityId);
}

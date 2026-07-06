import type { EntityId } from '../../../models/battle/common.ts';
import type { MovementController } from '../../../models/battle/movement.ts';
import type { TowerData } from '../../../models/battle/tower.ts';
import type { World } from '../../../models/battle/world.ts';
import { applyDamageModifiers } from '../keywords/damageResolver.ts';

const PUSH_BACK_DURATION_SECONDS = 0.5;
const MINIMUM_OVERRIDE_SPEED_PIXELS_PER_SECOND = 20;

export function TowerZoneEffectsSystem(world: World, dt: number) {
  updateMovementOverrides(world, dt);
  updateActivePushBacks(world, dt);
  updateCooldowns(world, dt);

  for (const [towerId, tower] of world.towersData) {
    const towerTransform = world.transforms.get(towerId);
    if (!towerTransform) continue;

    updateTowerPushBacks(world, towerId, tower, towerTransform.position);
    updateTowerMovementEffect(world, towerId, tower, towerTransform.position, 'flee');
    updateTowerMovementEffect(world, towerId, tower, towerTransform.position, 'circle');
    updateTowerDots(world, towerId, tower, towerTransform.position, dt);
    updateTowerStuns(world, towerId, tower, towerTransform.position);
    updateSingleTargetPushBacks(world, towerId, tower, towerTransform.position);
    updateSingleTargetMovementEffect(world, towerId, tower, towerTransform.position, 'flee');
    updateSingleTargetMovementEffect(world, towerId, tower, towerTransform.position, 'circle');
    updateSingleTargetDots(world, towerId, tower, towerTransform.position, dt);
    updateSingleTargetStuns(world, towerId, tower, towerTransform.position);
  }
}

function updateMovementOverrides(world: World, dt: number) {
  for (const [enemyId, override] of world.enemyTowerMovementOverrides) {
    const remainingSeconds = override.remainingSeconds - dt;
    if (remainingSeconds > 0) {
      override.remainingSeconds = remainingSeconds;
      continue;
    }

    if (world.movements.has(enemyId)) {
      world.movements.set(enemyId, override.originalMovement);
    }
    world.enemyTowerMovementOverrides.delete(enemyId);
  }
}

function updateActivePushBacks(world: World, dt: number) {
  for (const [key, pushBack] of world.enemyTowerPushBacks) {
    const enemyId = getEnemyIdFromEffectKey(key);
    const enemy = enemyId === undefined ? undefined : world.enemiesData.get(enemyId);
    const transform = enemyId === undefined ? undefined : world.transforms.get(enemyId);
    if (!enemy || !transform) {
      world.enemyTowerPushBacks.delete(key);
      continue;
    }

    const stepSeconds = Math.min(dt, pushBack.remainingSeconds);
    transform.position.x = clamp(
      transform.position.x + pushBack.directionX * pushBack.speedPixelsPerSecond * stepSeconds,
      enemy.hitRadius,
      world.config.battlefieldWidth - enemy.hitRadius,
    );
    transform.position.y = clamp(
      transform.position.y + pushBack.directionY * pushBack.speedPixelsPerSecond * stepSeconds,
      enemy.hitRadius,
      world.config.wallContactY - enemy.hitRadius,
    );

    pushBack.remainingSeconds -= stepSeconds;
    if (pushBack.remainingSeconds <= 0) {
      world.enemyTowerPushBacks.delete(key);
    }
  }
}

function updateCooldowns(world: World, dt: number) {
  for (const [key, remainingSeconds] of world.enemyTowerZoneCooldownRemainingSeconds) {
    const nextRemainingSeconds = remainingSeconds - dt;
    if (nextRemainingSeconds > 0) {
      world.enemyTowerZoneCooldownRemainingSeconds.set(key, nextRemainingSeconds);
    } else {
      world.enemyTowerZoneCooldownRemainingSeconds.delete(key);
    }
  }
}

function updateTowerPushBacks(
  world: World,
  towerId: EntityId,
  tower: TowerData,
  towerPosition: { x: number; y: number },
) {
  const { zonePushBackDistance, zonePushBacksPerSecond, zonePushBackZoneSize } = tower;
  if (zonePushBackDistance <= 0 || zonePushBacksPerSecond <= 0 || zonePushBackZoneSize <= 0) return;

  for (const [enemyId] of world.enemiesData) {
    if (!enemyIsInsideTowerZone(world, enemyId, towerPosition, zonePushBackZoneSize)) continue;

    const key = createEffectKey(towerId, enemyId, 'push');
    if ((world.enemyTowerZoneCooldownRemainingSeconds.get(key) ?? 0) > 0) continue;

    const transform = world.transforms.get(enemyId);
    if (!transform) continue;

    const deltaX = transform.position.x - towerPosition.x;
    const deltaY = transform.position.y - towerPosition.y;
    const distance = Math.hypot(deltaX, deltaY) || 1;

    world.enemyTowerPushBacks.set(key, {
      remainingSeconds: PUSH_BACK_DURATION_SECONDS,
      speedPixelsPerSecond: zonePushBackDistance / PUSH_BACK_DURATION_SECONDS,
      directionX: deltaX / distance,
      directionY: deltaY / distance,
    });
    world.enemyTowerZoneCooldownRemainingSeconds.set(key, 1 / zonePushBacksPerSecond);
  }
}

function updateTowerMovementEffect(
  world: World,
  towerId: EntityId,
  tower: TowerData,
  towerPosition: { x: number; y: number },
  kind: 'flee' | 'circle',
) {
  const duration = kind === 'flee' ? tower.zoneFleeDuration : tower.zoneCircleDuration;
  const applicationsPerSecond = kind === 'flee' ? tower.zoneFleesPerSecond : tower.zoneCirclesPerSecond;
  const zoneSize = kind === 'flee' ? tower.zoneFleeZoneSize : tower.zoneCircleZoneSize;
  if (duration <= 0 || applicationsPerSecond <= 0 || zoneSize <= 0) return;

  for (const [enemyId] of world.enemiesData) {
    if (!enemyIsInsideTowerZone(world, enemyId, towerPosition, zoneSize)) continue;

    const key = createEffectKey(towerId, enemyId, kind);
    if ((world.enemyTowerZoneCooldownRemainingSeconds.get(key) ?? 0) > 0) continue;

    applyMovementOverride(world, enemyId, towerPosition, kind, duration);
    world.enemyTowerZoneCooldownRemainingSeconds.set(key, 1 / applicationsPerSecond);
  }
}

function updateTowerDots(
  world: World,
  towerId: EntityId,
  tower: TowerData,
  towerPosition: { x: number; y: number },
  dt: number,
) {
  const { zoneDotDamage, zoneDotTicksPerSecond, zoneDotZoneSize } = tower;
  if (zoneDotDamage <= 0 || zoneDotTicksPerSecond <= 0 || zoneDotZoneSize <= 0) return;

  const damageKeywords = tower.keywords;
  for (const [enemyId, enemy] of world.enemiesData) {
    const key = createEffectKey(towerId, enemyId, 'dot');
    if (!enemyIsInsideTowerZone(world, enemyId, towerPosition, zoneDotZoneSize)) {
      world.enemyTowerZoneDotProgress.delete(key);
      continue;
    }

    const health = world.healths.get(enemyId);
    if (!health) continue;

    const nextProgress = (world.enemyTowerZoneDotProgress.get(key) ?? 0) + zoneDotTicksPerSecond * dt;
    const ticks = Math.floor(nextProgress);
    if (ticks > 0) {
      const damagePerTick = applyDamageModifiers({ baseDamage: zoneDotDamage, keywords: damageKeywords }, enemy, health);
      health.hitPoints -= damagePerTick * ticks;
    }

    world.enemyTowerZoneDotProgress.set(key, nextProgress - ticks);
  }
}

function updateTowerStuns(
  world: World,
  towerId: EntityId,
  tower: TowerData,
  towerPosition: { x: number; y: number },
) {
  const { zoneStunDuration, zoneStunsPerSecond, zoneStunZoneSize } = tower;
  if (zoneStunDuration <= 0 || zoneStunsPerSecond <= 0 || zoneStunZoneSize <= 0) return;

  for (const [enemyId] of world.enemiesData) {
    if (!enemyIsInsideTowerZone(world, enemyId, towerPosition, zoneStunZoneSize)) continue;

    const key = createEffectKey(towerId, enemyId, 'stun');
    if ((world.enemyTowerZoneCooldownRemainingSeconds.get(key) ?? 0) > 0) continue;

    world.enemyTowerStunRemainingSeconds.set(
      enemyId,
      Math.max(world.enemyTowerStunRemainingSeconds.get(enemyId) ?? 0, zoneStunDuration),
    );
    world.enemyTowerZoneCooldownRemainingSeconds.set(key, 1 / zoneStunsPerSecond);
  }
}

function updateSingleTargetPushBacks(
  world: World,
  towerId: EntityId,
  tower: TowerData,
  towerPosition: { x: number; y: number },
) {
  const { singleTargetPushBackDistance, singleTargetPushBacksPerSecond, singleTargetPushBackRange } = tower;
  if (singleTargetPushBackDistance <= 0 || singleTargetPushBacksPerSecond <= 0 || singleTargetPushBackRange <= 0) return;

  const cooldownKey = createTowerEffectKey(towerId, 'singlePush');
  if ((world.enemyTowerZoneCooldownRemainingSeconds.get(cooldownKey) ?? 0) > 0) return;

  const enemyId = findClosestEnemyToTower(world, towerPosition, singleTargetPushBackRange);
  if (enemyId === undefined) return;

  const transform = world.transforms.get(enemyId);
  if (!transform) return;

  const deltaX = transform.position.x - towerPosition.x;
  const deltaY = transform.position.y - towerPosition.y;
  const distance = Math.hypot(deltaX, deltaY) || 1;

  world.enemyTowerPushBacks.set(createEffectKey(towerId, enemyId, 'singlePush'), {
    remainingSeconds: PUSH_BACK_DURATION_SECONDS,
    speedPixelsPerSecond: singleTargetPushBackDistance / PUSH_BACK_DURATION_SECONDS,
    directionX: deltaX / distance,
    directionY: deltaY / distance,
  });
  world.enemyTowerZoneCooldownRemainingSeconds.set(cooldownKey, 1 / singleTargetPushBacksPerSecond);
}

function updateSingleTargetMovementEffect(
  world: World,
  towerId: EntityId,
  tower: TowerData,
  towerPosition: { x: number; y: number },
  kind: 'flee' | 'circle',
) {
  const duration = kind === 'flee' ? tower.singleTargetFleeDuration : tower.singleTargetCircleDuration;
  const applicationsPerSecond = kind === 'flee'
    ? tower.singleTargetFleesPerSecond
    : tower.singleTargetCirclesPerSecond;
  const range = kind === 'flee' ? tower.singleTargetFleeRange : tower.singleTargetCircleRange;
  if (duration <= 0 || applicationsPerSecond <= 0 || range <= 0) return;

  const cooldownKey = createTowerEffectKey(towerId, `single${capitalizeEffectName(kind)}`);
  if ((world.enemyTowerZoneCooldownRemainingSeconds.get(cooldownKey) ?? 0) > 0) return;

  const enemyId = findClosestEnemyToTower(world, towerPosition, range);
  if (enemyId === undefined) return;

  applyMovementOverride(world, enemyId, towerPosition, kind, duration);
  world.enemyTowerZoneCooldownRemainingSeconds.set(cooldownKey, 1 / applicationsPerSecond);
}

function updateSingleTargetDots(
  world: World,
  towerId: EntityId,
  tower: TowerData,
  towerPosition: { x: number; y: number },
  dt: number,
) {
  const { singleTargetDotDamage, singleTargetDotTicksPerSecond, singleTargetDotRange } = tower;
  if (singleTargetDotDamage <= 0 || singleTargetDotTicksPerSecond <= 0 || singleTargetDotRange <= 0) return;

  const progressKey = createTowerEffectKey(towerId, 'singleDot');
  const enemyId = findClosestEnemyToTower(world, towerPosition, singleTargetDotRange);
  if (enemyId === undefined) {
    world.enemyTowerZoneDotProgress.delete(progressKey);
    return;
  }

  const enemy = world.enemiesData.get(enemyId);
  const health = world.healths.get(enemyId);
  if (!enemy || !health) return;

  const nextProgress = (world.enemyTowerZoneDotProgress.get(progressKey) ?? 0) + singleTargetDotTicksPerSecond * dt;
  const ticks = Math.floor(nextProgress);
  if (ticks > 0) {
    const damagePerTick = applyDamageModifiers({ baseDamage: singleTargetDotDamage, keywords: tower.keywords }, enemy, health);
    health.hitPoints -= damagePerTick * ticks;
  }

  world.enemyTowerZoneDotProgress.set(progressKey, nextProgress - ticks);
}

function updateSingleTargetStuns(
  world: World,
  towerId: EntityId,
  tower: TowerData,
  towerPosition: { x: number; y: number },
) {
  const { singleTargetStunDuration, singleTargetStunsPerSecond, singleTargetStunRange } = tower;
  if (singleTargetStunDuration <= 0 || singleTargetStunsPerSecond <= 0 || singleTargetStunRange <= 0) return;

  const cooldownKey = createTowerEffectKey(towerId, 'singleStun');
  if ((world.enemyTowerZoneCooldownRemainingSeconds.get(cooldownKey) ?? 0) > 0) return;

  const enemyId = findClosestEnemyToTower(world, towerPosition, singleTargetStunRange);
  if (enemyId === undefined) return;

  world.enemyTowerStunRemainingSeconds.set(
    enemyId,
    Math.max(world.enemyTowerStunRemainingSeconds.get(enemyId) ?? 0, singleTargetStunDuration),
  );
  world.enemyTowerZoneCooldownRemainingSeconds.set(cooldownKey, 1 / singleTargetStunsPerSecond);
}

function applyMovementOverride(
  world: World,
  enemyId: EntityId,
  towerPosition: { x: number; y: number },
  kind: 'flee' | 'circle',
  duration: number,
) {
  const currentMovement = world.movements.get(enemyId);
  if (!currentMovement) return;

  const override = world.enemyTowerMovementOverrides.get(enemyId);
  const originalMovement = override?.originalMovement ?? cloneMovement(currentMovement);
  const speedPixelsPerSecond = Math.max(
    MINIMUM_OVERRIDE_SPEED_PIXELS_PER_SECOND,
    getMovementSpeedPixelsPerSecond(originalMovement),
  );

  world.movements.set(enemyId, kind === 'flee'
    ? {
      kind: 'flee',
      speedPixelsPerSecond,
      threatPoint: { ...towerPosition },
    }
    : {
      kind: 'circle',
      speedPixelsPerSecond,
      centerPoint: { ...towerPosition },
      clockwise: enemyId % 2 === 0,
    }
  );
  world.enemyTowerMovementOverrides.set(enemyId, {
    originalMovement,
    remainingSeconds: Math.max(override?.remainingSeconds ?? 0, duration),
  });
}

function getMovementSpeedPixelsPerSecond(movement: MovementController): number {
  switch (movement.kind) {
    case 'wobble':
      return movement.baseSpeedPixelsPerSecond;
    case 'polyline':
      return movement.speedPixelsPerSecond;
    case 'wander':
      return movement.speedPixelsPerSecond;
    case 'flee':
      return movement.speedPixelsPerSecond;
    case 'circle':
      return movement.speedPixelsPerSecond;
    case 'blink':
      return Math.hypot(movement.driftVelocity.x, movement.driftVelocity.y);
    case 'linear':
      return Math.hypot(movement.velocityPixelsPerSecond.x, movement.velocityPixelsPerSecond.y);
  }
}

function cloneMovement(movement: MovementController): MovementController {
  return {
    ...movement,
    currentTarget: 'currentTarget' in movement && movement.currentTarget
      ? { ...movement.currentTarget }
      : undefined,
    bounds: 'bounds' in movement && movement.bounds ? { ...movement.bounds } : undefined,
    threatPoint: 'threatPoint' in movement ? { ...movement.threatPoint } : undefined,
    centerPoint: 'centerPoint' in movement ? { ...movement.centerPoint } : undefined,
    driftVelocity: 'driftVelocity' in movement ? { ...movement.driftVelocity } : undefined,
    velocityPixelsPerSecond: 'velocityPixelsPerSecond' in movement
      ? { ...movement.velocityPixelsPerSecond }
      : undefined,
  } as MovementController;
}

function enemyIsInsideTowerZone(
  world: World,
  enemyId: EntityId,
  towerPosition: { x: number; y: number },
  zoneSize: number,
) {
  const enemy = world.enemiesData.get(enemyId);
  const transform = world.transforms.get(enemyId);
  if (!enemy || !transform) return false;

  const dx = transform.position.x - towerPosition.x;
  const dy = transform.position.y - towerPosition.y;
  const effectiveZoneSize = zoneSize + enemy.hitRadius;
  return dx * dx + dy * dy <= effectiveZoneSize * effectiveZoneSize;
}

function findClosestEnemyToTower(
  world: World,
  towerPosition: { x: number; y: number },
  range: number,
): EntityId | undefined {
  let closestEnemyId: EntityId | undefined;
  let closestDistance2 = Infinity;
  const range2 = range * range;

  for (const [enemyId, enemy] of world.enemiesData) {
    const transform = world.transforms.get(enemyId);
    if (!transform) continue;

    const dx = transform.position.x - towerPosition.x;
    const dy = transform.position.y - towerPosition.y;
    const effectiveRange = range + enemy.hitRadius;
    const distance2 = dx * dx + dy * dy;
    if (distance2 > Math.max(range2, effectiveRange * effectiveRange)) continue;
    if (distance2 >= closestDistance2) continue;

    closestEnemyId = enemyId;
    closestDistance2 = distance2;
  }

  return closestEnemyId;
}

function createEffectKey(towerId: EntityId, enemyId: EntityId, effect: string) {
  return `${towerId}|${enemyId}|${effect}`;
}

function createTowerEffectKey(towerId: EntityId, effect: string) {
  return `${towerId}|tower|${effect}`;
}

function capitalizeEffectName(effect: string) {
  return `${effect.charAt(0).toUpperCase()}${effect.slice(1)}`;
}

function getEnemyIdFromEffectKey(key: string): EntityId | undefined {
  const [, enemyId] = key.split('|');
  const parsed = Number(enemyId);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

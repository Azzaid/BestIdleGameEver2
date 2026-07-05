import type { World } from '../../../models/battle/world.ts';
import { applyDamageModifiers } from '../keywords/damageResolver';

const PUSH_BACK_DURATION_SECONDS = 0.5;

export function WallZoneEffectsSystem(world: World, dt: number) {
  updatePushBacks(world, dt);
  updateZoneDots(world, dt);
}

function updatePushBacks(world: World, dt: number) {
  const { pushBackDistance, pushBacksPerSecond, pushBackEffectZoneSize } = world.config.wallZoneEffects;
  if (pushBackDistance <= 0 || pushBacksPerSecond <= 0 || pushBackEffectZoneSize <= 0) return;

  const pushBackSpeedPixelsPerSecond = pushBackDistance / PUSH_BACK_DURATION_SECONDS;
  const cooldownSeconds = 1 / pushBacksPerSecond;

  for (const [enemyId, enemy] of world.enemiesData) {
    if (world.toRemove.has(enemyId)) continue;

    const transform = world.transforms.get(enemyId);
    if (!transform) continue;

    const cooldownRemaining = Math.max(0, (world.enemyPushBackCooldownRemainingSeconds.get(enemyId) ?? 0) - dt);
    world.enemyPushBackCooldownRemainingSeconds.set(enemyId, cooldownRemaining);

    const activeRemaining = world.enemyPushBackRemainingSeconds.get(enemyId) ?? 0;
    if (activeRemaining > 0) {
      const pushStepSeconds = Math.min(dt, activeRemaining);
      transform.position.y = Math.max(enemy.hitRadius, transform.position.y - pushBackSpeedPixelsPerSecond * pushStepSeconds);
      world.enemyPushBackRemainingSeconds.set(enemyId, activeRemaining - pushStepSeconds);
      continue;
    }

    world.enemyPushBackRemainingSeconds.delete(enemyId);
    if (cooldownRemaining > 0 || !enemyIsInsideWallZone(world, enemyId, pushBackEffectZoneSize)) continue;

    const pushStepSeconds = Math.min(dt, PUSH_BACK_DURATION_SECONDS);
    transform.position.y = Math.max(enemy.hitRadius, transform.position.y - pushBackSpeedPixelsPerSecond * pushStepSeconds);
    world.enemyPushBackRemainingSeconds.set(enemyId, PUSH_BACK_DURATION_SECONDS - pushStepSeconds);
    world.enemyPushBackCooldownRemainingSeconds.set(enemyId, cooldownSeconds);
  }
}

function updateZoneDots(world: World, dt: number) {
  const { zoneDotDamage, zoneDotTicksPerSecond, zoneDotZoneSize, zoneDotKeywords } = world.config.wallZoneEffects;
  if (zoneDotDamage <= 0 || zoneDotTicksPerSecond <= 0 || zoneDotZoneSize <= 0) return;

  const damageKeywords = new Set(zoneDotKeywords);

  for (const [enemyId, enemy] of world.enemiesData) {
    if (world.toRemove.has(enemyId)) continue;

    const health = world.healths.get(enemyId);
    if (!health) continue;

    if (!enemyIsInsideWallZone(world, enemyId, zoneDotZoneSize)) {
      world.enemyZoneDotProgress.delete(enemyId);
      continue;
    }

    const nextProgress = (world.enemyZoneDotProgress.get(enemyId) ?? 0) + zoneDotTicksPerSecond * dt;
    const ticks = Math.floor(nextProgress);
    if (ticks > 0) {
      const damagePerTick = applyDamageModifiers({ baseDamage: zoneDotDamage, keywords: damageKeywords }, enemy, health);
      health.hitPoints -= damagePerTick * ticks;
    }

    world.enemyZoneDotProgress.set(enemyId, nextProgress - ticks);
  }
}

function enemyIsInsideWallZone(world: World, enemyId: number, zoneSize: number) {
  const enemy = world.enemiesData.get(enemyId);
  const transform = world.transforms.get(enemyId);
  if (!enemy || !transform) return false;

  return transform.position.y + enemy.hitRadius >= world.config.wallContactY - zoneSize;
}

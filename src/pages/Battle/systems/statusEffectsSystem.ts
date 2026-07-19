import type { EntityId } from '../../../models/battle/common.ts';
import type { InfectionApplication, InfectionStatus } from '../../../models/battle/statusEffects.ts';
import type { World } from '../../../models/battle/world.ts';
import { applyDamageModifiers } from '../keywords/damageResolver.ts';

const MINIMUM_INFECTION_SPEED_MULTIPLIER = 0.1;

export function StatusEffectsSystem(world: World, dt: number) {
  for (const [enemyId, infection] of world.enemyInfections) {
    if (world.toRemove.has(enemyId)) continue;

    const enemy = world.enemiesData.get(enemyId);
    const health = world.healths.get(enemyId);
    if (!enemy || !health) {
      world.enemyInfections.delete(enemyId);
      continue;
    }

    infection.remainingSeconds -= dt;
    if (infection.damagePerSecondPerStack > 0 && infection.stacks > 0) {
      const damagePerSecond = applyDamageModifiers({
        ...infection.damageProfile,
        amount: infection.damagePerSecondPerStack * infection.stacks,
      }, enemy, health);
      health.hitPoints -= damagePerSecond * dt;
    }

    if (infection.remainingSeconds <= 0) {
      world.enemyInfections.delete(enemyId);
    }
  }
}

export function applyEnemyInfection(
  world: World,
  enemyId: EntityId,
  application: InfectionApplication,
) {
  if (application.durationSeconds <= 0 || application.stacks <= 0 || application.maxStacks <= 0) return;
  if (application.slowPerStack <= 0 && application.damagePerSecondPerStack <= 0) return;

  const current = world.enemyInfections.get(enemyId);
  const nextMaxStacks = Math.max(current?.maxStacks ?? 0, application.maxStacks);
  const nextStacks = Math.min(
    nextMaxStacks,
    (current?.stacks ?? 0) + application.stacks,
  );
  const nextStatus: InfectionStatus = {
    remainingSeconds: Math.max(current?.remainingSeconds ?? 0, application.durationSeconds),
    stacks: nextStacks,
    maxStacks: nextMaxStacks,
    slowPerStack: Math.max(current?.slowPerStack ?? 0, application.slowPerStack),
    damagePerSecondPerStack: Math.max(current?.damagePerSecondPerStack ?? 0, application.damagePerSecondPerStack),
    damageProfile: getStrongerDamageProfile(current, application),
  };

  world.enemyInfections.set(enemyId, nextStatus);
}

export function getEnemyInfectionSpeedMultiplier(world: World, enemyId: EntityId): number {
  const infection = world.enemyInfections.get(enemyId);
  if (!infection) return 1;

  const slow = infection.stacks * infection.slowPerStack;
  return Math.max(MINIMUM_INFECTION_SPEED_MULTIPLIER, 1 - slow);
}

function getStrongerDamageProfile(
  current: InfectionStatus | undefined,
  application: InfectionApplication,
) {
  if (!current) return application.damageProfile;
  if (application.damagePerSecondPerStack >= current.damagePerSecondPerStack) {
    return application.damageProfile;
  }

  return current.damageProfile;
}

import type { World } from '../../../models/battle/world.ts';

export function SiegeSystem(world: World, dt: number) {
  if (world.battleEnded) return;

  if (!world.siegeMeterFrozen) {
    world.siegeElapsedSeconds += dt;
    world.currentThreat = Math.min(
      world.config.targetThreat,
      world.currentThreat + world.config.threatGrowthPerSecond * dt
    );
  }

  const metrics = {
    threat: world.currentThreat,
    targetThreat: world.config.targetThreat,
    siegeElapsedSeconds: world.siegeElapsedSeconds,
    siegePressure: world.siegePressure,
    wallResilience: world.config.wallResilience,
  };

  world.config.onBattleMetrics?.(metrics);

  if (
    world.config.completesWhenThreatTargetReached
    && !world.siegeOverwhelmedWasHandled
    && world.siegePressure > world.config.wallResilience
  ) {
    handleSiegeOverwhelmed(world);
  } else if (
    world.config.completesWhenThreatTargetReached
    && !world.pendingBattleOutcome
    && !world.siegeOverwhelmedWasHandled
    && world.currentThreat >= world.config.targetThreat
  ) {
    world.pendingBattleOutcome = "held";
    world.waveScheduler.state.enabled = false;
    world.spawners = [];
  }

  if (!world.pendingBattleOutcome || hasActiveEnemies(world) || world.spawners.length > 0) {
    return;
  }

  world.battleEnded = true;
  if (world.lastBattleEndWasHandled) return;

  world.lastBattleEndWasHandled = true;
  world.config.onBattleEnded?.({
    ...metrics,
    outcome: world.pendingBattleOutcome,
  });
}

function handleSiegeOverwhelmed(world: World) {
  if (world.siegeOverwhelmedWasHandled) return;

  world.siegeOverwhelmedWasHandled = true;
  world.pendingBattleOutcome = undefined;
  world.siegeMeterFrozen = true;
  world.waveScheduler.state.enabled = true;
  world.waveScheduler.state.timeUntilNextWaveSeconds = 0;
  world.currentThreat = world.config.targetThreat;
  world.config.onSiegeOverwhelmed?.();
}

function hasActiveEnemies(world: World) {
  for (const enemyId of world.enemiesData.keys()) {
    if (!world.toRemove.has(enemyId)) return true;
  }

  return false;
}

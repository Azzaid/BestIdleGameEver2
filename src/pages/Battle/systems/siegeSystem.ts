import type { World } from '../../../models/battle/world.ts';

export function SiegeSystem(world: World, dt: number) {
  if (world.battleEnded) return;

  world.currentThreat = Math.min(
    world.config.targetThreat,
    world.currentThreat + world.config.threatGrowthPerSecond * dt
  );

  const metrics = {
    threat: world.currentThreat,
    targetThreat: world.config.targetThreat,
    siegePressure: world.siegePressure,
    wallResilience: world.config.wallResilience,
  };

  world.config.onBattleMetrics?.(metrics);

  if (world.siegePressure > world.config.wallResilience) {
    world.battleEnded = true;
    world.waveScheduler.state.enabled = false;
    world.config.onBattleEnded?.({
      ...metrics,
      outcome: "overwhelmed",
    });
    return;
  }

  if (world.config.completesWhenThreatTargetReached && world.currentThreat >= world.config.targetThreat) {
    world.battleEnded = true;
    world.waveScheduler.state.enabled = false;
    world.config.onBattleEnded?.({
      ...metrics,
      outcome: "held",
    });
  }
}

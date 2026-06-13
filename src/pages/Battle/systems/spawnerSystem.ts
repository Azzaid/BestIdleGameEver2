import type { World } from '../core/world';
import { planWaveComposition } from '../spawn/wavePlanner';
import { WaveSpawner } from '../spawn/waveSpawner';

/**
 * SpawnerSystem:
 * - ticks all active spawners
 * - schedules new wave spawners on a timer
 * - removes finished spawners
 *
 * Call this FIRST in runSystems() so newly spawned enemies exist for the rest of the frame.
 */
export function SpawnerSystem(world: World, dtSeconds: number) {
    // 1) Update existing spawners (front of frame)
    if (world.spawners.length > 0) {
        for (const spawner of world.spawners) {
            spawner.update(world, dtSeconds);
        }
        // Remove finished spawners
        world.spawners = world.spawners.filter((s) => !s.isDone());
    }

    // 2) Schedule new waves if enabled and timer elapsed
    const sched = world.waveScheduler;
    if (!sched.state.enabled) return;

    // Tick the countdown
    sched.state.timeUntilNextWaveSeconds -= dtSeconds;

    // Respect a cap on concurrent spawners (optional)
    const maxConcurrent = sched.config.maxConcurrentSpawners ?? Infinity;
    if (world.spawners.length >= maxConcurrent) return;

    // Time to spawn a new wave?
    if (sched.state.timeUntilNextWaveSeconds <= 0) {
        // Compute required strength for this wave
        const k = sched.state.currentWaveIndex;
        const requiredStrength =
            sched.config.initialWaveStrength * Math.pow(sched.config.waveStrengthIncrementFactor, k);

        // PLAN (TODO: enforce constraints if you add them later)
        const enemyIds = sched.enemyIds;                       // TODO: ensure this is filled at scene start
        const blueprints = sched.blueprints;                   // TODO: inject your ENEMIES map
        const plan = planWaveComposition(enemyIds, blueprints, requiredStrength, {
            underfillTolerance: 0.1,
            overfillTolerance: 0.05,
            maxUnits: 500, // sanity cap
        });

        // SPAWNER
        const spawner = new WaveSpawner(blueprints, {
            spawnTopPadding: getVisibleSpawnY(world),
            spawnAreaLeft: 48,
            spawnAreaRight: world.config.battlefieldWidth - 48,
            baseIntervalSeconds: 0.4,
            intervalJitterSeconds: 0.2,
            swarmSpatialSpreadPx: 16,
            swarmTemporalSpreadSec: 0.1,
        });
        spawner.enqueuePlan(plan);
        world.spawners.push(spawner);

        // Bookkeeping for next wave
        sched.state.currentWaveIndex += 1;
        sched.state.totalWavesSpawned += 1;
        sched.state.timeUntilNextWaveSeconds = sched.config.timeBetweenWavesSeconds;
    }
}

function getVisibleSpawnY(world: World) {
    const towerRanges = Array.from(world.towersData.values())
        .map((tower) => tower.targetingDistanceLimit);
    const maxTowerRange = Math.max(240, ...towerRanges);

    return Math.max(24, world.config.wallY - maxTowerRange * 0.9);
}

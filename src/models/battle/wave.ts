export interface WaveSchedulerConfig {
    /** Seconds between wave starts. */
    timeBetweenWavesSeconds: number;

    /** First wave strength "budget". */
    initialWaveStrength: number;

    /** Wave strength multiplier per wave (e.g. 1.15 means +15% each wave). */
    waveStrengthIncrementFactor: number;

    /** Optional hard cap on concurrently active spawners. */
    maxConcurrentSpawners?: number;
}

export interface WaveSchedulerState {
    /** Time remaining until next wave spawns. */
    timeUntilNextWaveSeconds: number;

    /** 0-based index; used to scale strength. */
    currentWaveIndex: number;

    /** Total waves spawned (for analytics/UI). */
    totalWavesSpawned: number;

    /** Whether auto waves are enabled (toggle if you want manual trigger). */
    enabled: boolean;
}

export interface PlannedSpawn {
    enemyId: string;
    swarmIndex?: number;
}

export interface WavePlan {
    picks: PlannedSpawn[];
    totalStrength: number;
}

export interface WavePlannerOptions {
    underfillTolerance?: number;
    overfillTolerance?: number;
    maxUnits?: number;
}

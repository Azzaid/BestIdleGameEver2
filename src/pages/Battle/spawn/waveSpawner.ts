import type { World } from '../core/world';
import { createEntityId } from '../core/world';
import type { PlannedSpawn, WavePlan } from './wavePlanner';
import type { EnemyBlueprint } from '../../../models/battle/enemyBlueprints';
import { createDisplayFromSpriteInfo } from '../factories/spriteFactory';

export interface WaveSpawnerOptions {
    spawnTopPadding?: number;       // y at which enemies appear (e.g. -24)
    spawnAreaLeft?: number;         // x range for entry (screen/world width slice)
    spawnAreaRight?: number;
    baseIntervalSeconds?: number;   // average spacing between non-swarm spawns
    intervalJitterSeconds?: number; // random +/- jitter added
    swarmSpatialSpreadPx?: number;  // x offset within a swarm cluster
    swarmTemporalSpreadSec?: number;// time drift within a swarm cluster
}

export class WaveSpawner {
    private queue: PlannedSpawn[] = [];
    private blueprints: Record<string, EnemyBlueprint>;
    private options: Required<WaveSpawnerOptions>;
    private timeUntilNextSpawn = 0;

    constructor(
        blueprints: Record<string, EnemyBlueprint>,
        opts?: WaveSpawnerOptions
    ) {
        this.blueprints = blueprints;
        this.options = {
            spawnTopPadding: -24,
            spawnAreaLeft: 48,
            spawnAreaRight: 0, // will be filled on first use
            baseIntervalSeconds: 0.45,
            intervalJitterSeconds: 0.25,
            swarmSpatialSpreadPx: 18,
            swarmTemporalSpreadSec: 0.12,
            ...opts,
        };
    }

    /** Enqueue a plan returned by planWaveComposition() */
    public enqueuePlan(plan: WavePlan) {
        this.queue.push(...plan.picks);
    }

    /** Call this once per frame from your ticker. */
    public update(world: World, dt: number) {
        // Fill spawnAreaRight if zero (lazy init from world size)
        if (this.options.spawnAreaRight === 0) {
            this.options.spawnAreaRight = world.config.battlefieldWidth - 48;
        }
        this.timeUntilNextSpawn -= dt;
        if (this.queue.length === 0) return;

        if (this.timeUntilNextSpawn <= 0) {
            // Pop the next item (we’ll batch-following swarm members with small offsets)
            const next = this.queue.shift()!;
            const bp = this.blueprints[next.enemyId];
            if (!bp) return;

            // Random base x in the top entry area
            const baseX = this.randomBetween(this.options.spawnAreaLeft, this.options.spawnAreaRight);
            const baseY = this.options.spawnTopPadding;

            const swarmMembers: PlannedSpawn[] = [next];

            // Peek ahead: if following entries are same enemy and have swarmIndex, group a short run
            while (this.queue.length > 0 &&
            this.queue[0].enemyId === next.enemyId &&
            (this.queue[0].swarmIndex ?? 0) > (swarmMembers[swarmMembers.length - 1].swarmIndex ?? -1)) {
                swarmMembers.push(this.queue.shift()!);
            }

            // Spawn all swarm members with tiny offsets
            swarmMembers.forEach((_member, memberIndex) => {
                const offsetX = (memberIndex - (swarmMembers.length - 1) / 2) * this.options.swarmSpatialSpreadPx;
                const delay = memberIndex * (this.options.swarmTemporalSpreadSec / Math.max(1, swarmMembers.length - 1));
                this.spawnEnemyWithDelay(world, bp, baseX + offsetX, baseY, delay);
            });

            // Schedule next spawn (base interval +/- jitter)
            const interval = this.options.baseIntervalSeconds + this.randomBetween(-this.options.intervalJitterSeconds, this.options.intervalJitterSeconds);
            this.timeUntilNextSpawn = Math.max(0.05, interval);
        }
    }

    private spawnEnemyWithDelay(world: World, bp: EnemyBlueprint, x: number, y: number, delaySec: number) {
        if (delaySec <= 0) {
            this.instantEnemySpawn(world, bp, x, y);
            return;
        }
        // Minimal delayed spawn: use a temporary ticker hook
        let remaining = delaySec;
        const step = (ticker: { deltaMS: number }) => {
            const dt = ticker.deltaMS / 1000;
            remaining -= dt;
            if (remaining <= 0) {
                world.config.app.ticker.remove(step);
                this.instantEnemySpawn(world, bp, x, y);
            }
        };
        world.config.app.ticker.add(step);
    }

    private instantEnemySpawn(world: World, bp: EnemyBlueprint, spawnX: number, spawnY: number) {
        const id = createEntityId(world);

        // Transform & movement
        world.transforms.set(id, { position: { x: spawnX, y: spawnY }, rotationRadians: Math.PI / 2 });
        world.movements.set(id, bp.createMovement(spawnX, spawnY, world));

        // Stats & role data
        world.healths.set(id, { maxHitPoints: bp.maxHitPoints, hitPoints: bp.maxHitPoints, armor: bp.armor });
        world.enemiesData.set(id, {
            name: bp.displayName,
            kind: bp.kind,
            hitRadius: bp.hitRadius,
            pressure: bp.pressure,
            shotDistance: bp.shotDistance,
            keywords: new Set(bp.keywords),
        });

        // Visuals
        const view = createDisplayFromSpriteInfo(bp.sprite); // uses PIXI.Texture.from() — atlas must be loaded
        view.zIndex = 5;
        view.position.set(spawnX, spawnY);
        world.worldLayer.addChild(view);
        world.sprites.set(id, view);
    }

    private randomBetween(min: number, max: number) {
        return min + Math.random() * (max - min);
    }

    /** True when there is nothing left to spawn. */
    public isDone(): boolean {
        return this.queue.length === 0 && this.timeUntilNextSpawn <= 0;
    }

    /** Optional: expose number of queued spawns (for UI/debug). */
    public getQueueLength(): number {
        return this.queue.length;
    }
}

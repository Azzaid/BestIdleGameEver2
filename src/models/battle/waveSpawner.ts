import type { World } from './world.ts';
import { createEntityId } from '../../pages/Battle/core/world.ts';
import type { PlannedSpawn, WavePlan } from './wave.ts';
import type { EnemyBlueprint } from './enemyBlueprints.ts';
import { createDisplayFromSpriteInfo } from '../../pages/Battle/factories/spriteFactory.ts';

export interface WaveSpawnerOptions {
    spawnTopPadding?: number;
    spawnAreaLeft?: number;
    spawnAreaRight?: number;
    baseIntervalSeconds?: number;
    intervalJitterSeconds?: number;
    swarmSpatialSpreadPx?: number;
    swarmTemporalSpreadSec?: number;
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
            spawnAreaRight: 0,
            baseIntervalSeconds: 0.45,
            intervalJitterSeconds: 0.25,
            swarmSpatialSpreadPx: 18,
            swarmTemporalSpreadSec: 0.12,
            ...opts,
        };
    }

    public enqueuePlan(plan: WavePlan) {
        this.queue.push(...plan.picks);
    }

    public update(world: World, dt: number) {
        if (this.options.spawnAreaRight === 0) {
            this.options.spawnAreaRight = world.config.battlefieldWidth - 48;
        }
        this.timeUntilNextSpawn -= dt;
        if (this.queue.length === 0) return;

        if (this.timeUntilNextSpawn <= 0) {
            const next = this.queue.shift()!;
            const bp = this.blueprints[next.enemyId];
            if (!bp) return;

            const baseX = this.randomBetween(this.options.spawnAreaLeft, this.options.spawnAreaRight);
            const baseY = this.options.spawnTopPadding;

            const swarmMembers: PlannedSpawn[] = [next];

            while (this.queue.length > 0 &&
            this.queue[0].enemyId === next.enemyId &&
            (this.queue[0].swarmIndex ?? 0) > (swarmMembers[swarmMembers.length - 1].swarmIndex ?? -1)) {
                swarmMembers.push(this.queue.shift()!);
            }

            swarmMembers.forEach((_member, memberIndex) => {
                const offsetX = (memberIndex - (swarmMembers.length - 1) / 2) * this.options.swarmSpatialSpreadPx;
                const delay = memberIndex * (this.options.swarmTemporalSpreadSec / Math.max(1, swarmMembers.length - 1));
                this.spawnEnemyWithDelay(world, bp, baseX + offsetX, baseY, delay);
            });

            const interval = this.options.baseIntervalSeconds + this.randomBetween(-this.options.intervalJitterSeconds, this.options.intervalJitterSeconds);
            this.timeUntilNextSpawn = Math.max(0.05, interval);
        }
    }

    private spawnEnemyWithDelay(world: World, bp: EnemyBlueprint, x: number, y: number, delaySec: number) {
        if (delaySec <= 0) {
            this.instantEnemySpawn(world, bp, x, y);
            return;
        }

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

        world.transforms.set(id, { position: { x: spawnX, y: spawnY }, rotationRadians: Math.PI / 2 });
        world.movements.set(id, bp.createMovement(spawnX, spawnY, world));

        world.healths.set(id, { maxHitPoints: bp.maxHitPoints, hitPoints: bp.maxHitPoints, armor: bp.armor });
        world.enemiesData.set(id, {
            name: bp.displayName,
            kind: bp.kind,
            hitRadius: bp.hitRadius,
            pressure: bp.pressure,
            shotDistance: bp.shotDistance,
            keywords: new Set(bp.keywords),
        });

        const view = createDisplayFromSpriteInfo(bp.sprite);
        view.zIndex = 5;
        view.position.set(spawnX, spawnY);
        world.worldLayer.addChild(view);
        world.sprites.set(id, view);
    }

    private randomBetween(min: number, max: number) {
        return min + Math.random() * (max - min);
    }

    public isDone(): boolean {
        return this.queue.length === 0 && this.timeUntilNextSpawn <= 0;
    }

    public getQueueLength(): number {
        return this.queue.length;
    }
}

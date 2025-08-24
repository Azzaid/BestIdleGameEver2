// /battle/targeting/registry.ts
import { World, EntityId } from '../core/world';

export type TargetingStrategy = (world: World, towerId: EntityId) => EntityId | undefined;

const strategyRegistry = new Map<string, TargetingStrategy>();

export function registerTargetingStrategy(key: string, fn: TargetingStrategy) {
    strategyRegistry.set(key, fn);
}

export function getTargetingStrategy(key: string): TargetingStrategy {
    const fn = strategyRegistry.get(key);
    if (!fn) throw new Error(`Unknown targeting strategy: ${key}`);
    return fn;
}

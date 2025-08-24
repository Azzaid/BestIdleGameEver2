// /battle/systems/targeting.ts
import { World } from '../core/world';
import { getTargetingStrategy } from '../targeting/registry';

export function TargetingSystem(world: World) {
    for (const [towerId, tower] of world.towers) {
        const strategy = getTargetingStrategy(tower.targetingStrategyKey);
        tower.currentTarget = strategy(world, towerId);
    }
}

// /battle/systems/statuses.ts
import { World } from '../core/world';

export function StatusSystem(world: World, dt: number) {
    for (const [entityId, status] of world.statuses) {
        if (status.freezeRemainingSeconds && status.freezeRemainingSeconds > 0) {
            status.freezeRemainingSeconds -= dt;
        }
        if (status.slowRemainingSeconds && status.slowRemainingSeconds > 0) {
            status.slowRemainingSeconds -= dt;
            if (status.slowRemainingSeconds <= 0) {
                status.slowMultiplier = 1;
            }
        }
        if (status.poisonRemainingSeconds && status.poisonRemainingSeconds > 0) {
            status.poisonRemainingSeconds -= dt;
            const dps = status.poisonDps ?? 0;
            const hp = world.healths.get(entityId);
            if (hp) hp.hitPoints -= dps * dt;
        }
    }
}

// /battle/systems/deathCleanup.ts
import { World } from '../core/world';

export function DeathCleanupSystem(world: World) {
    for (const [entityId, hp] of world.healths) {
        if (hp.hitPoints <= 0) {
            // grant bounty, play effect etc.
            world.toRemove.add(entityId);
        }
    }
    if (world.toRemove.size === 0) return;

    for (const id of world.toRemove) {
        world.alive.delete(id);
        world.transforms.delete(id);
        world.wanderMovements.delete(id);
        world.enemies.delete(id);
        world.healths.delete(id);
        world.statuses.delete(id);
        world.towers.delete(id);
        world.weapons.delete(id);
        world.projectiles.delete(id);
        const sprite = world.sprites.get(id);
        if (sprite?.container) sprite.container.destroy({ children: true });
        world.sprites.delete(id);
    }
    world.toRemove.clear();
}
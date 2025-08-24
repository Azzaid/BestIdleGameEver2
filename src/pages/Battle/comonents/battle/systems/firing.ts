// /battle/systems/firing.ts
import { World, Vector2, EntityId, Projectile } from '../core/world';
import { createEntity } from '../core/world';

export function FiringSystem(world: World, dt: number) {
    for (const [towerId, tower] of world.towers) {
        const weapon = world.weapons.get(tower.weaponEntity)!;
        weapon.timeUntilReadySeconds -= dt;
        if (weapon.timeUntilReadySeconds > 0) continue;
        if (!tower.currentTarget) continue;

        const towerTf = world.transforms.get(towerId)!;
        const forward: Vector2 = {
            x: Math.cos(towerTf.rotationRadians),
            y: Math.sin(towerTf.rotationRadians),
        };

        // burst count (can be >1 for shotguns)
        for (let i = 0; i < weapon.burstProjectiles; i++) {
            spawnProjectile(world, towerId, forward, weapon.projectileBlueprintKey, i);
        }

        weapon.timeUntilReadySeconds = weapon.fireCooldownSeconds;
    }
}

function spawnProjectile(
    world: World,
    towerId: EntityId,
    forward: Vector2,
    projectileKey: string,
    pelletIndex: number
) {
    // blueprint lookup stub:
    const blueprint = {
        damage: 12,
        damageType: 'physical' as const,
        speedPixelsPerSecond: 520,
        areaOfEffectRadiusPixels: undefined as number | undefined,
        lifespanSeconds: 2.0,
        spriteKey: 'projectile_small',
        spreadRadians: 0.05, // use pelletIndex to slightly spread
    };

    const towerTf = world.transforms.get(towerId)!;
    const angle = Math.atan2(forward.y, forward.x) + (pelletIndex - 0.5) * blueprint.spreadRadians;

    const forwardUnit: Vector2 = { x: Math.cos(angle), y: Math.sin(angle) };
    const id = createEntity(world);

    world.transforms.set(id, {
        position: { x: towerTf.position.x, y: towerTf.position.y },
        rotationRadians: angle,
    });

    world.projectiles.set(id, {
        damage: blueprint.damage,
        damageType: blueprint.damageType,
        speedPixelsPerSecond: blueprint.speedPixelsPerSecond,
        areaOfEffectRadiusPixels: blueprint.areaOfEffectRadiusPixels,
        lifespanSeconds: blueprint.lifespanSeconds,
        elapsedSeconds: 0,
        sourceTowerId: towerId,
        forwardUnit,
        startPosition: { ...towerTf.position },
    });

    world.sprites.set(id, { textureKey: blueprint.spriteKey, pivot: { x: 4, y: 4 }, zIndex: 7 });
}

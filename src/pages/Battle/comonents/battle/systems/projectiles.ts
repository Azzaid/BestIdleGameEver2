// /battle/systems/projectiles.ts
import { World } from '../core/world';

export function ProjectilesSystem(world: World, dt: number) {
    for (const [projectileId, projectile] of world.projectiles) {
        const transform = world.transforms.get(projectileId)!;

        transform.position.x += projectile.forwardUnit.x * projectile.speedPixelsPerSecond * dt;
        transform.position.y += projectile.forwardUnit.y * projectile.speedPixelsPerSecond * dt;

        projectile.elapsedSeconds += dt;
        if (projectile.elapsedSeconds >= projectile.lifespanSeconds) {
            world.toRemove.add(projectileId);
            continue;
        }

        // naive circle hit on enemies (counts are small)
        const hitRadius = 14; // enemy ~32px, adjust as you tune art
        for (const [enemyId] of world.enemies) {
            const enemyPos = world.transforms.get(enemyId)!.position;
            const dx = enemyPos.x - transform.position.x;
            const dy = enemyPos.y - transform.position.y;
            if (dx * dx + dy * dy <= hitRadius * hitRadius) {
                applyDamage(world, enemyId, projectile.damage, projectile.damageType);

                // optional AoE splash around impact
                if (projectile.areaOfEffectRadiusPixels) {
                    const r2 = projectile.areaOfEffectRadiusPixels ** 2;
                    for (const [otherId] of world.enemies) {
                        const p = world.transforms.get(otherId)!.position;
                        const ddx = p.x - transform.position.x;
                        const ddy = p.y - transform.position.y;
                        if (ddx * ddx + ddy * ddy <= r2) {
                            applyDamage(world, otherId, projectile.damage, projectile.damageType);
                        }
                    }
                }

                world.toRemove.add(projectileId);
                break;
            }
        }
    }
}

// shared tiny helper
function applyDamage(world: World, targetId: number, raw: number, _type: any) {
    const hp = world.healths.get(targetId);
    if (!hp) return;
    const mitigated = Math.max(0, raw - hp.armor);
    hp.hitPoints -= mitigated;
}

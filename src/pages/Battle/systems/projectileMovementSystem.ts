import type { World } from '../../../models/battle/world.ts';

export function ProjectileMovementSystem(world: World, dt: number) {
  for (const [projectileId, projectile] of world.projectileInfo) {
    const transform = world.transforms.get(projectileId);
    if (!transform) continue;

    transform.position.x += Math.cos(projectile.directionRadians) * projectile.speedPixelsPerSecond * dt;
    transform.position.y += Math.sin(projectile.directionRadians) * projectile.speedPixelsPerSecond * dt;
    transform.rotationRadians = projectile.directionRadians;
  }
}

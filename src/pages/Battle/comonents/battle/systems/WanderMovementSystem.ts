// /battle/systems/wanderMovement.ts
import { World } from '../core/world';

export function WanderMovementSystem(world: World, dt: number) {
    for (const [entityId, movement] of world.wanderMovements) {
        const transform = world.transforms.get(entityId)!;

        movement.timeAliveSeconds += dt;

        const downwardDisplacement = movement.baseSpeedPixelsPerSecond * dt;
        transform.position.y += downwardDisplacement;

        // sinusoidal horizontal wobble around initial X
        const wobbleOffset =
            Math.sin(movement.timeAliveSeconds * 2 * Math.PI * movement.wobbleFrequencyHz) *
            movement.wobbleAmplitudePixels;
        transform.position.x = movement.initialX + wobbleOffset;

        transform.rotationRadians = Math.PI / 2; // face down for visuals

        if (transform.position.y >= movement.goalY) {
            // reached city wall — apply wall damage event here if needed
            world.toRemove.add(entityId);
        }
    }
}

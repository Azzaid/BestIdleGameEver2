export function Movement(world: World, dt: number) {
    for (const [id, movement] of world.movements) {
        const transform = world.transforms.get(id)!;
        // statuses
        const status = world.statuses.get(id);
        const speedMul = status?.freezeRemainingSeconds! > 0 ? 0 :
            status?.slowMultiplier ?? 1;

        const speed = movement.speedPixelsPerSecond * speedMul;
        const waypoint = movement.path[movement.currentWaypointIndex];
        const dx = waypoint.x - transform.position.x;
        const dy = waypoint.y - transform.position.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= speed * dt) {
            transform.position = { x: waypoint.x, y: waypoint.y };
            movement.currentWaypointIndex++;
            if (movement.currentWaypointIndex >= movement.path.length) {
                // Reached the wall: mark for city-wall damage elsewhere, then remove
                world.toRemove.add(id);
            }
        } else {
            const ux = dx / distance;
            const uy = dy / distance;
            transform.position.x += ux * speed * dt;
            transform.position.y += uy * speed * dt;
            transform.rotationRadians = Math.atan2(uy, ux);
        }
    }
}

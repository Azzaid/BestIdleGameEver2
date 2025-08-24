// /battle/systems/aiming.ts
import { World } from '../core/world';

function shortestAngleDelta(current: number, desired: number): number {
    let d = desired - current;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
}

export function AimingSystem(world: World, dt: number) {
    for (const [towerId, tower] of world.towers) {
        const towerTf = world.transforms.get(towerId)!;
        const targetId = tower.currentTarget;
        if (!targetId) continue;

        const targetPos = world.transforms.get(targetId)?.position;
        if (!targetPos) continue;

        const dx = targetPos.x - towerTf.position.x;
        const dy = targetPos.y - towerTf.position.y;
        const desired = Math.atan2(dy, dx);

        const delta = shortestAngleDelta(towerTf.rotationRadians, desired);
        const maxTurn = tower.turnSpeedRadPerSec * dt;
        const turn = Math.max(-maxTurn, Math.min(maxTurn, delta));
        towerTf.rotationRadians += turn;

        // rotate weapon sprite (mounted at same position) to match
        const weaponId = tower.weaponEntity;
        const weaponTf = world.transforms.get(weaponId);
        if (weaponTf) weaponTf.rotationRadians = towerTf.rotationRadians;
    }
}

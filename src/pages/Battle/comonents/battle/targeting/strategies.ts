// /battle/targeting/strategies.ts
import { World, EntityId } from '../core/world';

import { registerTargetingStrategy } from './registry';
registerTargetingStrategy('nearestWithinRange', nearestWithinRange);
registerTargetingStrategy('nearestWithinSmallRotation', nearestWithinSmallRotation);
registerTargetingStrategy('clusterWithMinimalRotation', clusterWithMinimalRotation);

const squared = (n: number) => n * n;
function angleDelta(current: number, desired: number): number {
    let d = desired - current;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d);
}

// 1) Nearest within range
export function nearestWithinRange(world: World, towerId: EntityId): EntityId | undefined {
    const tower = world.towers.get(towerId)!;
    const towerPos = world.transforms.get(towerId)!.position;
    const rangeSq = squared(tower.rangePixels);
    let best: { id: EntityId; distSq: number } | undefined;

    for (const [enemyId] of world.enemies) {
        const enemyPos = world.transforms.get(enemyId)!.position;
        const dx = enemyPos.x - towerPos.x;
        const dy = enemyPos.y - towerPos.y;
        const d2 = dx * dx + dy * dy;
        if (d2 <= rangeSq) {
            if (!best || d2 < best.distSq) best = { id: enemyId, distSq: d2 };
        }
    }
    return best?.id;
}

// 2) Nearest but prefer smaller rotation from current orientation
export function nearestWithinSmallRotation(world: World, towerId: EntityId): EntityId | undefined {
    const tower = world.towers.get(towerId)!;
    const towerTf = world.transforms.get(towerId)!;
    const towerPos = towerTf.position;
    const rangeSq = squared(tower.rangePixels);

    let best: { id: EntityId; score: number } | undefined;

    for (const [enemyId] of world.enemies) {
        const pos = world.transforms.get(enemyId)!.position;
        const dx = pos.x - towerPos.x;
        const dy = pos.y - towerPos.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > rangeSq) continue;

        const desired = Math.atan2(dy, dx);
        const rotCost = angleDelta(towerTf.rotationRadians, desired); // 0..pi
        // composite score: distance weight + rotation penalty
        const score = d2 + (tower.rangePixels * tower.rangePixels) * 0.15 * rotCost; // tune
        if (!best || score < best.score) best = { id: enemyId, score };
    }
    return best?.id;
}

// 3) AoE-oriented: prefer a cluster of >=3 within blast radius with minimal rotation
export function clusterWithMinimalRotation(world: World, towerId: EntityId): EntityId | undefined {
    const tower = world.towers.get(towerId)!;
    const weapon = world.weapons.get(tower.weaponEntity)!;
    const blastRadius = weapon.aoeRadiusPixels ?? 48;

    const towerTf = world.transforms.get(towerId)!;
    const towerPos = towerTf.position;
    const rangeSq = squared(tower.rangePixels);

    let best: { id: EntityId; score: number; hits: number } | undefined;

    // pre-collect enemies in range for speed
    const candidates: EntityId[] = [];
    for (const [enemyId] of world.enemies) {
        const pos = world.transforms.get(enemyId)!.position;
        const dx = pos.x - towerPos.x;
        const dy = pos.y - towerPos.y;
        if (dx * dx + dy * dy <= rangeSq) candidates.push(enemyId);
    }

    for (const centerId of candidates) {
        const centerPos = world.transforms.get(centerId)!.position;
        let hitCount = 0;
        for (const otherId of candidates) {
            const p = world.transforms.get(otherId)!.position;
            const ddx = p.x - centerPos.x;
            const ddy = p.y - centerPos.y;
            if (ddx * ddx + ddy * ddy <= blastRadius * blastRadius) hitCount++;
        }

        if (hitCount >= 3) {
            const dx = centerPos.x - towerPos.x;
            const dy = centerPos.y - towerPos.y;
            const desired = Math.atan2(dy, dx);
            const rotCost = angleDelta(towerTf.rotationRadians, desired);

            // maximize hits, minimize rotation: lower score is better
            const score = -hitCount + rotCost * 1.0;
            if (!best || score < best.score) best = { id: centerId, score, hits: hitCount };
        }
    }

    // fallback: nearest within small rotation
    return best?.id ?? nearestWithinSmallRotation(world, towerId);
}

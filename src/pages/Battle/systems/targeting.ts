// /battle/systems/targeting.ts
import type { World } from '../../../models/battle/world.ts';
import type {EntityId} from "../../../models/battle/common.ts";


/** Sort helper */
function sortBy(_world: World, candidates: EntityId[], score: (id: EntityId) => number): EntityId[] {
    return candidates.slice().sort((a, b) => score(a) - score(b));
}

// ───────────────────────── Primitive rules ─────────────────────────
function byClosestToWall(world: World, _towerId: EntityId, c: EntityId[]) {
    const wY = world.config.wallContactY;
    return sortBy(world, c, (id) => Math.abs(wY - world.transforms.get(id)!.position.y));
}
function byFurthestFromWall(world: World, _towerId: EntityId, c: EntityId[]) {
    const wY = world.config.wallContactY;
    return sortBy(world, c, (id) => -Math.abs(wY - world.transforms.get(id)!.position.y));
}
function byClosestToAim(world: World, towerId: EntityId, c: EntityId[]) {
    const gun = world.towersData.get(towerId)!.gunEntity;
    const aim = world.transforms.get(gun)!.rotationRadians;
    const base = world.transforms.get(towerId)!.position;
    return sortBy(world, c, (id) => {
        const pos = world.transforms.get(id)!.position;
        const desired = Math.atan2(pos.y - base.y, pos.x - base.x);
        let d = desired - aim;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        return Math.abs(d);
    });
}
function byBiggest(world: World, _towerId: EntityId, c: EntityId[]) {
    return sortBy(world, c, (id) => -(world.healths.get(id)?.maxHitPoints ?? 0));
}
function byMostPressure(world: World, _towerId: EntityId, c: EntityId[]) {
    return sortBy(world, c, (id) => -(world.enemiesData.get(id)?.pressure ?? 0));
}
function byLeastMaxHP(world: World, _towerId: EntityId, c: EntityId[]) {
    return sortBy(world, c, (id) => (world.healths.get(id)?.maxHitPoints ?? 0));
}
function byMostMaxHP(world: World, _towerId: EntityId, c: EntityId[]) {
    return sortBy(world, c, (id) => -(world.healths.get(id)?.maxHitPoints ?? 0));
}
function byLeastHP(world: World, _towerId: EntityId, c: EntityId[]) {
    return sortBy(world, c, (id) => (world.healths.get(id)?.hitPoints ?? 0));
}
function byMostHP(world: World, _towerId: EntityId, c: EntityId[]) {
    return sortBy(world, c, (id) => -(world.healths.get(id)?.hitPoints ?? 0));
}
function meleeFirst(world: World, _towerId: EntityId, c: EntityId[]) {
    return sortBy(world, c, (id) => (world.enemiesData.get(id)?.kind === 'melee' ? -1 : 1));
}
function rangedFirst(world: World, _towerId: EntityId, c: EntityId[]) {
    return sortBy(world, c, (id) => (world.enemiesData.get(id)?.kind === 'ranged' ? -1 : 1));
}
function coverMoreWithAOE(world: World, towerId: EntityId, c: EntityId[]) {
    const tower = world.towersData.get(towerId)!;
    const r = Math.max(8, tower.aoeRadius);
    const r2 = r * r;
    const score = new Map<EntityId, number>();
    for (const a of c) {
        const pa = world.transforms.get(a)!.position;
        let hits = 0;
        for (const b of c) {
            const pb = world.transforms.get(b)!.position;
            const dx = pb.x - pa.x,
                dy = pb.y - pa.y;
            if (dx * dx + dy * dy <= r2) hits++;
        }
        score.set(a, -hits);
    }
    return c.slice().sort((a, b) => (score.get(a) ?? 0) - (score.get(b) ?? 0));
}
function hitMoreWithPiercing(world: World, towerId: EntityId, c: EntityId[]) {
    const base = world.transforms.get(towerId)!.position;
    const aim = world.transforms.get(world.towersData.get(towerId)!.gunEntity)!.rotationRadians;
    const ux = Math.cos(aim),
        uy = Math.sin(aim);
    return sortBy(world, c, (id) => {
        const p = world.transforms.get(id)!.position;
        const along = (p.x - base.x) * ux + (p.y - base.y) * uy;
        const off = Math.abs((p.x - base.x) * -uy + (p.y - base.y) * ux);
        return off - along * 0.01;
    });
}

// ───────────────────────── Rule registry ─────────────────────────
// Map single-word keywords to their rule
export const ruleByKeyword: Record<string, (w: World, t: EntityId, c: EntityId[]) => EntityId[]> = {
    // tech-ish
    closestToWall: byClosestToWall,
    furthestFromWall: byFurthestFromWall,
    closestToCurrentAim: byClosestToAim,
    biggest: byBiggest,

    // medieval-ish
    generatingMostSiegePressure: byMostPressure,
    coverMoreEnemiesWithAOEEffect: coverMoreWithAOE,
    hitMoreEnemiesWithPiercingProjectile: hitMoreWithPiercing,

    // aether-ish
    leastMaxHP: byLeastMaxHP,
    mostMaxHP: byMostMaxHP,
    leastHP: byLeastHP,
    mostHP: byMostHP,
    meleeFirst: meleeFirst,
    rangedFirst: rangedFirst,

    // nature demo (closest to tower center) — optional
    // closestToTower: (w, t, c) => sortBy(w, c, (id) => {
    //   const base = w.transforms.get(t)!.position;
    //   const pos = w.transforms.get(id)!.position;
    //   const dx = pos.x - base.x, dy = pos.y - base.y;
    //   return dx*dx + dy*dy;
    // }),
};

// ───────────────────────── Composer from aimKeywords ─────────────────────────
/** Accepts tokens like:
 *   ["closestToWall", "top8", "closestToCurrentAim", "top3"]
 *   ["generatingMostSiegePressure", "top5", "coverMoreEnemiesWithAOEEffect"]
 * Unknown tokens are ignored safely.
 */
export function chooseTargetByAimKeywords(
    world: World,
    towerId: EntityId,
    candidates: EntityId[],
    aimKeywords: readonly string[]
): EntityId | undefined {
    let list = candidates.slice();

    for (const tokenRaw of aimKeywords) {
        const token = tokenRaw.trim();

        // topN cutters: "top8", "top:8", "top=8"
        const m = /^top(?::|=)?(\d+)$/.exec(token);
        if (m) {
            const n = Math.max(1, parseInt(m[1], 10));
            list = list.slice(0, n);
            continue;
        }

        // apply rule if known
        const rule = ruleByKeyword[token];
        if (rule) {
            list = rule(world, towerId, list);
            continue;
        }

        // (Optional) support aliases here if you have legacy names
        // e.g., if (token === 'coverMoreAOE') list = coverMoreWithAOE(world, towerId, list);
    }

    return list[0];
}

// ───────────────────────── Targeting system ─────────────────────────
export function TargetingSystem(world: World, dtSeconds?: number) {
    for (const [towerId, tower] of world.towersData) {
        // tick the "hold target" cooldown (if dt provided, use it; otherwise fallback)
        const dt = dtSeconds ?? 1 / 60;
        if (tower.retargetRemainingSeconds > 0) {
            tower.retargetRemainingSeconds = Math.max(0, tower.retargetRemainingSeconds - dt);
        }

        const basePos = world.transforms.get(towerId)!.position;
        const limit2 = tower.targetingDistanceLimit * tower.targetingDistanceLimit;

        // Validate current target
        const currentPos = tower.currentTarget ? world.transforms.get(tower.currentTarget)?.position : undefined;
        const currentAlive = !!(tower.currentTarget && world.enemiesData.has(tower.currentTarget));
        const currentInRange = !!(currentPos && ((currentPos.x - basePos.x) ** 2 + (currentPos.y - basePos.y) ** 2 <= limit2));
        if (currentAlive && currentInRange && tower.retargetRemainingSeconds > 0) {
            continue; // keep the current target during the hold window
        }

        // Rebuild candidate set inside distance limit
        const candidates: EntityId[] = [];
        for (const [enemyId] of world.enemiesData) {
            const pos = world.transforms.get(enemyId)?.position;
            if (!pos) continue;
            const dx = pos.x - basePos.x,
                dy = pos.y - basePos.y;
            if (dx * dx + dy * dy <= limit2) candidates.push(enemyId);
        }
        if (candidates.length === 0) {
            tower.currentTarget = undefined;
            continue;
        }

        // Apply the rules from tower.aimKeywords; fall back if empty
        const tokens = (tower.aimKeywords && tower.aimKeywords.length > 0)
            ? tower.aimKeywords
            : (['closestToWall'] as const);

        tower.currentTarget = chooseTargetByAimKeywords(world, towerId, candidates, tokens);
    }
}

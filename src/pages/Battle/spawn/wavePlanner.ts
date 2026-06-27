import type {EnemyBlueprint} from '../../../models/battle/enemyBlueprints.ts';
import type { PlannedSpawn, WavePlan, WavePlannerOptions } from '../../../models/battle/wave.ts';

/**
 * Randomized knapsack-ish planner:
 * - repeatedly picks a candidate weighted by selectionWeight
 * - adds it (expanding into swarm copies if defined)
 * - stops when strength is within [required*(1-underfill), required*(1+overfill)]
 */
export function planWaveComposition(
    enemyIds: string[],
    blueprints: Record<string, EnemyBlueprint>,
    requiredStrength: number,
    options: WavePlannerOptions = {}
): WavePlan {
    const underfill = options.underfillTolerance ?? 0.1;
    const overfill = options.overfillTolerance ?? 0.05;
    const maxUnits = options.maxUnits ?? 200;

    const cityVisibility = options.cityVisibility ?? Infinity;
    const candidates = enemyIds
        .map(id => blueprints[id])
        .filter((blueprint): blueprint is EnemyBlueprint => (
            Boolean(blueprint)
            && (blueprint.minimumCityVisibilityThreshold ?? 0) <= cityVisibility
        ));

    if (candidates.length === 0) {
        return { picks: [], totalStrength: 0 };
    }

    // Build cumulative weights for weighted random selection
    const weights = candidates.map(b => Math.max(0.0001, b.selectionWeight ?? 1));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const cumulative: number[] = [];
    let run = 0;
    for (const w of weights) { run += w; cumulative.push(run); }

    function pickRandomBlueprint(): EnemyBlueprint {
        const r = Math.random() * totalWeight;
        const idx = cumulative.findIndex(x => r <= x);
        return candidates[Math.max(0, idx)];
    }

    const picks: PlannedSpawn[] = [];
    let totalStrength = 0;

    const minOk = requiredStrength * (1 - underfill);
    const maxOk = requiredStrength * (1 + overfill);

    // Greedy-ish loop with randomness
    while (picks.length < maxUnits && totalStrength < minOk) {
        const bp = pickRandomBlueprint();

        // Expand swarm (planner-level multiplication)
        const swarmMin = Math.max(1, bp.swarmSize ?? 1);
        const swarmMax = Math.max(swarmMin, bp.swarmSizeMax ?? swarmMin);
        const count = swarmMin === swarmMax ? swarmMin : (swarmMin + Math.floor(Math.random() * (swarmMax - swarmMin + 1)));

        // Each member adds the same strengthCost (simple model)
        const addStrength = bp.strengthCost * count;

        // If we'd overshoot too much, try a different pick a few times
        if (totalStrength + addStrength > maxOk) {
            let tries = 5;
            let chosen = bp;
            let chosenCount = count;
            let chosenStrength = addStrength;
            while (tries-- > 0 && totalStrength + chosenStrength > maxOk) {
                const alt = pickRandomBlueprint();
                const sMin = Math.max(1, alt.swarmSize ?? 1);
                const sMax = Math.max(sMin, alt.swarmSizeMax ?? sMin);
                const sCount = sMin === sMax ? sMin : (sMin + Math.floor(Math.random() * (sMax - sMin + 1)));
                const sStr = alt.strengthCost * sCount;
                if (totalStrength + sStr <= maxOk) {
                    chosen = alt; chosenCount = sCount; chosenStrength = sStr;
                    break;
                }
            }
            if (totalStrength + chosenStrength > maxOk) break; // stop — close enough
            // use chosen
            for (let i = 0; i < chosenCount; i++) picks.push({ enemyId: chosen.id, swarmIndex: i });
            totalStrength += chosenStrength;
        } else {
            for (let i = 0; i < count; i++) picks.push({ enemyId: bp.id, swarmIndex: i });
            totalStrength += addStrength;
        }
    }

    // If we never reached minOk but hit maxUnits, we just return what we have.
    return { picks, totalStrength };
}

import {
    HOMOGENEOUS_VALUE_DEFINITION_LIST,
    HOMOGENEOUS_VALUE_DEFINITIONS,
} from "../data/homogeneousValues/index.ts";
import type {
    HomogeneousAdjacencyRule,
    HomogeneousValueEffect,
    HomogeneousValueId,
    HomogeneousValueTotals,
} from "./homogeneousValues.ts";

type EffectSource = {
    keywords?: readonly string[];
    effects?: readonly HomogeneousValueEffect[];
};

type PlacedEffectSource = EffectSource & {
    cellKey: string;
    column: number;
    row: number;
    adjacency?: readonly HomogeneousAdjacencyRule[];
};

type EffectAccumulator = {
    valueId: HomogeneousValueId;
    keywords: Set<string>;
    additive: number;
    multiplier: number;
};

export function createInitialHomogeneousValueTotals(): HomogeneousValueTotals {
    return Object.fromEntries(
        HOMOGENEOUS_VALUE_DEFINITION_LIST.map((definition) => [definition.id, definition.initialValue]),
    );
}

export function resolveHomogeneousValueEffects(
    effects: readonly HomogeneousValueEffect[],
): HomogeneousValueTotals {
    const totals = createInitialHomogeneousValueTotals();

    for (const effect of effects) {
        totals[effect.valueId] = resolveEffectValue(totals[effect.valueId] ?? 0, effect);
    }

    return totals;
}

export function resolveHomogeneousValueSources(
    sources: readonly EffectSource[],
): HomogeneousValueTotals {
    return resolveHomogeneousValueEffects(sources.flatMap((source) => source.effects ?? []));
}

export function resolvePlacedHomogeneousValueSources(
    sources: readonly PlacedEffectSource[],
    getNearbySources: (source: PlacedEffectSource, radius: number) => readonly PlacedEffectSource[],
): HomogeneousValueTotals {
    const accumulatorsByCellKey = new Map<string, EffectAccumulator[]>();

    for (const source of sources) {
        accumulatorsByCellKey.set(
            source.cellKey,
            (source.effects ?? []).map(createEffectAccumulator),
        );
    }

    for (const source of sources) {
        for (const rule of source.adjacency ?? []) {
            const nearbySources = getNearbySources(source, rule.radius ?? 1);

            for (const nearbySource of nearbySources) {
                if (!matchesBuildingKeywords(nearbySource.keywords ?? [], rule)) continue;

                const targetAccumulators = accumulatorsByCellKey.get(nearbySource.cellKey) ?? [];
                for (const accumulator of targetAccumulators) {
                    if (!matchesValueKeywords(accumulator.keywords, rule)) continue;

                    accumulator.additive += rule.additive ?? 0;
                    accumulator.multiplier *= normalizeMultiplier(rule.multiplier);
                }
            }
        }
    }

    return resolveHomogeneousValueEffects(
        [...accumulatorsByCellKey.values()].flatMap((accumulators) => accumulators.map(toHomogeneousValueEffect)),
    );
}

export function getEffectKeywords(effect: HomogeneousValueEffect): Set<string> {
    const definition = HOMOGENEOUS_VALUE_DEFINITIONS[effect.valueId];
    const keywords = new Set(definition?.keywords ?? []);

    for (const keyword of effect.removedKeywords ?? []) {
        keywords.delete(keyword);
    }

    for (const keyword of effect.additionalKeywords ?? []) {
        keywords.add(keyword);
    }

    return keywords;
}

export function normalizeMultiplier(multiplier?: number | null): number {
    if (multiplier === undefined || multiplier === null || multiplier === 0 || multiplier === 1) return 1;

    return multiplier;
}

function resolveEffectValue(currentValue: number, effect: HomogeneousValueEffect): number {
    return (currentValue + (effect.additive ?? 0)) * normalizeMultiplier(effect.multiplier);
}

function createEffectAccumulator(effect: HomogeneousValueEffect): EffectAccumulator {
    return {
        valueId: effect.valueId,
        keywords: getEffectKeywords(effect),
        additive: effect.additive ?? 0,
        multiplier: normalizeMultiplier(effect.multiplier),
    };
}

function toHomogeneousValueEffect(accumulator: EffectAccumulator): HomogeneousValueEffect {
    return {
        valueId: accumulator.valueId,
        additive: accumulator.additive,
        multiplier: accumulator.multiplier,
    };
}

function matchesBuildingKeywords(
    buildingKeywords: readonly string[],
    rule: HomogeneousAdjacencyRule,
): boolean {
    const keywords = new Set(buildingKeywords);

    if ((rule.requiredBuildingKeywords ?? []).some((keyword) => !keywords.has(keyword))) return false;
    if ((rule.forbiddenBuildingKeywords ?? []).some((keyword) => keywords.has(keyword))) return false;

    return true;
}

function matchesValueKeywords(
    valueKeywords: Set<string>,
    rule: HomogeneousAdjacencyRule,
): boolean {
    if ((rule.requiredValueKeywords ?? []).some((keyword) => !valueKeywords.has(keyword))) return false;
    if ((rule.forbiddenValueKeywords ?? []).some((keyword) => valueKeywords.has(keyword))) return false;

    return true;
}

import {
    HOMOGENEOUS_VALUE_DEFINITION_LIST,
    HOMOGENEOUS_VALUE_DEFINITIONS,
} from "../data/homogeneousValues/index.ts";
import type {
    HomogeneousAdjacencyRule,
    HomogeneousResolvedValue,
    HomogeneousResolvedValueMap,
    HomogeneousValueEffect,
    HomogeneousValueId,
    HomogeneousValueRoleKeyword,
    HomogeneousValueTotals,
} from "./homogeneousValues.ts";
import {HOMOGENEOUS_VALUE_ROLE_KEYWORDS} from "./homogeneousValues.ts";

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
    return getAvailableValues(resolveHomogeneousValueContributions(effects));
}

export function resolveHomogeneousValueSources(
    sources: readonly EffectSource[],
): HomogeneousValueTotals {
    return resolveHomogeneousValueEffects(sources.flatMap((source) => source.effects ?? []));
}

export function resolveHomogeneousValueContributions(
    effects: readonly HomogeneousValueEffect[],
): HomogeneousResolvedValueMap {
    const resolvedValues = createInitialHomogeneousResolvedValues();

    for (const effect of effects) {
        const keywords = getEffectKeywords(effect);
        const roleKeyword = getContributionRoleKeyword(keywords, effect.valueId);
        const contributionValue = resolveContributionValue(effect);
        const resolvedValue = resolvedValues[effect.valueId] ?? createEmptyResolvedValue();

        if (roleKeyword === "production") {
            resolvedValue.producedValue += contributionValue;
        }

        if (roleKeyword === "upkeep") {
            resolvedValue.upkeepValue += contributionValue;
        }

        if (roleKeyword === "unlock") {
            resolvedValue.unlockRequiredValue += contributionValue;
        }

        updateDerivedResolvedValue(resolvedValue);
        resolvedValues[effect.valueId] = resolvedValue;
    }

    return resolvedValues;
}

export function resolvePlacedHomogeneousValueSources(
    sources: readonly PlacedEffectSource[],
    getNearbySources: (source: PlacedEffectSource, radius: number) => readonly PlacedEffectSource[],
): HomogeneousValueTotals {
    return getAvailableValues(resolvePlacedHomogeneousValueContributions(sources, getNearbySources));
}

export function resolvePlacedHomogeneousValueContributions(
    sources: readonly PlacedEffectSource[],
    getNearbySources: (source: PlacedEffectSource, radius: number) => readonly PlacedEffectSource[],
): HomogeneousResolvedValueMap {
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

    return resolveHomogeneousValueContributions(
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

export function getContributionRoleKeyword(
    keywords: Iterable<string>,
    valueId = "unknown",
): HomogeneousValueRoleKeyword {
    const roleKeywords = [...keywords].filter((keyword): keyword is HomogeneousValueRoleKeyword => (
        HOMOGENEOUS_VALUE_ROLE_KEYWORDS.includes(keyword as HomogeneousValueRoleKeyword)
    ));

    if (roleKeywords.length !== 1) {
        throw new Error(`Homogeneous contribution for ${valueId} must have exactly one role keyword: production, upkeep, or unlock.`);
    }

    return roleKeywords[0];
}

export function getAvailableValues(resolvedValues: HomogeneousResolvedValueMap): HomogeneousValueTotals {
    return mapResolvedValues(resolvedValues, "availableValue");
}

export function getProducedValues(resolvedValues: HomogeneousResolvedValueMap): HomogeneousValueTotals {
    return mapResolvedValues(resolvedValues, "producedValue");
}

export function getUpkeepValues(resolvedValues: HomogeneousResolvedValueMap): HomogeneousValueTotals {
    return mapResolvedValues(resolvedValues, "upkeepValue");
}

export function getUnlockRequiredValues(resolvedValues: HomogeneousResolvedValueMap): HomogeneousValueTotals {
    return mapResolvedValues(resolvedValues, "unlockRequiredValue");
}

function resolveContributionValue(effect: HomogeneousValueEffect): number {
    return (effect.additive ?? 0) * normalizeMultiplier(effect.multiplier);
}

function createInitialHomogeneousResolvedValues(): HomogeneousResolvedValueMap {
    return Object.fromEntries(
        HOMOGENEOUS_VALUE_DEFINITION_LIST.map((definition) => {
            const resolvedValue = createEmptyResolvedValue();
            resolvedValue.producedValue = definition.initialValue;
            updateDerivedResolvedValue(resolvedValue);

            return [definition.id, resolvedValue];
        }),
    );
}

function createEmptyResolvedValue(): HomogeneousResolvedValue {
    return {
        producedValue: 0,
        upkeepValue: 0,
        availableValue: 0,
        unlockRequiredValue: 0,
        unlockSatisfied: true,
    };
}

function updateDerivedResolvedValue(resolvedValue: HomogeneousResolvedValue): void {
    resolvedValue.availableValue = resolvedValue.producedValue - resolvedValue.upkeepValue;
    resolvedValue.unlockSatisfied = resolvedValue.producedValue >= resolvedValue.unlockRequiredValue;
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
        additionalKeywords: [...accumulator.keywords].filter((keyword) => (
            HOMOGENEOUS_VALUE_ROLE_KEYWORDS.includes(keyword as HomogeneousValueRoleKeyword)
        )),
        additive: accumulator.additive,
        multiplier: accumulator.multiplier,
    };
}

function mapResolvedValues(
    resolvedValues: HomogeneousResolvedValueMap,
    field: keyof Pick<HomogeneousResolvedValue, "producedValue" | "upkeepValue" | "availableValue" | "unlockRequiredValue">,
): HomogeneousValueTotals {
    return Object.fromEntries(
        Object.entries(resolvedValues).map(([valueId, resolvedValue]) => [valueId, resolvedValue[field]]),
    );
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

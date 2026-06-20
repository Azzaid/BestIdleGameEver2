import {
    HOMOGENEOUS_VALUE_DEFINITION_LIST,
    HOMOGENEOUS_VALUE_DEFINITIONS,
    HOMOGENEOUS_VALUE_RESOLUTION_CONFIG,
} from "../data/homogeneousValues/index.ts";
import type {
    HomogeneousAdjacencyRule,
    HomogeneousResolvedValue,
    HomogeneousResolvedValueMap,
    HomogeneousValueEffect,
    HomogeneousValueId,
    HomogeneousValueRoleKeyword,
    HomogeneousValueResolveType,
    HomogeneousValueTotals,
} from "./homogeneousValues.ts";
import {HOMOGENEOUS_VALUE_ROLE_KEYWORDS} from "./homogeneousValues.ts";

const GLOBAL_MODIFIER_KEYWORD = "global";

export type HomogeneousCityEntityType = "building" | "tower" | "wallSegment" | "wallSuperstructure";

export type HomogeneousValueEntitySource = {
    id: string;
    contentId?: string;
    entityType: HomogeneousCityEntityType;
    cellKey?: string;
    column?: number;
    row?: number;
    keywords?: readonly string[];
    contributions?: readonly HomogeneousValueEffect[];
    modifiers?: readonly HomogeneousAdjacencyRule[];
    mountedGunContributions?: readonly HomogeneousValueEffect[];
    mountedGunModifiers?: readonly HomogeneousAdjacencyRule[];
};

export type HomogeneousResolvedEntity = HomogeneousValueEntitySource & {
    activeModifiers: readonly HomogeneousAdjacencyRule[];
    resolvedContributions: readonly HomogeneousValueEffect[];
    resolvedValues: HomogeneousResolvedValueMap;
    values: HomogeneousValueTotals;
};

export type HomogeneousCityResolution = {
    buildingIds: Set<string>;
    buildingKeywords: Set<string>;
    values: HomogeneousValueTotals;
    resolvedValues: HomogeneousResolvedValueMap;
    resolvedHexes: readonly HomogeneousResolvedEntity[];
    resolvedTowers: readonly HomogeneousResolvedEntity[];
    resolvedWallSegments: readonly HomogeneousResolvedEntity[];
};

type EffectSource = {
    keywords?: readonly string[];
    effects?: readonly HomogeneousValueEffect[];
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
        const resolveType = getHomogeneousValueResolveType(effect.valueId);

        if (roleKeyword === "production") {
            resolvedValue.producedValue = resolveProducedValue(
                resolvedValue.producedValue,
                contributionValue,
                resolveType,
            );
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

export function resolveCityGlobalEffects(
    entities: readonly HomogeneousValueEntitySource[],
): HomogeneousAdjacencyRule[] {
    return entities.flatMap((entity) => (
        entity.modifiers ?? []
    ).filter(isGlobalModifier));
}

export function resolveTower(
    tower: HomogeneousValueEntitySource,
    allEntities: readonly HomogeneousValueEntitySource[] = [tower],
    globalModifiers = resolveCityGlobalEffects(allEntities),
): HomogeneousResolvedEntity {
    return resolveEntity(tower, allEntities, globalModifiers);
}

export function resolveWallSegment(
    wallSegment: HomogeneousValueEntitySource,
    wallSuperstructure?: HomogeneousValueEntitySource,
    allEntities: readonly HomogeneousValueEntitySource[] = [wallSegment, ...(wallSuperstructure ? [wallSuperstructure] : [])],
    globalModifiers = resolveCityGlobalEffects(allEntities),
): HomogeneousResolvedEntity {
    const wallEntities = wallSuperstructure ? [wallSegment, wallSuperstructure] : [wallSegment];
    const mergedWallEntity: HomogeneousValueEntitySource = {
        ...wallSegment,
        id: wallEntities.map((entity) => entity.id).join("+"),
        keywords: uniqueStrings(wallEntities.flatMap((entity) => [
            entity.entityType,
            ...(entity.keywords ?? []),
        ])),
        contributions: wallEntities.flatMap((entity) => entity.contributions ?? []),
        modifiers: wallEntities.flatMap((entity) => entity.modifiers ?? []),
    };

    return resolveEntity(mergedWallEntity, allEntities, globalModifiers);
}

export function resolveCity(
    entities: readonly HomogeneousValueEntitySource[],
): HomogeneousCityResolution {
    const globalModifiers = resolveCityGlobalEffects(entities);
    const resolvedEntities = entities.map((entity) => resolveEntity(entity, entities, globalModifiers));
    const resolvedValues = resolveHomogeneousValueContributions(
        resolvedEntities.flatMap((entity) => entity.resolvedContributions),
    );

    return {
        buildingIds: new Set(
            entities
                .filter((entity) => entity.entityType === "building")
                .map((entity) => entity.contentId ?? entity.id),
        ),
        buildingKeywords: new Set(
            entities
                .filter((entity) => entity.entityType === "building")
                .flatMap((entity) => entity.keywords ?? []),
        ),
        values: getAvailableValues(resolvedValues),
        resolvedValues,
        resolvedHexes: resolvedEntities,
        resolvedTowers: resolvedEntities.filter((entity) => entity.entityType === "tower"),
        resolvedWallSegments: resolvedEntities.filter((entity) => (
            entity.entityType === "wallSegment" || entity.entityType === "wallSuperstructure"
        )),
    };
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

function resolveEntity(
    entity: HomogeneousValueEntitySource,
    allEntities: readonly HomogeneousValueEntitySource[],
    globalModifiers: readonly HomogeneousAdjacencyRule[],
    areAdjacent: (
        source: HomogeneousValueEntitySource,
        target: HomogeneousValueEntitySource,
        radius: number,
    ) => boolean = areEntitiesWithinRadius,
): HomogeneousResolvedEntity {
    const contributionAccumulators = (entity.contributions ?? []).map(createEffectAccumulator);
    const activeModifiers = collectEntityModifiers(entity, allEntities, globalModifiers, areAdjacent);

    for (const modifier of activeModifiers) {
        for (const contributionAccumulator of contributionAccumulators) {
            if (!matchesValueKeywords(contributionAccumulator.keywords, modifier)) continue;

            contributionAccumulator.additive += modifier.additive ?? 0;
            contributionAccumulator.multiplier *= normalizeMultiplier(modifier.multiplier);
        }
    }

    const resolvedContributions = contributionAccumulators.map(toHomogeneousValueEffect);
    const resolvedValues = resolveHomogeneousValueContributions(resolvedContributions);

    return {
        ...entity,
        activeModifiers,
        resolvedContributions,
        resolvedValues,
        values: getAvailableValues(resolvedValues),
    };
}

function collectEntityModifiers(
    targetEntity: HomogeneousValueEntitySource,
    allEntities: readonly HomogeneousValueEntitySource[],
    globalModifiers: readonly HomogeneousAdjacencyRule[],
    areAdjacent: (
        source: HomogeneousValueEntitySource,
        target: HomogeneousValueEntitySource,
        radius: number,
    ) => boolean,
): HomogeneousAdjacencyRule[] {
    const localModifiers = allEntities.flatMap((sourceEntity) => (
        sourceEntity.modifiers ?? []
    ).filter(isLocalModifier).filter((modifier) => (
        areEntitiesInSameHex(sourceEntity, targetEntity)
        && matchesEntity(targetEntity, modifier)
    )));
    const adjacencyModifiers = allEntities.flatMap((sourceEntity) => (
        sourceEntity.modifiers ?? []
    ).filter(isAdjacencyModifier).filter((modifier) => (
        sourceEntity.id !== targetEntity.id
        && !areEntitiesInSameHex(sourceEntity, targetEntity)
        && areAdjacent(sourceEntity, targetEntity, modifier.radius ?? 1)
        && matchesEntity(targetEntity, modifier)
    )));
    const matchingGlobalModifiers = globalModifiers.filter((modifier) => matchesEntity(targetEntity, modifier));

    return [
        ...localModifiers,
        ...adjacencyModifiers,
        ...matchingGlobalModifiers,
    ];
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

function getHomogeneousValueResolveType(valueId: HomogeneousValueId): HomogeneousValueResolveType {
    return HOMOGENEOUS_VALUE_RESOLUTION_CONFIG[valueId]?.resolveType ?? "sum";
}

function resolveProducedValue(
    currentValue: number,
    contributionValue: number,
    resolveType: HomogeneousValueResolveType,
): number {
    if (resolveType === "minimum") {
        return Math.min(currentValue, contributionValue);
    }

    if (resolveType === "maximum") {
        return Math.max(currentValue, contributionValue);
    }

    return currentValue + contributionValue;
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
    const definitionKeywords = new Set(HOMOGENEOUS_VALUE_DEFINITIONS[accumulator.valueId]?.keywords ?? []);
    const additionalKeywords = [...accumulator.keywords].filter((keyword) => !definitionKeywords.has(keyword));
    const removedKeywords = [...definitionKeywords].filter((keyword) => !accumulator.keywords.has(keyword));

    return {
        valueId: accumulator.valueId,
        additionalKeywords,
        removedKeywords,
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

function matchesEntity(
    entity: HomogeneousValueEntitySource,
    modifier: HomogeneousAdjacencyRule,
): boolean {
    const keywords = getEntityKeywords(entity);

    if ((modifier.requiredBuildingKeywords ?? []).some((keyword) => !keywords.has(keyword))) return false;
    if ((modifier.forbiddenBuildingKeywords ?? []).some((keyword) => keywords.has(keyword))) return false;

    return true;
}

function matchesValueKeywords(
    valueKeywords: Set<string>,
    modifier: HomogeneousAdjacencyRule,
): boolean {
    if ((modifier.requiredValueKeywords ?? []).some((keyword) => !valueKeywords.has(keyword))) return false;
    if ((modifier.forbiddenValueKeywords ?? []).some((keyword) => valueKeywords.has(keyword))) return false;

    return true;
}

function getEntityKeywords(entity: HomogeneousValueEntitySource): Set<string> {
    return new Set([
        entity.entityType,
        ...(entity.keywords ?? []),
    ]);
}

function isGlobalModifier(modifier: HomogeneousAdjacencyRule): boolean {
    return modifier.keywords?.includes(GLOBAL_MODIFIER_KEYWORD) ?? false;
}

function isAdjacencyModifier(modifier: HomogeneousAdjacencyRule): boolean {
    return modifier.radius !== undefined && !isGlobalModifier(modifier);
}

function isLocalModifier(modifier: HomogeneousAdjacencyRule): boolean {
    return !isAdjacencyModifier(modifier) && !isGlobalModifier(modifier);
}

function areEntitiesWithinRadius(
    sourceEntity: HomogeneousValueEntitySource,
    targetEntity: HomogeneousValueEntitySource,
    radius: number,
): boolean {
    if (sourceEntity.column === undefined || sourceEntity.row === undefined) return false;
    if (targetEntity.column === undefined || targetEntity.row === undefined) return false;

    const columnDistance = Math.abs(targetEntity.column - sourceEntity.column);
    const rowDistance = Math.abs(targetEntity.row - sourceEntity.row);
    const diagonalDistance = Math.abs(
        targetEntity.column + targetEntity.row - sourceEntity.column - sourceEntity.row,
    );

    return Math.max(columnDistance, rowDistance, diagonalDistance) <= radius;
}

function areEntitiesInSameHex(
    sourceEntity: HomogeneousValueEntitySource,
    targetEntity: HomogeneousValueEntitySource,
): boolean {
    if (sourceEntity.cellKey && targetEntity.cellKey) {
        return sourceEntity.cellKey === targetEntity.cellKey;
    }

    if (
        sourceEntity.column !== undefined
        && sourceEntity.row !== undefined
        && targetEntity.column !== undefined
        && targetEntity.row !== undefined
    ) {
        return sourceEntity.column === targetEntity.column && sourceEntity.row === targetEntity.row;
    }

    return sourceEntity.id === targetEntity.id;
}

function uniqueStrings(values: readonly string[]): string[] {
    return [...new Set(values)];
}

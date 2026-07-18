import {
    HOMOGENEOUS_VALUE_DEFINITION_LIST,
    HOMOGENEOUS_VALUE_DEFINITIONS,
    HOMOGENEOUS_VALUE_DERIVED_RESOLUTION_CONFIG,
} from "../data/homogeneousValues/index.ts";
import type {
    HomogeneousAdjacencyRule,
    HomogeneousDerivedValueEffect,
    HomogeneousResolvedValue,
    HomogeneousResolvedValueMap,
    HomogeneousValueEffect,
    HomogeneousValueDefinition,
    HomogeneousValueId,
    HomogeneousValueRoleKeyword,
    HomogeneousValueRoundingMethod,
    HomogeneousValueResolveType,
    HomogeneousValueTotals,
} from "./homogeneousValues.ts";
import {HOMOGENEOUS_VALUE_ROLE_KEYWORDS} from "./homogeneousValues.ts";
import type {DevelopmentVectorKey} from "./DevlopmentVector.ts";

const homogeneousValueDefinitions = HOMOGENEOUS_VALUE_DEFINITIONS as Record<HomogeneousValueId, HomogeneousValueDefinition>;

export type HomogeneousCityEntityType = "building" | "tower" | "wallSegment" | "wallSuperstructure" | "technology" | "globalModifier";
export type HomogeneousRuleSourceEntityType = "hex" | "tower" | "technology" | "globalModifier";
export type HexCoordinates = { column: number; row: number };

export type HomogeneousValueEntitySource = {
    id: string;
    contentId?: string;
    name?: string;
    entityType: HomogeneousCityEntityType;
    cellKey?: string;
    column?: number;
    row?: number;
    keywords?: readonly string[];
    values?: readonly HomogeneousValueEffect[];
    derivedValues?: readonly HomogeneousDerivedValueEffect[];
    effects?: readonly HomogeneousAdjacencyRule[];
};

export type HomogeneousResolvedEntity = Omit<HomogeneousValueEntitySource, "values"> & {
    baseKeywords: readonly string[];
    effectiveKeywords: readonly string[];
    matchedRuleIds: readonly string[];
    baseValueEffects: readonly HomogeneousValueEffect[];
    activeModifiers: readonly HomogeneousActiveModifier[];
    resolvedContributions: readonly HomogeneousValueEffect[];
    resolvedValues: HomogeneousResolvedValueMap;
    values: HomogeneousValueTotals;
};

export type HomogeneousActiveModifier = {
    rule: HomogeneousAdjacencyRule;
    sourceEntityId: string;
    sourceContentId?: string;
    sourceName?: string;
    sourceEntityType: HomogeneousRuleSourceEntityType;
};

export type HomogeneousCityResolution = {
    buildingIds: Set<string>;
    buildingKeywords: Set<string>;
    values: HomogeneousValueTotals;
    resolvedValues: HomogeneousResolvedValueMap;
    resolvedHexes: readonly HomogeneousResolvedEntity[];
    resolvedTowers: readonly HomogeneousResolvedEntity[];
    resolvedWallSegments: readonly HomogeneousResolvedEntity[];
    resolvedTechnologies: readonly HomogeneousResolvedEntity[];
};

type EffectSource = {
    keywords?: readonly string[];
    values?: readonly HomogeneousValueEffect[];
};

type EffectAccumulator = {
    valueId: HomogeneousValueId;
    vector?: DevelopmentVectorKey;
    roleKeyword: HomogeneousValueRoleKeyword;
    keywords: Set<string>;
    additive: number;
    multiplier: number;
};

type HomogeneousCollectedAdjacencyRule = {
    id: string;
    sourceEntityId: string;
    sourceContentId?: string;
    sourceName?: string;
    sourceEntityType: HomogeneousRuleSourceEntityType;
    sourcePosition: HexCoordinates | null;
    rule: HomogeneousAdjacencyRule;
};

type ResolvedEntityDraft = HomogeneousValueEntitySource & {
    baseKeywords: readonly string[];
    effectiveKeywords: readonly string[];
    matchedRules: readonly HomogeneousCollectedAdjacencyRule[];
    matchedRuleIds: readonly string[];
    baseValueEffects: readonly HomogeneousValueEffect[];
};

const MAX_KEYWORD_RESOLUTION_ITERATIONS = 20;

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
    return resolveHomogeneousValueEffects(sources.flatMap((source) => source.values ?? []));
}

export function resolveHomogeneousValueContributions(
    effects: readonly HomogeneousValueEffect[],
): HomogeneousResolvedValueMap {
    const contributionAccumulators = groupHomogeneousValueEffects(effects);
    return resolveGroupedHomogeneousValueContributions(contributionAccumulators);
}

export function resolveTower(
    tower: HomogeneousValueEntitySource,
    allEntities: readonly HomogeneousValueEntitySource[] = [tower],
): HomogeneousResolvedEntity {
    const resolvedTower = resolveCityEntities(allEntities).find((entity) => entity.id === tower.id)
        ?? resolveCityEntities([tower])[0];

    if (!resolvedTower) {
        throw new Error(`Unable to resolve tower entity ${tower.id}.`);
    }

    return resolvedTower;
}

export function resolveWallSegment(
    wallSegment: HomogeneousValueEntitySource,
    wallSuperstructure?: HomogeneousValueEntitySource,
    allEntities: readonly HomogeneousValueEntitySource[] = [wallSegment, ...(wallSuperstructure ? [wallSuperstructure] : [])],
): HomogeneousResolvedEntity {
    const wallEntities = wallSuperstructure ? [wallSegment, wallSuperstructure] : [wallSegment];
    const mergedWallEntity: HomogeneousValueEntitySource = {
        ...wallSegment,
        id: wallEntities.map((entity) => entity.id).join("+"),
        keywords: uniqueStrings(wallEntities.flatMap((entity) => [
            entity.entityType,
            ...(entity.keywords ?? []),
        ])),
        values: wallEntities.flatMap((entity) => getEntityValues(entity)),
        derivedValues: wallEntities.flatMap((entity) => entity.derivedValues ?? []),
        effects: wallEntities.flatMap((entity) => getEntityEffects(entity)),
    };

    const resolvedWallSegment = resolveCityEntities([
        mergedWallEntity,
        ...allEntities.filter((entity) => entity.id !== wallSegment.id && entity.id !== wallSuperstructure?.id),
    ]).find((entity) => entity.id === mergedWallEntity.id) ?? resolveCityEntities([mergedWallEntity])[0];

    if (!resolvedWallSegment) {
        throw new Error(`Unable to resolve wall segment entity ${mergedWallEntity.id}.`);
    }

    return resolvedWallSegment;
}

export function resolveCity(
    entities: readonly HomogeneousValueEntitySource[],
): HomogeneousCityResolution {
    const resolvedEntities = resolveCityEntities(entities);
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
            resolvedEntities
                .filter((entity) => entity.entityType === "building")
                .flatMap((entity) => entity.effectiveKeywords),
        ),
        values: getAvailableValues(resolvedValues),
        resolvedValues,
        resolvedHexes: resolvedEntities.filter((entity) => (
            entity.entityType !== "technology" && entity.entityType !== "globalModifier" && entity.entityType !== "tower"
        )),
        resolvedTowers: resolvedEntities.filter((entity) => entity.entityType === "tower"),
        resolvedWallSegments: resolvedEntities.filter((entity) => (
            entity.entityType === "wallSegment" || entity.entityType === "wallSuperstructure"
        )),
        resolvedTechnologies: resolvedEntities.filter((entity) => (
            entity.entityType === "technology" || entity.entityType === "globalModifier"
        )),
    };
}

export function resolveDerivedValueEffects(
    derivedValues: readonly HomogeneousDerivedValueEffect[] | undefined,
    sourceValues: HomogeneousValueTotals,
): HomogeneousValueEffect[] {
    return (derivedValues ?? []).flatMap((derivedValue) => {
        if (!isValidDerivedValueEffect(derivedValue)) return [];

        const sourceValue = sourceValues[derivedValue.derivedFrom] ?? 0;
        const derivedAdditive = (derivedValue.additive ?? 0) + sourceValue * derivedValue.derivedMultiplicator;
        const additionalKeywords = [
            "production",
            ...(derivedValue.additionalKeywords ?? []).filter((keyword) => (
                !HOMOGENEOUS_VALUE_ROLE_KEYWORDS.includes(keyword as HomogeneousValueRoleKeyword)
            )),
        ];

        return [{
            valueId: derivedValue.valueId,
            additionalKeywords,
            removedKeywords: derivedValue.removedKeywords,
            multiplier: derivedValue.multiplier,
            additive: derivedAdditive,
        }];
    });
}

export function resolveEntityContributionsWithDerivedValues(
    entity: HomogeneousResolvedEntity,
    sourceValues: HomogeneousValueTotals,
): HomogeneousValueEffect[] {
    return [
        ...entity.resolvedContributions,
        ...resolveDerivedValueEffects(entity.derivedValues, sourceValues),
    ];
}

export function resolveEntityValuesWithDerivedValues(
    entity: HomogeneousResolvedEntity,
    sourceValues: HomogeneousValueTotals,
): HomogeneousResolvedValueMap {
    return resolveHomogeneousValueContributions(resolveEntityContributionsWithDerivedValues(entity, sourceValues));
}

export function getEffectKeywords(effect: HomogeneousValueEffect): Set<string> {
    const definition = homogeneousValueDefinitions[effect.valueId];
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
    defaultRoleKeyword?: HomogeneousValueRoleKeyword,
): HomogeneousValueRoleKeyword {
    const roleKeywords = [...keywords].filter((keyword): keyword is HomogeneousValueRoleKeyword => (
        HOMOGENEOUS_VALUE_ROLE_KEYWORDS.includes(keyword as HomogeneousValueRoleKeyword)
    ));

    if (roleKeywords.length === 0 && defaultRoleKeyword) {
        return defaultRoleKeyword;
    }

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

function resolveCityEntities(
    sources: readonly HomogeneousValueEntitySource[],
): HomogeneousResolvedEntity[] {
    const entityDrafts = buildResolvedEntityDrafts(sources);
    const collectedRules = collectHomogeneousAdjacencyRules(sources);
    const keywordResolvedEntityDrafts = resolveEffectiveEntityKeywords(entityDrafts, collectedRules);
    const resolvedTechnologyEntities = sources
        .filter((source) => source.entityType === "technology" || source.entityType === "globalModifier")
        .map(resolveTechnologySourceValues);

    return [
        ...keywordResolvedEntityDrafts.map(resolveEntityValues),
        ...resolvedTechnologyEntities,
    ];
}

function buildResolvedEntityDrafts(
    sources: readonly HomogeneousValueEntitySource[],
): ResolvedEntityDraft[] {
    return sources
        .filter((source) => source.entityType !== "technology" && source.entityType !== "globalModifier")
        .map((source) => {
            const baseKeywords = normalizeEntityKeywords(source);

            return {
                ...source,
                keywords: [...(source.keywords ?? [])],
                values: [...getEntityValues(source)],
                effects: [...getEntityEffects(source)],
                baseKeywords,
                effectiveKeywords: baseKeywords,
                matchedRules: [],
                matchedRuleIds: [],
                baseValueEffects: [...getEntityValues(source)],
            };
        });
}

function collectHomogeneousAdjacencyRules(
    sources: readonly HomogeneousValueEntitySource[],
): HomogeneousCollectedAdjacencyRule[] {
    return sources.flatMap((source) => getEntityEffects(source).map((rule, ruleIndex) => ({
        id: `${source.id}:rule:${ruleIndex}`,
        sourceEntityId: source.id,
        sourceContentId: source.contentId,
        sourceName: source.name,
        sourceEntityType: getRuleSourceEntityType(source),
        sourcePosition: getEntityPosition(source),
        rule,
    })));
}

function resolveEffectiveEntityKeywords(
    initialEntityDrafts: readonly ResolvedEntityDraft[],
    collectedRules: readonly HomogeneousCollectedAdjacencyRule[],
): ResolvedEntityDraft[] {
    let entityDrafts = initialEntityDrafts.map((entity) => resolveEntityKeywordIteration(entity, collectedRules));

    for (let iteration = 0; iteration < MAX_KEYWORD_RESOLUTION_ITERATIONS; iteration += 1) {
        const nextEntityDrafts = entityDrafts.map((entity) => resolveEntityKeywordIteration(entity, collectedRules));
        const unstableEntity = nextEntityDrafts.find((nextEntity, entityIndex) => (
            getEntityResolutionSignature(entityDrafts[entityIndex]) !== getEntityResolutionSignature(nextEntity)
        ));

        if (!unstableEntity) {
            return nextEntityDrafts;
        }

        entityDrafts = nextEntityDrafts;
    }

    const nextEntityDrafts = entityDrafts.map((entity) => resolveEntityKeywordIteration(entity, collectedRules));
    const unstableEntity = nextEntityDrafts.find((nextEntity, entityIndex) => (
        getEntityResolutionSignature(entityDrafts[entityIndex]) !== getEntityResolutionSignature(nextEntity)
    ));

    if (unstableEntity) {
        const previousEntity = entityDrafts.find((entity) => entity.id === unstableEntity.id);
        throw new Error(
            `Homogeneous keyword resolution did not stabilize for entity ${unstableEntity.id} after ${MAX_KEYWORD_RESOLUTION_ITERATIONS} iterations. `
            + `Previous signature: ${previousEntity ? getEntityResolutionSignature(previousEntity) : "missing"}. `
            + `Current signature: ${getEntityResolutionSignature(unstableEntity)}. `
            + `Matched rule ids: ${unstableEntity.matchedRuleIds.join(", ") || "none"}.`,
        );
    }

    return nextEntityDrafts;
}

function resolveEntityKeywordIteration(
    entity: ResolvedEntityDraft,
    collectedRules: readonly HomogeneousCollectedAdjacencyRule[],
): ResolvedEntityDraft {
    const matchedRules = collectedRules.filter((collectedRule) => matchesCollectedRule(entity, collectedRule));
    const effectiveKeywordSet = new Set(entity.baseKeywords);

    for (const matchedRule of matchedRules) {
        for (const removedKeyword of matchedRule.rule.removedBuildingKeywords ?? []) {
            effectiveKeywordSet.delete(removedKeyword);
        }

        for (const additionalKeyword of matchedRule.rule.additionalBuildingKeywords ?? []) {
            effectiveKeywordSet.add(additionalKeyword);
        }
    }

    const effectiveKeywords = sortStrings([...effectiveKeywordSet]);
    const matchedRuleIds = sortStrings(matchedRules.map((matchedRule) => matchedRule.id));

    return {
        ...entity,
        effectiveKeywords,
        keywords: effectiveKeywords,
        matchedRules,
        matchedRuleIds,
    };
}

function resolveEntityValues(entity: ResolvedEntityDraft): HomogeneousResolvedEntity {
    const contributionAccumulators = groupHomogeneousValueEffects(
        entity.baseValueEffects,
        getDefaultContributionRoleKeyword(entity),
    );
    const activeModifiers = entity.matchedRules.map(toHomogeneousActiveModifier);

    for (const modifier of activeModifiers) {
        ensureModifierTargetAccumulators(contributionAccumulators, modifier.rule);

        for (const contributionAccumulator of contributionAccumulators) {
            if (!matchesValueKeywords(contributionAccumulator.keywords, modifier.rule)) continue;

            contributionAccumulator.additive = resolveAdditiveContributionValue(
                contributionAccumulator.additive,
                modifier.rule.additive ?? 0,
                getHomogeneousValueResolveType(contributionAccumulator.valueId),
            );
            contributionAccumulator.multiplier *= normalizeMultiplier(modifier.rule.multiplier);
        }
    }

    const resolvedContributions = contributionAccumulators.map(toResolvedHomogeneousValueEffect);
    const resolvedValues = resolveHomogeneousValueContributions(resolvedContributions);
    const {matchedRules, ...resolvedEntitySource} = entity;

    return {
        ...resolvedEntitySource,
        activeModifiers,
        resolvedContributions,
        resolvedValues,
        values: getAvailableValues(resolvedValues),
    };
}

function resolveTechnologySourceValues(source: HomogeneousValueEntitySource): HomogeneousResolvedEntity {
    const baseKeywords = normalizeEntityKeywords(source);
    const baseValueEffects = [...getEntityValues(source)];
    const contributionAccumulators = groupHomogeneousValueEffects(
        baseValueEffects,
        getDefaultContributionRoleKeyword(source),
    );
    const resolvedContributions = contributionAccumulators.map(toResolvedHomogeneousValueEffect);
    const resolvedValues = resolveHomogeneousValueContributions(resolvedContributions);

    return {
        ...source,
        keywords: [...(source.keywords ?? [])],
        effects: [...getEntityEffects(source)],
        baseKeywords,
        effectiveKeywords: baseKeywords,
        matchedRuleIds: [],
        baseValueEffects,
        activeModifiers: [],
        resolvedContributions,
        resolvedValues,
        values: getAvailableValues(resolvedValues),
    };
}

function groupHomogeneousValueEffects(
    effects: readonly HomogeneousValueEffect[],
    defaultRoleKeyword?: HomogeneousValueRoleKeyword,
): EffectAccumulator[] {
    const accumulators = new Map<string, EffectAccumulator>();

    for (const effect of effects) {
        const keywords = getEffectKeywords(effect);
        const roleKeyword = getContributionRoleKeyword(keywords, effect.valueId, defaultRoleKeyword);
        keywords.add(roleKeyword);
        const key = getAccumulatorKey(effect.valueId, roleKeyword);
        const existing = accumulators.get(key);

        if (existing) {
            existing.additive = resolveAdditiveContributionValue(
                existing.additive,
                effect.additive ?? 0,
                getHomogeneousValueResolveType(effect.valueId),
            );
            existing.multiplier *= normalizeMultiplier(effect.multiplier);
            existing.vector = getMergedEffectVector(existing.vector, effect.vector);
            for (const keyword of keywords) existing.keywords.add(keyword);
            continue;
        }

        accumulators.set(key, createEffectAccumulator(effect, keywords, roleKeyword));
    }

    return [...accumulators.values()];
}

function ensureModifierTargetAccumulators(
    contributionAccumulators: EffectAccumulator[],
    modifier: HomogeneousAdjacencyRule,
): void {
    const additive = modifier.additive ?? 0;
    if (additive === 0) return;

    const roleKeyword = getModifierRoleKeyword(modifier);

    for (const definition of HOMOGENEOUS_VALUE_DEFINITION_LIST) {
        const key = getAccumulatorKey(definition.id, roleKeyword);
        if (contributionAccumulators.some((accumulator) => getAccumulatorKey(accumulator.valueId, accumulator.roleKeyword) === key)) {
            continue;
        }

        const keywords = new Set([...definition.keywords, roleKeyword]);
        if (!matchesValueKeywords(keywords, modifier)) continue;

        contributionAccumulators.push({
            valueId: definition.id,
            roleKeyword,
            keywords,
            additive: 0,
            multiplier: 1,
        });
    }
}

function toHomogeneousActiveModifier(
    collectedRule: HomogeneousCollectedAdjacencyRule,
): HomogeneousActiveModifier {
    return {
        rule: collectedRule.rule,
        sourceEntityId: collectedRule.sourceEntityId,
        sourceContentId: collectedRule.sourceContentId,
        sourceName: collectedRule.sourceName,
        sourceEntityType: collectedRule.sourceEntityType,
    };
}

function getModifierRoleKeyword(modifier: HomogeneousAdjacencyRule): HomogeneousValueRoleKeyword {
    const roleKeywords = (modifier.requiredValueKeywords ?? []).filter((keyword): keyword is HomogeneousValueRoleKeyword => (
        HOMOGENEOUS_VALUE_ROLE_KEYWORDS.includes(keyword as HomogeneousValueRoleKeyword)
    ));

    return roleKeywords[0] ?? "production";
}

function getAccumulatorKey(valueId: HomogeneousValueId, roleKeyword: HomogeneousValueRoleKeyword): string {
    return `${valueId}:${roleKeyword}`;
}

function resolveGroupedHomogeneousValueContributions(
    contributionAccumulators: readonly EffectAccumulator[],
): HomogeneousResolvedValueMap {
    const resolvedValues = createInitialHomogeneousResolvedValues();
    const directAccumulators = contributionAccumulators.filter((accumulator) => !isDerivedHomogeneousValue(accumulator.valueId));
    const derivedAccumulators = contributionAccumulators.filter((accumulator) => isDerivedHomogeneousValue(accumulator.valueId));

    applyHomogeneousValueAccumulators(resolvedValues, directAccumulators);
    resolveDerivedHomogeneousValues(resolvedValues);
    applyHomogeneousValueAccumulators(resolvedValues, derivedAccumulators);

    return resolvedValues;
}

function applyHomogeneousValueAccumulators(
    resolvedValues: HomogeneousResolvedValueMap,
    contributionAccumulators: readonly EffectAccumulator[],
): void {
    for (const accumulator of contributionAccumulators) {
        applyHomogeneousValueAccumulator(resolvedValues, accumulator);
    }
}

function applyHomogeneousValueAccumulator(
    resolvedValues: HomogeneousResolvedValueMap,
    accumulator: EffectAccumulator,
): void {
    const resolvedValue = resolvedValues[accumulator.valueId] ?? createEmptyResolvedValue();
    const resolveType = getHomogeneousValueResolveType(accumulator.valueId);
    const contributionValue = resolveAccumulatorValue(
        accumulator,
        resolvedValue.producedValue,
        resolveType,
    );

    if (accumulator.roleKeyword === "production") {
        resolvedValue.producedValue = contributionValue;
    }

    if (accumulator.roleKeyword === "upkeep") {
        resolvedValue.upkeepValue += contributionValue;
    }

    if (accumulator.roleKeyword === "unlock") {
        resolvedValue.unlockRequiredValue += contributionValue;
    }

    updateDerivedResolvedValue(resolvedValue);
    resolvedValues[accumulator.valueId] = resolvedValue;
}

function resolveDerivedHomogeneousValues(resolvedValues: HomogeneousResolvedValueMap): void {
    const sourceValues = getAvailableValues(resolvedValues);

    for (const [valueId, config] of Object.entries(HOMOGENEOUS_VALUE_DERIVED_RESOLUTION_CONFIG)) {
        if (!config) continue;

        const resolvedValue = resolvedValues[valueId] ?? createEmptyResolvedValue();
        resolvedValue.producedValue = roundHomogeneousValue(valueId, config.resolveValue(
            Object.fromEntries(config.sourceValueIds.map((sourceValueId) => [
                sourceValueId,
                sourceValues[sourceValueId] ?? 0,
            ])),
        ));
        updateDerivedResolvedValue(resolvedValue);
        resolvedValues[valueId] = resolvedValue;
    }
}

function isDerivedHomogeneousValue(valueId: HomogeneousValueId): boolean {
    return HOMOGENEOUS_VALUE_DERIVED_RESOLUTION_CONFIG[valueId] !== undefined;
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
    return homogeneousValueDefinitions[valueId]?.resolutionMethod ?? "sum";
}

function isValidDerivedValueEffect(effect: HomogeneousDerivedValueEffect): boolean {
    return (
        (effect.derivedFrom.startsWith("resource.") || effect.derivedFrom.startsWith("city."))
        && (effect.valueId.startsWith("tower.") || effect.valueId.startsWith("wall."))
        && Number.isFinite(effect.derivedMultiplicator)
    );
}

function getHomogeneousValueDiminishingReturnPower(valueId: HomogeneousValueId): number {
    return homogeneousValueDefinitions[valueId]?.diminishingReturnPower ?? 1;
}

function resolveAccumulatorValue(
    accumulator: EffectAccumulator,
    baseValue: number,
    resolveType: HomogeneousValueResolveType,
): number {
    if (accumulator.roleKeyword !== "production") {
        return accumulator.additive * accumulator.multiplier;
    }

    if (resolveType === "diminishingReturn") {
        return resolveFlatModifierValue(
            baseValue,
            accumulator.additive * accumulator.multiplier,
            resolveType,
            getHomogeneousValueDiminishingReturnPower(accumulator.valueId),
        );
    }

    const flatValue = resolveFlatModifierValue(
        baseValue,
        accumulator.additive,
        resolveType,
        getHomogeneousValueDiminishingReturnPower(accumulator.valueId),
    );

    return flatValue * accumulator.multiplier;
}

function resolveAdditiveContributionValue(
    baseValue: number,
    additive: number,
    resolveType: HomogeneousValueResolveType,
): number {
    if (resolveType === "minimum") {
        return Math.min(baseValue, additive);
    }

    if (resolveType === "maximum") {
        return Math.max(baseValue, additive);
    }

    return baseValue + additive;
}

function resolveFlatModifierValue(
    baseValue: number,
    additive: number,
    resolveType: HomogeneousValueResolveType,
    diminishingReturnPower = 1,
): number {
    if (resolveType === "minimum") {
        return Math.min(baseValue, additive);
    }

    if (resolveType === "maximum") {
        return Math.max(baseValue, additive);
    }

    if (resolveType === "diminishingReturn") {
        return Math.pow(baseValue + additive, diminishingReturnPower);
    }

    return baseValue + additive;
}

function createEffectAccumulator(
    effect: HomogeneousValueEffect,
    keywords = getEffectKeywords(effect),
    roleKeyword = getContributionRoleKeyword(keywords, effect.valueId),
): EffectAccumulator {
    return {
        valueId: effect.valueId,
        vector: effect.vector,
        roleKeyword,
        keywords,
        additive: effect.additive ?? 0,
        multiplier: normalizeMultiplier(effect.multiplier),
    };
}

function toResolvedHomogeneousValueEffect(accumulator: EffectAccumulator): HomogeneousValueEffect {
    const resolveType = getHomogeneousValueResolveType(accumulator.valueId);
    const initialValue = homogeneousValueDefinitions[accumulator.valueId]?.initialValue ?? 0;
    const resolvedValue = resolveAccumulatorValue(accumulator, initialValue, resolveType);
    const roundedResolvedValue = roundHomogeneousValue(accumulator.valueId, resolvedValue);
    const additive = accumulator.roleKeyword === "production" && resolveType === "sum"
        ? roundedResolvedValue - initialValue
        : accumulator.roleKeyword === "production" && resolveType === "diminishingReturn"
            ? accumulator.additive * accumulator.multiplier
        : roundedResolvedValue;

    return toHomogeneousValueEffect({
        ...accumulator,
        additive,
        multiplier: 1,
    });
}

function roundHomogeneousValue(valueId: HomogeneousValueId, value: number): number {
    const roundingMethod = getHomogeneousValueRoundingMethod(valueId);

    if (roundingMethod === "roundUp") return Math.ceil(value);
    if (roundingMethod === "roundDown") return Math.floor(value);

    return Math.round(value * 100) / 100;
}

function getHomogeneousValueRoundingMethod(valueId: HomogeneousValueId): HomogeneousValueRoundingMethod {
    return homogeneousValueDefinitions[valueId]?.roundingMethod ?? "twoDigitsAfterZero";
}

function toHomogeneousValueEffect(accumulator: EffectAccumulator): HomogeneousValueEffect {
    const definitionKeywords = new Set(homogeneousValueDefinitions[accumulator.valueId]?.keywords ?? []);
    const additionalKeywords = [...accumulator.keywords].filter((keyword) => !definitionKeywords.has(keyword));
    const removedKeywords = [...definitionKeywords].filter((keyword) => !accumulator.keywords.has(keyword));

    return {
        valueId: accumulator.valueId,
        vector: accumulator.vector,
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

function matchesCollectedRule(
    targetEntity: ResolvedEntityDraft,
    collectedRule: HomogeneousCollectedAdjacencyRule,
): boolean {
    const modifier = collectedRule.rule;

    if (isGlobalModifier(modifier)) {
        return matchesEntity(targetEntity, modifier);
    }

    if (isLocalModifier(modifier)) {
        return collectedRule.sourceEntityId === targetEntity.id && matchesEntity(targetEntity, modifier);
    }

    if (!isAdjacencyModifier(modifier)) return false;
    if (collectedRule.sourceEntityId === targetEntity.id) return false;
    if (areRuleSourceAndTargetInSameHex(collectedRule, targetEntity)) return false;
    if (!isRuleSourceWithinRadius(collectedRule, targetEntity, modifier.radius ?? 1)) return false;

    return matchesEntity(targetEntity, modifier);
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

function getEntityResolutionSignature(entity: ResolvedEntityDraft): string {
    return JSON.stringify({
        effectiveKeywords: sortStrings(entity.effectiveKeywords),
        matchedRuleIds: sortStrings(entity.matchedRuleIds),
    });
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
    if ("effectiveKeywords" in entity && Array.isArray(entity.effectiveKeywords)) {
        return new Set(entity.effectiveKeywords);
    }

    return new Set([
        entity.entityType,
        ...(entity.keywords ?? []),
    ]);
}

function normalizeEntityKeywords(entity: HomogeneousValueEntitySource): string[] {
    return sortStrings([
        entity.entityType,
        ...(entity.keywords ?? []),
    ]);
}

function getRuleSourceEntityType(entity: HomogeneousValueEntitySource): HomogeneousRuleSourceEntityType {
    if (entity.entityType === "technology") return "technology";
    if (entity.entityType === "globalModifier") return "globalModifier";
    if (entity.entityType === "tower") return "tower";

    return "hex";
}

function getMergedEffectVector(
    left: DevelopmentVectorKey | undefined,
    right: DevelopmentVectorKey | undefined,
): DevelopmentVectorKey | undefined {
    if (!left) return right;
    if (!right || left === right) return left;

    return "neutral";
}

function getDefaultContributionRoleKeyword(
    entity: Pick<HomogeneousValueEntitySource, "entityType">,
): HomogeneousValueRoleKeyword | undefined {
    if (entity.entityType === "globalModifier") return "production";

    return undefined;
}

function getEntityPosition(entity: HomogeneousValueEntitySource): HexCoordinates | null {
    if (entity.entityType === "technology") return null;
    if (entity.entityType === "globalModifier") return null;
    if (entity.column === undefined || entity.row === undefined) return null;

    return {
        column: entity.column,
        row: entity.row,
    };
}

function isGlobalModifier(modifier: HomogeneousAdjacencyRule): boolean {
    return modifier.radius === Infinity;
}

function isAdjacencyModifier(modifier: HomogeneousAdjacencyRule): boolean {
    return modifier.radius !== undefined && modifier.radius > 0 && !isGlobalModifier(modifier);
}

function isLocalModifier(modifier: HomogeneousAdjacencyRule): boolean {
    return (modifier.radius === undefined || modifier.radius === 0) && !isGlobalModifier(modifier);
}

function getEntityValues(entity: HomogeneousValueEntitySource): readonly HomogeneousValueEffect[] {
    return entity.values ?? [];
}

function getEntityEffects(entity: HomogeneousValueEntitySource): readonly HomogeneousAdjacencyRule[] {
    return entity.effects ?? [];
}

function isRuleSourceWithinRadius(
    sourceRule: HomogeneousCollectedAdjacencyRule,
    targetEntity: HomogeneousValueEntitySource,
    radius: number,
): boolean {
    if (!sourceRule.sourcePosition) return false;
    if (targetEntity.column === undefined || targetEntity.row === undefined) return false;

    const columnDistance = Math.abs(targetEntity.column - sourceRule.sourcePosition.column);
    const rowDistance = Math.abs(targetEntity.row - sourceRule.sourcePosition.row);
    const diagonalDistance = Math.abs(
        targetEntity.column + targetEntity.row - sourceRule.sourcePosition.column - sourceRule.sourcePosition.row,
    );

    return Math.max(columnDistance, rowDistance, diagonalDistance) <= radius;
}

function areRuleSourceAndTargetInSameHex(
    sourceRule: HomogeneousCollectedAdjacencyRule,
    targetEntity: HomogeneousValueEntitySource,
): boolean {
    if (!sourceRule.sourcePosition) return false;
    if (targetEntity.column === undefined || targetEntity.row === undefined) return false;

    return sourceRule.sourcePosition.column === targetEntity.column && sourceRule.sourcePosition.row === targetEntity.row;
}

function uniqueStrings(values: readonly string[]): string[] {
    return sortStrings([...new Set(values)]);
}

function sortStrings(values: readonly string[]): string[] {
    return [...values].sort((left, right) => left.localeCompare(right));
}

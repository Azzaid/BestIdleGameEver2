export type HomogeneousValueId = string;

export const HOMOGENEOUS_VALUE_ROLE_KEYWORDS = ["production", "upkeep", "unlock"] as const;
export type HomogeneousValueRoleKeyword = typeof HOMOGENEOUS_VALUE_ROLE_KEYWORDS[number];

export type HomogeneousResolvedValue = {
    producedValue: number;
    upkeepValue: number;
    availableValue: number;
    unlockRequiredValue: number;
    unlockSatisfied: boolean;
};

export type HomogeneousResolvedValueMap = Record<HomogeneousValueId, HomogeneousResolvedValue>;

export const HOMOGENEOUS_VALUE_RESOLVE_TYPES = ["sum", "minimum", "maximum", "diminishingReturn"] as const;
export type HomogeneousValueResolveType = typeof HOMOGENEOUS_VALUE_RESOLVE_TYPES[number];

export const HOMOGENEOUS_VALUE_DISPLAY_METHODS = [
    "default",
    "integer",
    "percent",
    "multiplier",
    "seconds",
    "distance",
    "kilometers",
    "triggerTolerance",
    "damaged",
] as const;
export type HomogeneousValueDisplayMethod = typeof HOMOGENEOUS_VALUE_DISPLAY_METHODS[number];

export const HOMOGENEOUS_VALUE_ROUNDING_METHODS = ["roundUp", "roundDown", "twoDigitsAfterZero"] as const;
export type HomogeneousValueRoundingMethod = typeof HOMOGENEOUS_VALUE_ROUNDING_METHODS[number];

export type HomogeneousValueEffect = {
    valueId: HomogeneousValueId;
    additionalKeywords?: string[];
    removedKeywords?: string[];
    multiplier?: number | null;
    additive?: number | null;
};

export type HomogeneousDerivedValueEffect = HomogeneousValueEffect & {
    derivedFrom: HomogeneousValueId;
    derivedMultiplicator: number;
};

export type HomogeneousValueDefinition = {
    id: HomogeneousValueId;
    label: string;
    keywords: string[];
    displayMethod: HomogeneousValueDisplayMethod;
    resolutionMethod?: HomogeneousValueResolveType;
    diminishingReturnPower?: number;
    roundingMethod?: HomogeneousValueRoundingMethod;
    initialValue: number;
};

export type HomogeneousValueDerivedResolutionConfig = {
    sourceValueIds: readonly HomogeneousValueId[];
    resolveValue: (sourceValues: HomogeneousValueTotals) => number;
};

export type HomogeneousAdjacencyRule = {
    keywords?: string[];
    requiredBuildingKeywords?: string[];
    forbiddenBuildingKeywords?: string[];
    additionalBuildingKeywords?: string[];
    removedBuildingKeywords?: string[];
    requiredValueKeywords?: string[];
    forbiddenValueKeywords?: string[];
    multiplier?: number | null;
    additive?: number | null;
    radius?: number;
};

export type HomogeneousValueTotals = Record<HomogeneousValueId, number>;

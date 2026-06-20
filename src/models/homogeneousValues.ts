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

export const HOMOGENEOUS_VALUE_RESOLVE_TYPES = ["sum", "minimum", "maximum"] as const;
export type HomogeneousValueResolveType = typeof HOMOGENEOUS_VALUE_RESOLVE_TYPES[number];

export type HomogeneousValueEffect = {
    valueId: HomogeneousValueId;
    additionalKeywords?: string[];
    removedKeywords?: string[];
    multiplier?: number | null;
    additive?: number | null;
};

export type HomogeneousValueDefinition = {
    id: HomogeneousValueId;
    label: string;
    keywords: string[];
    initialValue: number;
};

export type HomogeneousValueResolutionConfig = {
    resolveType: HomogeneousValueResolveType;
};

export type HomogeneousAdjacencyRule = {
    keywords?: string[];
    requiredBuildingKeywords?: string[];
    forbiddenBuildingKeywords?: string[];
    requiredValueKeywords?: string[];
    forbiddenValueKeywords?: string[];
    multiplier?: number | null;
    additive?: number | null;
    radius?: number;
};

export type HomogeneousValueTotals = Record<HomogeneousValueId, number>;

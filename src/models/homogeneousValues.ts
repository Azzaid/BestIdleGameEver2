export type HomogeneousValueId = string;

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

export type HomogeneousAdjacencyRule = {
    requiredBuildingKeywords?: string[];
    forbiddenBuildingKeywords?: string[];
    requiredValueKeywords?: string[];
    forbiddenValueKeywords?: string[];
    multiplier?: number | null;
    additive?: number | null;
    radius?: number;
};

export type HomogeneousValueTotals = Record<HomogeneousValueId, number>;

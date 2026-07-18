export const DEVELOPMENT_VECTORS = {
    neutral: "neutral",
    tech: "tech",
    nature: "nature",
    medieval: "medieval",
    aether: "aether",
} as const;

export type DevelopmentVectorKey = keyof typeof DEVELOPMENT_VECTORS;
export type DevelopmentVectorValue = typeof DEVELOPMENT_VECTORS[keyof typeof DEVELOPMENT_VECTORS];

export const DEVELOPMENT_VECTOR_LABELS: Record<DevelopmentVectorValue, string> = {
    [DEVELOPMENT_VECTORS.neutral]: "Neutral",
    [DEVELOPMENT_VECTORS.tech]: "Tech",
    [DEVELOPMENT_VECTORS.nature]: "Nature",
    [DEVELOPMENT_VECTORS.medieval]: "Medieval",
    [DEVELOPMENT_VECTORS.aether]: "Aether",
};

export function isDevelopmentVectorKey(value: string | undefined): value is DevelopmentVectorKey {
    return value !== undefined && value in DEVELOPMENT_VECTORS;
}

export function getDevelopmentVectorKey(value: DevelopmentVectorValue): DevelopmentVectorKey {
    return value;
}

export function getDevelopmentVectorFromEntityId(id: string | undefined): DevelopmentVectorKey | undefined {
    const [, vector] = id?.split(".") ?? [];
    return isDevelopmentVectorKey(vector) ? vector : undefined;
}

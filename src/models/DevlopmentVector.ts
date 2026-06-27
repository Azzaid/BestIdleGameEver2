export const DEVELOPMENT_VECTORS = {
    neutral: Symbol('Neutral'),
    tech: Symbol('Tech'),
    nature: Symbol('Nature'),
    medieval: Symbol('Medieval'),
    aether: Symbol('Aether'),
} as const;

export type DevelopmentVectorKey = keyof typeof DEVELOPMENT_VECTORS;
export type DevelopmentVectorValue = typeof DEVELOPMENT_VECTORS[keyof typeof DEVELOPMENT_VECTORS];

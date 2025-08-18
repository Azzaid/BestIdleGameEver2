export const DEVELOPMENT_VECTORS = {
    tech: Symbol('Tech'),
    nature: Symbol('Nature'),
    medieval: Symbol('Medieval'),
    aether: Symbol('Aether'),
    default: Symbol('Default')
} as const;

export type DevelopmentVectorKey = keyof typeof DEVELOPMENT_VECTORS;
export type DevelopmentVectorValue = typeof DEVELOPMENT_VECTORS[keyof typeof DEVELOPMENT_VECTORS];

export const BUILDING_TYPES = {
    produce: Symbol("Produce"),
    research: Symbol("Research"),
}

export type BuildingTypesKey = keyof typeof BUILDING_TYPES;
export type BuildingTypesValue = typeof BUILDING_TYPES[keyof typeof BUILDING_TYPES];
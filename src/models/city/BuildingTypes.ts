export const BUILDING_TYPES = {
    produce: Symbol("Produce"),
    research: Symbol("Research"),
    wallSegment: Symbol("Wall Segment"),
    tower: Symbol("Tower"),
}

export type BuildingTypesKey = keyof typeof BUILDING_TYPES;
export type BuildingTypesValue = typeof BUILDING_TYPES[keyof typeof BUILDING_TYPES];

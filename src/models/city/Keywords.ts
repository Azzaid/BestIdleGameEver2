export const ROLE_KEYWORDS = ["production","support","defense","infrastructure"] as const;
export type RoleKeyword = typeof ROLE_KEYWORDS[number];

export const RESOURCE_KEYWORDS = ["people","gold","electricity","mana","biomass","mutagen","arcane","highTechComponents"] as const;
export type ResourceKeyword = typeof RESOURCE_KEYWORDS[number];

export const MECHANIC_KEYWORDS = ["aura","chain","area","singleTarget","scalesWithLevel","slow","harm","push","visibility"] as const;
export type MechanicKeyword = typeof MECHANIC_KEYWORDS[number];

export const VECTOR_KEYWORDS = ["tech","nature","medieval","aether"] as const;
export type VectorKeyword = typeof VECTOR_KEYWORDS[number];

export const SYNERGY_KEYWORDS = [
    "farm",
    "mill",
    "generator",
    "shrine",
    "laboratory",
    "shelter",
    "salvage",
    "tools",
    "wood",
    "housing",
    "market",
    "craft",
    "garden",
    "herbs",
    "ritual",
] as const;
export type SynergyKeyword = typeof SYNERGY_KEYWORDS[number];

export type BuildingKeyword =
    | RoleKeyword
    | ResourceKeyword
    | MechanicKeyword
    | VectorKeyword
    | SynergyKeyword;

export const ALL_BUILDING_KEYWORDS = [
    ...ROLE_KEYWORDS,
    ...RESOURCE_KEYWORDS,
    ...MECHANIC_KEYWORDS,
    ...VECTOR_KEYWORDS,
    ...SYNERGY_KEYWORDS,
] as const;

//TODO: replace upkeep keys with techProduce, techResearch, aetherProduce, aetherResearch, medievalProduce, medievalResearch, etc.
import {DEVELOPMENT_VECTORS} from "./DevlopmentVector.ts";

export const UPKEEP_TYPES = {
    people: Symbol("People"),
    gold: Symbol("Gold"),
    electricity: Symbol("Electricity"),
    highTechComponents: Symbol("High Tech Components"),
    mana: Symbol("Mana"),
    arcaneSupplies: Symbol("Arcane Supplies"),
    biomass: Symbol("Biomass"),
    mutagen: Symbol("Mutagen"),
} as const;

export type UpkeepTypesKey = keyof typeof UPKEEP_TYPES;
export type UpkeepTypesValue = typeof UPKEEP_TYPES[keyof typeof UPKEEP_TYPES];

export type UpkeepAmount = Partial<Record<UpkeepTypesValue, number>>;
export type UpkeepDescription = Partial<Record<UpkeepTypesValue, string>>;

export const UPKEEP_TYPES_BY_VECTOR = {
    [DEVELOPMENT_VECTORS.tech]: [UPKEEP_TYPES.electricity, UPKEEP_TYPES.highTechComponents],
    [DEVELOPMENT_VECTORS.nature]: [UPKEEP_TYPES.biomass, UPKEEP_TYPES.mutagen],
    [DEVELOPMENT_VECTORS.medieval]: [UPKEEP_TYPES.people, UPKEEP_TYPES.gold],
    [DEVELOPMENT_VECTORS.aether]: [UPKEEP_TYPES.mana, UPKEEP_TYPES.arcaneSupplies],
}

// Here will be url strings
export const UPKEEP_SPRITES = {
    [UPKEEP_TYPES.people]: "People",
    [UPKEEP_TYPES.gold]: "Gold",
    [UPKEEP_TYPES.electricity]: "Electricity",
    [UPKEEP_TYPES.highTechComponents]: "High Tech Components",
    [UPKEEP_TYPES.mana]: "Mana",
    [UPKEEP_TYPES.arcaneSupplies]: "Arcane Supplies",
    [UPKEEP_TYPES.biomass]: "Biomass",
    [UPKEEP_TYPES.mutagen]: "Mutagen",
} as const satisfies Record<UpkeepTypesValue, string>;

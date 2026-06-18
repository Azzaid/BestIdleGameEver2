import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "./DevlopmentVector.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../data/homogeneousValues/index.ts";

export type ResourceKeyword =
    | "support"
    | "output"
    | "input"
    | "production"
    | "spendable"
    | "atmosphere"
    | "display_bar"
    | "display_orb"
    | "medieval"
    | "tech"
    | "nature"
    | "aether"
    | "people"
    | "gold"
    | "power"
    | "compute"
    | "veil"
    | "manaFlows"
    | "death"
    | "fungi"
    | "plants"
    | "animals";

export type ResourceDefinition = {
    id: string;
    label: string;
    vector: DevelopmentVectorValue;
    keywords: ResourceKeyword[];
};

export const UPKEEP_TYPES = {
    people: HOMOGENEOUS_VALUE_IDS.resourcePeople,
    gold: HOMOGENEOUS_VALUE_IDS.resourceGold,
    power: HOMOGENEOUS_VALUE_IDS.resourcePower,
    compute: HOMOGENEOUS_VALUE_IDS.resourceCompute,
    veil: HOMOGENEOUS_VALUE_IDS.resourceVeil,
    manaFlows: HOMOGENEOUS_VALUE_IDS.resourceManaFlows,
    death: HOMOGENEOUS_VALUE_IDS.resourceDeath,
    fungi: HOMOGENEOUS_VALUE_IDS.resourceFungi,
    plants: HOMOGENEOUS_VALUE_IDS.resourcePlants,
    animals: HOMOGENEOUS_VALUE_IDS.resourceAnimals,
} as const;

export type UpkeepTypesKey = keyof typeof UPKEEP_TYPES;
export type UpkeepTypesValue = typeof UPKEEP_TYPES[keyof typeof UPKEEP_TYPES];

export type UpkeepAmount = Partial<Record<UpkeepTypesValue, number>>;
export type UpkeepDescription = Partial<Record<UpkeepTypesValue, string>>;

export const RESOURCE_DEFINITIONS: Record<UpkeepTypesValue, ResourceDefinition> = {
    [UPKEEP_TYPES.people]: {
        id: UPKEEP_TYPES.people,
        label: "People",
        vector: DEVELOPMENT_VECTORS.medieval,
        keywords: ["support", "output", "production", "spendable", "display_bar", "medieval", "people"],
    },
    [UPKEEP_TYPES.gold]: {
        id: UPKEEP_TYPES.gold,
        label: "Gold",
        vector: DEVELOPMENT_VECTORS.medieval,
        keywords: ["support", "output", "production", "spendable", "display_bar", "medieval", "gold"],
    },
    [UPKEEP_TYPES.power]: {
        id: UPKEEP_TYPES.power,
        label: "Power",
        vector: DEVELOPMENT_VECTORS.tech,
        keywords: ["support", "output", "production", "spendable", "display_bar", "tech", "power"],
    },
    [UPKEEP_TYPES.compute]: {
        id: UPKEEP_TYPES.compute,
        label: "Compute",
        vector: DEVELOPMENT_VECTORS.tech,
        keywords: ["support", "output", "production", "spendable", "display_bar", "tech", "compute"],
    },
    [UPKEEP_TYPES.veil]: {
        id: UPKEEP_TYPES.veil,
        label: "Veil",
        vector: DEVELOPMENT_VECTORS.aether,
        keywords: ["atmosphere", "output", "production", "display_orb", "aether", "veil"],
    },
    [UPKEEP_TYPES.manaFlows]: {
        id: UPKEEP_TYPES.manaFlows,
        label: "Mana Flows",
        vector: DEVELOPMENT_VECTORS.aether,
        keywords: ["atmosphere", "output", "production", "display_orb", "aether", "manaFlows"],
    },
    [UPKEEP_TYPES.death]: {
        id: UPKEEP_TYPES.death,
        label: "Death",
        vector: DEVELOPMENT_VECTORS.aether,
        keywords: ["atmosphere", "output", "production", "display_orb", "aether", "death"],
    },
    [UPKEEP_TYPES.fungi]: {
        id: UPKEEP_TYPES.fungi,
        label: "Fungi",
        vector: DEVELOPMENT_VECTORS.nature,
        keywords: ["support", "output", "production", "spendable", "display_bar", "nature", "fungi"],
    },
    [UPKEEP_TYPES.plants]: {
        id: UPKEEP_TYPES.plants,
        label: "Plants",
        vector: DEVELOPMENT_VECTORS.nature,
        keywords: ["support", "output", "production", "spendable", "display_bar", "nature", "plants"],
    },
    [UPKEEP_TYPES.animals]: {
        id: UPKEEP_TYPES.animals,
        label: "Animals",
        vector: DEVELOPMENT_VECTORS.nature,
        keywords: ["support", "output", "production", "spendable", "display_bar", "nature", "animals"],
    },
};

export const UPKEEP_TYPES_BY_VECTOR = {
    [DEVELOPMENT_VECTORS.tech]: [UPKEEP_TYPES.power, UPKEEP_TYPES.compute],
    [DEVELOPMENT_VECTORS.nature]: [UPKEEP_TYPES.fungi, UPKEEP_TYPES.plants, UPKEEP_TYPES.animals],
    [DEVELOPMENT_VECTORS.medieval]: [UPKEEP_TYPES.people, UPKEEP_TYPES.gold],
    [DEVELOPMENT_VECTORS.aether]: [UPKEEP_TYPES.veil, UPKEEP_TYPES.manaFlows, UPKEEP_TYPES.death],
} as const satisfies Record<DevelopmentVectorValue, readonly UpkeepTypesValue[]>;

export const UPKEEP_SPRITES = Object.fromEntries(
    Object.values(RESOURCE_DEFINITIONS).map(resource => [resource.id, resource.label]),
) as Record<UpkeepTypesValue, string>;

export function getResourceDefinition(resource: UpkeepTypesValue): ResourceDefinition {
    return RESOURCE_DEFINITIONS[resource];
}

export function resourceHasKeywords(
    resource: UpkeepTypesValue,
    requiredKeywords: readonly ResourceKeyword[],
): boolean {
    const keywords = new Set(RESOURCE_DEFINITIONS[resource].keywords);
    return requiredKeywords.every(keyword => keywords.has(keyword));
}

export function getResourcesWithKeywords(requiredKeywords: readonly ResourceKeyword[]): UpkeepTypesValue[] {
    return (Object.keys(RESOURCE_DEFINITIONS) as UpkeepTypesValue[])
        .filter(resource => resourceHasKeywords(resource, requiredKeywords));
}

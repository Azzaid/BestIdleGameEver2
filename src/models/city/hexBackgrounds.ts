import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey, type DevelopmentVectorValue} from "../DevlopmentVector.ts";

export const CITY_HEX_BACKGROUND_TYPES = {
    claimedTerrain: "claimedTerrain",
    buildingUnderlay: "buildingUnderlay",
    claimableTerrain: "claimableTerrain",
    unclaimableTerrain: "unclaimableTerrain",
} as const;

export type CityHexBackgroundType = typeof CITY_HEX_BACKGROUND_TYPES[keyof typeof CITY_HEX_BACKGROUND_TYPES];

export const CITY_BIOMES = {
    alpine: "alpine",
    floodplain: "floodplain",
    swamp: "swamp",
    steppe: "steppe",
    rocky: "rocky",
    volcanic: "volcanic",
    coastal: "coastal",
    tundra: "tundra",
    ancientForest: "ancientForest",
} as const;

export type CityBiome = typeof CITY_BIOMES[keyof typeof CITY_BIOMES];

export const CITY_BIOME_LABELS: Record<CityBiome, string> = {
    [CITY_BIOMES.alpine]: "Alpine",
    [CITY_BIOMES.floodplain]: "Floodplain",
    [CITY_BIOMES.swamp]: "Swamp",
    [CITY_BIOMES.steppe]: "Steppe",
    [CITY_BIOMES.rocky]: "Rocky",
    [CITY_BIOMES.volcanic]: "Volcanic",
    [CITY_BIOMES.coastal]: "Coastal",
    [CITY_BIOMES.tundra]: "Tundra",
    [CITY_BIOMES.ancientForest]: "Ancient forest",
};

export type CityHexBackgroundSpriteId = string;

export type CityHexBackgroundSprite = {
    id: CityHexBackgroundSpriteId;
    type: CityHexBackgroundType;
    biome: CityBiome;
    vector: DevelopmentVectorKey;
    src: string;
};

export type CityHexBackgroundSpritePool = Record<
    CityHexBackgroundType,
    Record<CityBiome, Record<DevelopmentVectorKey, CityHexBackgroundSprite[]>>
>;

export type CityHexBackgroundSelection = {
    backgroundSpriteId: CityHexBackgroundSpriteId;
    backgroundDevelopmentVector: DevelopmentVectorValue;
};

const developmentVectorValues = Object.values(DEVELOPMENT_VECTORS);
const cityBiomeValues = Object.values(CITY_BIOMES);

export function selectRandomCityBiome(random = Math.random): CityBiome {
    return selectRandomItem(cityBiomeValues, random) ?? CITY_BIOMES.steppe;
}

export function selectHexBackgroundVector(random = Math.random): DevelopmentVectorValue {
    return selectRandomItem(developmentVectorValues, random) ?? DEVELOPMENT_VECTORS.medieval;
}

export function selectCityHexBackgroundSprite(
    pool: CityHexBackgroundSpritePool,
    type: CityHexBackgroundType,
    biome: CityBiome,
    vector: DevelopmentVectorValue,
    random = Math.random,
): CityHexBackgroundSelection {
    const vectorKey = getDevelopmentVectorKey(vector);
    const sprites = pool[type]?.[biome]?.[vectorKey] ?? [];
    const sprite = selectRandomItem(sprites, random);

    return {
        backgroundSpriteId: sprite?.id ?? getFallbackCityHexBackgroundSpriteId(type, biome, vectorKey),
        backgroundDevelopmentVector: vector,
    };
}

export function getFallbackCityHexBackgroundSpriteId(
    type: CityHexBackgroundType,
    biome: CityBiome,
    vector: DevelopmentVectorKey,
): CityHexBackgroundSpriteId {
    return `hexBackgrounds.${type}.${biome}.${vector}.fallback`;
}

export function getDevelopmentVectorKey(vector: DevelopmentVectorValue): DevelopmentVectorKey {
    const entry = Object.entries(DEVELOPMENT_VECTORS).find(([, value]) => value === vector);
    return (entry?.[0] ?? "medieval") as DevelopmentVectorKey;
}

function selectRandomItem<T>(items: readonly T[], random: () => number): T | undefined {
    if (!items.length) return undefined;

    return items[Math.floor(random() * items.length)];
}

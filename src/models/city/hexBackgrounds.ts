import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey, type DevelopmentVectorValue} from "../DevlopmentVector.ts";

export const CITY_HEX_BACKGROUND_TYPES = {
    background: "background",
    removableObstacle: "removableObstacle",
    permanentObstacle: "permanentObstacle",
} as const;

export type CityHexBackgroundType = typeof CITY_HEX_BACKGROUND_TYPES[keyof typeof CITY_HEX_BACKGROUND_TYPES];

export const CITY_BIOMES = {
    plains: "plains",
    desert: "desert",
    marsh: "marsh",
    alpine: "alpine",
} as const;

export type CityBiome = typeof CITY_BIOMES[keyof typeof CITY_BIOMES];

export const CITY_BIOME_LABELS: Record<CityBiome, string> = {
    [CITY_BIOMES.plains]: "Plains",
    [CITY_BIOMES.desert]: "Desert",
    [CITY_BIOMES.marsh]: "Marsh",
    [CITY_BIOMES.alpine]: "Alpine",
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

export type CityHexObstacleSelection = {
    obstacleSpriteId: CityHexBackgroundSpriteId;
    obstacleDevelopmentVector: DevelopmentVectorValue;
};

const developmentVectorValues = Object.values(DEVELOPMENT_VECTORS)
    .filter(vector => vector !== DEVELOPMENT_VECTORS.neutral);
const cityBiomeValues = Object.values(CITY_BIOMES);

export function selectRandomCityBiome(random = Math.random): CityBiome {
    return selectRandomItem(cityBiomeValues, random) ?? CITY_BIOMES.plains;
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
    fallbackBiome?: CityBiome,
): CityHexBackgroundSelection {
    const vectorKey = getDevelopmentVectorKey(vector);
    const biomeFallbackOrder = [
        biome,
        ...(fallbackBiome && fallbackBiome !== biome ? [fallbackBiome] : []),
    ];
    const vectorFallbackOrder = getVectorFallbackOrder(vectorKey);
    const sprite = selectRandomItem(
        biomeFallbackOrder.flatMap(candidateBiome => (
            vectorFallbackOrder.flatMap(candidateVector => pool[type]?.[candidateBiome]?.[candidateVector] ?? [])
        )),
        random,
    );

    return {
        backgroundSpriteId: sprite?.id ?? getFallbackCityHexBackgroundSpriteId(type, biome, vectorKey),
        backgroundDevelopmentVector: vector,
    };
}

function getVectorFallbackOrder(vector: DevelopmentVectorKey): DevelopmentVectorKey[] {
    return [
        vector,
        "medieval",
        "tech",
        "nature",
        "aether",
    ].filter((candidate, index, candidates): candidate is DevelopmentVectorKey => (
        candidate !== "neutral"
        && candidates.indexOf(candidate) === index
    ));
}

export function selectCityHexObstacleSprite(
    pool: CityHexBackgroundSpritePool,
    type: typeof CITY_HEX_BACKGROUND_TYPES.removableObstacle | typeof CITY_HEX_BACKGROUND_TYPES.permanentObstacle,
    biome: CityBiome,
    vector: DevelopmentVectorValue,
    random = Math.random,
    fallbackBiome?: CityBiome,
): CityHexObstacleSelection {
    const selection = selectCityHexBackgroundSprite(pool, type, biome, vector, random, fallbackBiome);

    return {
        obstacleSpriteId: selection.backgroundSpriteId,
        obstacleDevelopmentVector: selection.backgroundDevelopmentVector,
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

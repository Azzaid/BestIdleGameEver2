import type {DevelopmentVectorKey} from "../models/DevlopmentVector.ts";
import {
  CITY_BIOMES,
  CITY_HEX_BACKGROUND_TYPES,
  type CityBiome,
  type CityHexBackgroundSprite,
  type CityHexBackgroundSpritePool,
  type CityHexBackgroundType,
} from "../models/city/hexBackgrounds.ts";

const hexBackgroundImages = import.meta.glob("../assets/hexBackgrounds/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const typeValues = Object.values(CITY_HEX_BACKGROUND_TYPES);
const biomeValues = Object.values(CITY_BIOMES);
const vectorKeys = ["tech", "nature", "medieval", "aether"] as const satisfies readonly DevelopmentVectorKey[];

export const CITY_HEX_BACKGROUND_SPRITES: readonly CityHexBackgroundSprite[] = Object.entries(hexBackgroundImages)
  .flatMap(([path, src]) => {
    const type = getPathPart(path, typeValues);
    const biome = getPathPart(path, biomeValues);
    const vector = getPathPart(path, vectorKeys);
    if (!type || !biome || !vector) return [];

    const fileStem = getFileStem(path);

    return [{
      id: `hexBackgrounds.${type}.${biome}.${vector}.${fileStem}`,
      type,
      biome,
      vector,
      src,
    }];
  })
  .sort((left, right) => left.id.localeCompare(right.id));

export const CITY_HEX_BACKGROUND_SPRITES_BY_ID = Object.fromEntries(
  CITY_HEX_BACKGROUND_SPRITES.map(sprite => [sprite.id, sprite]),
) as Record<string, CityHexBackgroundSprite | undefined>;

export const CITY_HEX_BACKGROUND_SPRITE_POOL: CityHexBackgroundSpritePool = createEmptyPool();

for (const sprite of CITY_HEX_BACKGROUND_SPRITES) {
  CITY_HEX_BACKGROUND_SPRITE_POOL[sprite.type][sprite.biome][sprite.vector].push(sprite);
}

function createEmptyPool(): CityHexBackgroundSpritePool {
  return Object.fromEntries(
    typeValues.map(type => [
      type,
      Object.fromEntries(
        biomeValues.map(biome => [
          biome,
          Object.fromEntries(vectorKeys.map(vector => [vector, []])),
        ]),
      ),
    ]),
  ) as CityHexBackgroundSpritePool;
}

function getPathPart<T extends string>(path: string, values: readonly T[]): T | undefined {
  return values.find(value => path.includes(`/${value}/`));
}

function getFileStem(path: string): string {
  return path.split("/").at(-1)?.replace(/\.png$/i, "") ?? path;
}

export type {CityBiome, CityHexBackgroundType};

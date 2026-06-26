import {CITY_BIOMES, type CityBiome} from "../models/city/hexBackgrounds.ts";

export const SIGNATURE_PER_HEX = 5;

export const FOOTPRINT_PER_DEMOLISHED_HEX = 5;

export const FOOTPRINT_PER_SURVIVED_SIEGE = 1;

export const INITIAL_CITY_CELL_RADIUS = 1;

export const maxCitySize = 8;

export const DEFAULT_INITIAL_CITY_BIOME: CityBiome = CITY_BIOMES.steppe;

export const CITY_HEX_SIZE = Math.sqrt(3) * 32;

export const BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX = 150;

export const BATTLEFIELD_RANGE_MULTIPLIER = 1.35;

export const BATTLE_WALL_APRON_HEIGHT = 80;

export const SIEGE_THREAT_START_RATIO = 0.8;

export const SIEGE_DURATION_SECONDS = 60;

export const SIEGE_WAVE_INTERVAL_SECONDS = 10;

export const PRESSURE_WAVE_INTERVAL_SECONDS = 18;

export const BATTLE_WAVE_THREAT_TO_CITY_THREAT_RATIO = 1;

export const BASE_SIMULTANEOUS_MONSTERS_LIMIT = 40;

export const MAX_TOWER_SLOTS = 5;

export const TOWER_WEIGHT_ROTATION_PENALTY = 0.08;

export const BASE_TOWER_STATS = {
    rotationSpeed: 0,
    shotsPerSecond: 0,
    burstCount: 0,
    projectileDamage: 0,
    projectileSpeed: 0,
    projectileRadius: 0,
    projectileSpread: 0,
    aoeRadius: 0,
    targetingDistanceLimit: 0,
    maximumRange: Infinity,
    minimumRange: 0,
    maximumRotationAngle: Infinity,
    retargetCooldownSeconds: 0,
    triggerTolerance: Math.PI,
    weight: 0,
};

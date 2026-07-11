import {CITY_BIOMES, type CityBiome} from "../models/city/hexBackgrounds.ts";

export const SIGNATURE_PER_HEX = 7;

export const FOOTPRINT_PER_DEMOLISHED_HEX = 5;

export const FOOTPRINT_PER_SURVIVED_SIEGE = 5;

export const INITIAL_CITY_CELL_RADIUS = 1;

export const maxCitySize = 8;

export const DEFAULT_INITIAL_CITY_BIOME: CityBiome = CITY_BIOMES.steppe;

export const CITY_HEX_RADIUS = 64;

export const CITY_HEX_WIDTH = Math.sqrt(3) * CITY_HEX_RADIUS;

export function toPixels(hexDistance: number) {
    return Number.isFinite(hexDistance)
        ? hexDistance * CITY_HEX_RADIUS
        : hexDistance;
}

export const BATTLEFIELD_RANGE_MULTIPLIER = 1.35;

export const BATTLE_WALL_APRON_HEIGHT = 80;

export const SIEGE_THREAT_START_RATIO = 0.8;

export const SIEGE_DURATION_SECONDS = 60;

export const SIEGE_WAVE_INTERVAL_SECONDS = 10;

export const PRESSURE_WAVE_INTERVAL_SECONDS = 18;

export const BATTLE_WAVE_THREAT_TO_CITY_THREAT_RATIO = 1;

export const BASE_SIMULTANEOUS_MONSTERS_LIMIT = 40;

export const MAX_TOWER_SLOTS = 5;

export const TOWER_WEIGHT_ROTATION_PENALTY = 0.2;

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
    zonePushBackDistance: 0,
    zonePushBacksPerSecond: 0,
    zonePushBackZoneSize: 0,
    zoneFleeDuration: 0,
    zoneFleesPerSecond: 0,
    zoneFleeZoneSize: 0,
    zoneCircleDuration: 0,
    zoneCirclesPerSecond: 0,
    zoneCircleZoneSize: 0,
    zoneDotDamage: 0,
    zoneDotTicksPerSecond: 0,
    zoneDotZoneSize: 0,
    zoneStunDuration: 0,
    zoneStunsPerSecond: 0,
    zoneStunZoneSize: 0,
    singleTargetPushBackDistance: 0,
    singleTargetPushBacksPerSecond: 0,
    singleTargetPushBackRange: 0,
    singleTargetFleeDuration: 0,
    singleTargetFleesPerSecond: 0,
    singleTargetFleeRange: 0,
    singleTargetCircleDuration: 0,
    singleTargetCirclesPerSecond: 0,
    singleTargetCircleRange: 0,
    singleTargetDotDamage: 0,
    singleTargetDotTicksPerSecond: 0,
    singleTargetDotRange: 0,
    singleTargetStunDuration: 0,
    singleTargetStunsPerSecond: 0,
    singleTargetStunRange: 0,
    weight: 0,
    maximumWeight: 0,
};

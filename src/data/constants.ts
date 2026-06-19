export const SIGNATURE_PER_HEX = 5;

export const FOOTPRINT_PER_DEMOLISHED_HEX = 5;

export const FOOTPRINT_PER_SURVIVED_SIEGE = 1;

export const INITIAL_CITY_CELL_RADIUS = 1;

export const CITY_HEX_SIZE = Math.sqrt(3) * 32;

export const BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX = 150;

export const BATTLEFIELD_RANGE_MULTIPLIER = 1.35;

export const BATTLE_WALL_APRON_HEIGHT = 80;

export const SIEGE_THREAT_START_RATIO = 0.8;

export const SIEGE_DURATION_SECONDS = 150;

export const SIEGE_WAVE_INTERVAL_SECONDS = 10;

export const PRESSURE_WAVE_INTERVAL_SECONDS = 18;

export const BATTLE_WAVE_THREAT_TO_CITY_THREAT_RATIO = 1;

export const MAX_TOWER_SLOTS = 5;

export const TOWER_WEIGHT_ROTATION_PENALTY = 0.08;

export const BASE_TOWER_STATS = {
    rotationSpeed: 2.5,
    reloadSpeed: 1.0,
    burstCount: 1,
    projectileDamage: 10,
    projectileSpeed: 500,
    projectileRadius: 3,
    projectileSpread: 0.06,
    aoeRadius: 0,
    targetingDistanceLimit: 360,
    retargetCooldownSeconds: 0.25,
    triggerTolerance: Math.PI,
    weight: 0,
};

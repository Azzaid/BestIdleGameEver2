import {UPKEEP_TYPES, type UpkeepAmount} from "../Upkeep.ts";
import {
    AETHER_ATMOSPHERES,
    EMPTY_AETHER_ATMOSPHERE_TOTALS,
    MAX_AETHER_ATMOSPHERE_LEVEL,
    MIN_AETHER_ATMOSPHERE_LEVEL,
    type AetherAtmosphere,
    type AetherAtmosphereLevel,
    type AetherAtmosphereLevels,
    type AetherAtmosphereResolution,
    type AetherAtmosphereTotals,
} from "./AetherAtmosphere.ts";

const AETHER_RESOURCE_BY_ATMOSPHERE = {
    veil: UPKEEP_TYPES.veil,
    manaFlows: UPKEEP_TYPES.manaFlows,
    death: UPKEEP_TYPES.death,
} as const satisfies Record<AetherAtmosphere, typeof UPKEEP_TYPES[keyof typeof UPKEEP_TYPES]>;

export function resolveAetherAtmosphere(
    providedResources: UpkeepAmount,
    cityHexCount: number,
): AetherAtmosphereResolution {
    const divisor = Math.max(1, cityHexCount);
    const totals = createEmptyAetherAtmosphereTotals();

    for (const atmosphere of AETHER_ATMOSPHERES) {
        totals[atmosphere] = providedResources[AETHER_RESOURCE_BY_ATMOSPHERE[atmosphere]] ?? 0;
    }

    const concentrations = createEmptyAetherAtmosphereTotals();
    const rawLevels = createEmptyAetherAtmosphereTotals();
    const levels: AetherAtmosphereLevels = {
        veil: MIN_AETHER_ATMOSPHERE_LEVEL,
        manaFlows: MIN_AETHER_ATMOSPHERE_LEVEL,
        death: MIN_AETHER_ATMOSPHERE_LEVEL,
    };

    for (const atmosphere of AETHER_ATMOSPHERES) {
        concentrations[atmosphere] = totals[atmosphere] / divisor;
        rawLevels[atmosphere] = Math.floor(concentrations[atmosphere]);
        levels[atmosphere] = clampAetherAtmosphereLevel(rawLevels[atmosphere]);
    }

    return {
        cityHexCount: divisor,
        totals,
        concentrations,
        rawLevels,
        levels,
    };
}

export function getAetherAtmosphereResource(atmosphere: AetherAtmosphere) {
    return AETHER_RESOURCE_BY_ATMOSPHERE[atmosphere];
}

function createEmptyAetherAtmosphereTotals(): AetherAtmosphereTotals {
    return {...EMPTY_AETHER_ATMOSPHERE_TOTALS};
}

function clampAetherAtmosphereLevel(value: number): AetherAtmosphereLevel {
    if (value >= MAX_AETHER_ATMOSPHERE_LEVEL) return MAX_AETHER_ATMOSPHERE_LEVEL;
    if (value <= MIN_AETHER_ATMOSPHERE_LEVEL) return MIN_AETHER_ATMOSPHERE_LEVEL;
    return value as AetherAtmosphereLevel;
}

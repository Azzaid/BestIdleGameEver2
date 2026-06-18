import {
    AETHER_ATMOSPHERES,
    EMPTY_AETHER_ATMOSPHERE_TOTALS,
    MAX_AETHER_ATMOSPHERE_LEVEL,
    MIN_AETHER_ATMOSPHERE_LEVEL,
    type AetherAtmosphereLevel,
    type AetherAtmosphereLevels,
    type AetherAtmosphereResolution,
    type AetherAtmosphereTotals,
} from "./AetherAtmosphere.ts";

export function resolveAetherAtmosphereFromTotals(
    totals: AetherAtmosphereTotals,
    cityHexCount: number,
): AetherAtmosphereResolution {
    const divisor = Math.max(1, cityHexCount);
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

function createEmptyAetherAtmosphereTotals(): AetherAtmosphereTotals {
    return {...EMPTY_AETHER_ATMOSPHERE_TOTALS};
}

function clampAetherAtmosphereLevel(value: number): AetherAtmosphereLevel {
    if (value >= MAX_AETHER_ATMOSPHERE_LEVEL) return MAX_AETHER_ATMOSPHERE_LEVEL;
    if (value <= MIN_AETHER_ATMOSPHERE_LEVEL) return MIN_AETHER_ATMOSPHERE_LEVEL;
    return value as AetherAtmosphereLevel;
}

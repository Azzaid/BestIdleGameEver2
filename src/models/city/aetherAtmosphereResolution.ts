import type {HexCell} from "./HexGrid.ts";
import type {PlacedCityMap} from "./Adjancency.ts";
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

export function resolveAetherAtmosphere(
    hexes: HexCell[],
    city: PlacedCityMap,
): AetherAtmosphereResolution {
    const cityHexCount = Math.max(1, hexes.filter(hex => hex.kind === "city").length);
    const totals = createEmptyAetherAtmosphereTotals();

    city.forEach(building => {
        const influence = building.aetherAtmosphereInfluence;
        if (!influence) return;

        for (const atmosphere of AETHER_ATMOSPHERES) {
            totals[atmosphere] += influence[atmosphere] ?? 0;
        }
    });

    const rawLevels = createEmptyAetherAtmosphereTotals();
    const levels: AetherAtmosphereLevels = {
        veil: MIN_AETHER_ATMOSPHERE_LEVEL,
        manaFlows: MIN_AETHER_ATMOSPHERE_LEVEL,
        death: MIN_AETHER_ATMOSPHERE_LEVEL,
    };

    for (const atmosphere of AETHER_ATMOSPHERES) {
        rawLevels[atmosphere] = Math.floor(totals[atmosphere] / cityHexCount);
        levels[atmosphere] = clampAetherAtmosphereLevel(rawLevels[atmosphere]);
    }

    return {
        cityHexCount,
        totals,
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

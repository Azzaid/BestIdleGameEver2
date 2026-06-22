// What we resolve per hex
import type {UpkeepAmount} from "../../../../models/Upkeep.ts";
import type {
    CityResolution,
    PlacedCityMap,
} from "../../../../models/city/Adjancency.ts";
import type {HexCell} from "../../../../models/city/HexGrid.ts";
import type {Building, PlacedBuilding} from "../../../../models/city/Building.ts";
import {deductUpkeep} from "./upkeepUtils.ts";
import {BUILDINGS_ATLAS} from "../../../../data/buildings";
import {WALL_SEGMENT_BUILDINGS} from "../../../../data/wallSegments/index.ts";
import {WALL_TOWER_BUILDINGS} from "../../../../data/wallSuperstructures/index.ts";
import {SIGNATURE_PER_HEX} from "../../../../data/constants.ts";
import {deepClone} from "../../../../utils/deepClone.ts";
import {
    homogeneousValueTotalsToUpkeepAmount,
} from "../../../../models/homogeneousValueAdapters.ts";
import {
    getAvailableValues,
    getProducedValues,
    getUpkeepValues,
    resolveHomogeneousValueContributions,
    resolveCity
} from "../../../../models/homogeneousValueResolution.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../../../data/homogeneousValues/index.ts";
import type {HomogeneousValueEntitySource} from "../../../../models/homogeneousValueResolution.ts";

/**
 * Main resolver:
 * - Takes hexes with optional buildings.
 * - Emits adjacency effects per rule.
 * - Aggregates and applies in a deterministic order.
 */
export const placeCityBuildings = (
    hexes: HexCell[]
): PlacedCityMap => {
    // 1) Base pass
    const placedCity = new Map<string, PlacedBuilding>();

    hexes.forEach((hexCell: HexCell) => {
        const { column, row, cellKey, buildingKey, developmentVector } = hexCell;
        if (hexCell.partOfStructureId && (hexCell.structureCoreCellKey ?? cellKey) !== cellKey) return;

        const building:Building | undefined = buildingKey ? BUILDINGS_ATLAS[developmentVector][buildingKey] : undefined;
        const placed: PlacedBuilding | undefined = building ? {
            ...deepClone(building),
            column,
            row,
            effectiveProvidedUpkeep: {},
            effectiveRequiredUpkeep: {},
            effectiveSignature: 0,
            effectiveHomogeneousValueEffects: [...(building.values ?? [])]
        } : undefined;
        if (placed) placedCity.set(cellKey, placed);
    })

    // 2) Resolve direct building values. Homogeneous effects are applied later by resolveCity.
    placedCity.forEach((building) => {
        building.effectiveHomogeneousValueEffects = [...(building.values ?? [])];

        const resolvedBuildingValues = resolveHomogeneousValueContributions(building.effectiveHomogeneousValueEffects);
        building.effectiveProvidedUpkeep = homogeneousValueTotalsToUpkeepAmount(getProducedValues(resolvedBuildingValues));
        building.effectiveRequiredUpkeep = homogeneousValueTotalsToUpkeepAmount(getUpkeepValues(resolvedBuildingValues));
        building.effectiveSignature = getProducedValues(resolvedBuildingValues)[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0;
    })

    return placedCity
}

export function resolveCityUpkeepAndSignature(
    hexes: HexCell[],
    city: PlacedCityMap,
    cityFootprint = 0,
): CityResolution {
    const resolvedCity: CityResolution = {
        buildingIds: new Set<string>(),
        buildingKeywords: new Set<string>(),
        requiredUpkeep: {} as UpkeepAmount,
        providedUpkeep: {} as UpkeepAmount,
        effectiveUpkeep: {} as UpkeepAmount,
        homogeneousValues: {},
        homogeneousResolvedValues: {},
        values: {},
        resolvedHexes: [],
        resolvedTowers: [],
        resolvedWallSegments: [],
        resolvedTechnologies: [],
        producedHomogeneousValues: {},
        upkeepHomogeneousValues: {},
        buildingsSignature: 0,
        territorySignature: 0,
        cityFootprint,
        effectiveSignature: 0,
    };

    resolvedCity.territorySignature = hexes.length * SIGNATURE_PER_HEX;
    const buildingEntities: HomogeneousValueEntitySource[] = [...city.values()].map((building) => ({
            id: `${building.column}:${building.row}`,
            contentId: building.id,
            entityType: "building",
            cellKey: `${building.column}:${building.row}`,
            column: building.column,
            row: building.row,
            keywords: building.keywords,
            values: building.effectiveHomogeneousValueEffects,
            effects: building.effects,
        }));
    const wallEntities: HomogeneousValueEntitySource[] = hexes.flatMap((hexCell) => {
        if (hexCell.kind !== "wall") return [];

        return [
            {wallBuildingKey: hexCell.wallKey, entityType: "wallSegment" as const},
            {wallBuildingKey: hexCell.wallTopKey, entityType: "wallSuperstructure" as const},
        ].flatMap(({wallBuildingKey, entityType}) => {
            if (!wallBuildingKey) return [];

            const wallBuilding = entityType === "wallSegment"
                ? WALL_SEGMENT_BUILDINGS[wallBuildingKey]
                : WALL_TOWER_BUILDINGS[wallBuildingKey];
            if (!wallBuilding) return [];

            return [{
                id: `${hexCell.cellKey}:${wallBuilding.id}`,
                entityType,
                cellKey: hexCell.cellKey,
                column: hexCell.column,
                row: hexCell.row,
                keywords: [String(wallBuilding.type), ...(wallBuilding.keywords ?? [])],
                values: wallBuilding.values ?? [],
                effects: wallBuilding.effects,
            }];
        });
    });
    const cityEntities = [...buildingEntities, ...wallEntities];
    const homogeneousCityResolution = resolveCity(cityEntities);

    resolvedCity.buildingIds = homogeneousCityResolution.buildingIds;
    resolvedCity.buildingKeywords = homogeneousCityResolution.buildingKeywords;
    resolvedCity.values = homogeneousCityResolution.values;
    resolvedCity.resolvedHexes = homogeneousCityResolution.resolvedHexes;
    resolvedCity.resolvedTowers = homogeneousCityResolution.resolvedTowers;
    resolvedCity.resolvedWallSegments = homogeneousCityResolution.resolvedWallSegments;
    resolvedCity.resolvedTechnologies = homogeneousCityResolution.resolvedTechnologies;
    resolvedCity.homogeneousResolvedValues = homogeneousCityResolution.resolvedValues;
    resolvedCity.homogeneousValues = getAvailableValues(resolvedCity.homogeneousResolvedValues);
    resolvedCity.producedHomogeneousValues = getProducedValues(resolvedCity.homogeneousResolvedValues);
    resolvedCity.upkeepHomogeneousValues = getUpkeepValues(resolvedCity.homogeneousResolvedValues);
    resolvedCity.providedUpkeep = homogeneousValueTotalsToUpkeepAmount(resolvedCity.producedHomogeneousValues);
    resolvedCity.requiredUpkeep = homogeneousValueTotalsToUpkeepAmount(resolvedCity.upkeepHomogeneousValues);
    resolvedCity.buildingsSignature = resolvedCity.producedHomogeneousValues[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0;

    resolvedCity.effectiveUpkeep = deductUpkeep(resolvedCity.providedUpkeep, resolvedCity.requiredUpkeep);
    resolvedCity.effectiveSignature = resolvedCity.buildingsSignature + resolvedCity.territorySignature + resolvedCity.cityFootprint;

    return resolvedCity
}


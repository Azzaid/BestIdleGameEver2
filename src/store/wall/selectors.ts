import {createSelector} from "@reduxjs/toolkit";
import {ALL_WALL_BUILDINGS} from "../../data/wall/index.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {selectCityHexes} from "../city/selectors.ts";
import type {WallBuilding, WallResolution} from "../../models/city/Wall.ts";
import {addUpkeep} from "../../pages/City/Components/CityHex/upkeepUtils.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import {getAvailableValues, resolvePlacedHomogeneousValueContributions} from "../../models/homogeneousValueResolution.ts";
import {wallStatsToHomogeneousValueEffects} from "../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";

export const selectUnlockedWallBuildingIds = (state: RootState) => state.wall.unlockedWallBuildingIds;

export const selectUnlockedWallBuildings = createSelector(
    [selectUnlockedWallBuildingIds],
    (ids): WallBuilding[] => ids.flatMap((id) => ALL_WALL_BUILDINGS[id] ? [ALL_WALL_BUILDINGS[id]] : [])
);

export const selectWallResolution = createSelector(
    [selectCityHexes],
    (hexes): WallResolution => {
        const resolution: WallResolution = {
            requiredUpkeep: {},
            resilience: 0,
            camoLevel: 0,
            ignoredThreat: 0,
            homogeneousValues: {},
            homogeneousResolvedValues: {},
            specialEffects: [],
        };
        const wallValueSources: Array<{
            cellKey: string;
            column: number;
            row: number;
            keywords: readonly string[];
            effects: NonNullable<WallBuilding["homogeneousValueEffects"]>;
            adjacency: WallBuilding["homogeneousAdjacency"];
        }> = [];

        hexes.forEach((hex) => {
            if (hex.kind !== "wall") return;

            [hex.wallKey, hex.wallTopKey].forEach((wallBuildingKey) => {
                if (!wallBuildingKey) return;

                const wallBuilding = ALL_WALL_BUILDINGS[wallBuildingKey];
                if (!wallBuilding) return;

                resolution.requiredUpkeep = addUpkeep(resolution.requiredUpkeep, wallBuilding.requiredUpkeep);
                resolution.camoLevel += wallBuilding.camoLevel;
                resolution.specialEffects.push(...wallBuilding.specialEffects);
                wallValueSources.push({
                    cellKey: `${hex.cellKey}:${wallBuilding.id}`,
                    column: hex.column,
                    row: hex.row,
                    keywords: wallBuilding.keywords ?? [],
                    effects: [
                        ...wallStatsToHomogeneousValueEffects({
                            resilience: wallBuilding.resilience,
                            threatSuppression: wallBuilding.ignoredThreat,
                        }),
                        ...(wallBuilding.homogeneousValueEffects ?? []),
                    ],
                    adjacency: wallBuilding.homogeneousAdjacency,
                });
            });
        });
        resolution.homogeneousResolvedValues = resolvePlacedHomogeneousValueContributions(
            wallValueSources,
            (source, radius) => wallValueSources.filter((candidate) => {
                if (candidate.cellKey === source.cellKey) return false;

                const columnDistance = Math.abs(candidate.column - source.column);
                const rowDistance = Math.abs(candidate.row - source.row);
                const diagonalDistance = Math.abs(
                    candidate.column + candidate.row - source.column - source.row,
                );

                return Math.max(columnDistance, rowDistance, diagonalDistance) <= radius;
            }),
        );
        resolution.homogeneousValues = getAvailableValues(resolution.homogeneousResolvedValues);
        resolution.resilience = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallResilience] ?? 0;
        resolution.ignoredThreat = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallThreatSuppression] ?? 0;

        return resolution;
    }
);

export const selectWallResilience = createSelector(
    [selectWallResolution],
    (resolution): number => resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallResilience] ?? 0,
);

export const selectWallThreatSuppression = createSelector(
    [selectWallResolution],
    (resolution): number => resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallThreatSuppression] ?? 0,
);

export const selectBuiltTowerPlatformCount = createSelector(
    [selectCityHexes],
    (hexes): number => hexes.filter((hex) => {
        if (hex.kind !== "wall" || !hex.wallTopKey) return false;

        return ALL_WALL_BUILDINGS[hex.wallTopKey]?.type === BUILDING_TYPES.towerBase;
    }).length
);

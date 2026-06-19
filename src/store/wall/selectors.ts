import {createSelector} from "@reduxjs/toolkit";
import {ALL_WALL_BUILDINGS} from "../../data/wall/index.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {selectCityHexes} from "../city/selectors.ts";
import type {WallBuilding, WallResolution} from "../../models/city/Wall.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import {getUpkeepValues, resolveCity} from "../../models/homogeneousValueResolution.ts";
import {homogeneousValueTotalsToUpkeepAmount} from "../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import type {HomogeneousCityEntityType, HomogeneousValueEntitySource} from "../../models/homogeneousValueResolution.ts";

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
        const wallEntities: HomogeneousValueEntitySource[] = [];

        hexes.forEach((hex) => {
            if (hex.kind !== "wall") return;

            [
                {key: hex.wallKey, entityType: "wallSegment" as const},
                {key: hex.wallTopKey, entityType: "wallSuperstructure" as const},
            ].forEach(({key: wallBuildingKey, entityType}: {
                key?: string | null;
                entityType: HomogeneousCityEntityType;
            }) => {
                if (!wallBuildingKey) return;

                const wallBuilding = ALL_WALL_BUILDINGS[wallBuildingKey];
                if (!wallBuilding) return;

                resolution.specialEffects.push(...wallBuilding.specialEffects);
                wallEntities.push({
                    id: `${hex.cellKey}:${wallBuilding.id}`,
                    entityType,
                    cellKey: hex.cellKey,
                    column: hex.column,
                    row: hex.row,
                    keywords: [String(wallBuilding.type), ...(wallBuilding.keywords ?? [])],
                    contributions: wallBuilding.homogeneousValueEffects ?? [],
                    modifiers: wallBuilding.homogeneousAdjacency,
                });
            });
        });
        const resolvedWallCity = resolveCity(wallEntities);
        resolution.homogeneousResolvedValues = resolvedWallCity.resolvedValues;
        resolution.homogeneousValues = resolvedWallCity.values;
        resolution.requiredUpkeep = homogeneousValueTotalsToUpkeepAmount(getUpkeepValues(resolution.homogeneousResolvedValues));
        resolution.resilience = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallResilience] ?? 0;
        resolution.camoLevel = Math.max(0, -(resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.cityVisibility] ?? 0));
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

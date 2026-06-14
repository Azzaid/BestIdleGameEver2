import {createSelector} from "@reduxjs/toolkit";
import {ALL_WALL_BUILDINGS} from "../../data/wall/index.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {selectCityHexes} from "../city/selectors.ts";
import type {WallBuilding, WallResolution} from "../../models/city/Wall.ts";
import {addUpkeep} from "../../pages/City/Components/CityHex/upkeepUtils.ts";

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
            specialEffects: [],
        };

        hexes.forEach((hex) => {
            if (hex.kind !== "wall") return;

            [hex.wallKey, hex.wallTopKey].forEach((wallBuildingKey) => {
                if (!wallBuildingKey) return;

                const wallBuilding = ALL_WALL_BUILDINGS[wallBuildingKey];
                if (!wallBuilding) return;

                resolution.requiredUpkeep = addUpkeep(resolution.requiredUpkeep, wallBuilding.requiredUpkeep);
                resolution.resilience += wallBuilding.resilience;
                resolution.camoLevel += wallBuilding.camoLevel;
                resolution.ignoredThreat += wallBuilding.ignoredThreat;
                resolution.specialEffects.push(...wallBuilding.specialEffects);
            });
        });

        return resolution;
    }
);

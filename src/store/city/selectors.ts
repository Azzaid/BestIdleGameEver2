import type {RootState} from "../../models/store/appStore.ts";
import {createSelector} from "@reduxjs/toolkit";
import {placeCityBuildings} from "../../pages/City/Components/CityHex/adjacencyUtils.ts";
import {STRUCTURES, STRUCTURES_BY_ID} from "../../data/structures/index.ts";
import {detectMultistructures} from "../../models/city/multistructureDetection.ts";
import {resolveAetherAtmosphere} from "../../models/city/aetherAtmosphereResolution.ts";

export const selectCityHexes = (state: RootState) => state.city.hexes;

export const selectCityCellRadius = (state: RootState) => state.city.cellRadius;

export const selectCityScarTrace = (state: RootState) => state.city.scarTrace;

export const selectCityBattlefield = (state: RootState) => state.city.battlefield;

export const selectCitySideHexes = createSelector(
    [selectCityCellRadius],
    (cellRadius) => cellRadius + 1
);

export const selectCityBuildings = createSelector(
    [selectCityHexes],
    (hexes) => placeCityBuildings(hexes)
);

export const selectCityStructureCandidates = createSelector(
    [selectCityHexes],
    (hexes) => detectMultistructures(hexes, STRUCTURES)
);

export const selectCompleteCityStructureIds = createSelector(
    [selectCityHexes],
    (hexes) => {
        const builtIds = new Set<string>();
        hexes.forEach(h => {
            if (h.kind !== "city" || !h.buildingKey) return;
            if ((STRUCTURES_BY_ID as Record<string, unknown>)[h.buildingKey]) {
                builtIds.add(h.buildingKey);
            }
        });
        return builtIds;
    }
);

export const selectCityAetherAtmosphere = createSelector(
    [selectCityHexes, selectCityBuildings],
    (hexes, buildings) => resolveAetherAtmosphere(hexes, buildings)
);

export const selectCityAetherAtmosphereLevels = createSelector(
    [selectCityAetherAtmosphere],
    (atmosphere) => atmosphere.levels
);

import type {RootState} from "../../models/store/appStore.ts";
import {createSelector} from "@reduxjs/toolkit";
import {placeCityBuildings} from "../../pages/City/Components/CityHex/adjacencyUtils.ts";
import {STRUCTURES} from "../../data/structures/index.ts";
import {detectMultistructures, getCompleteStructureIds} from "../../models/city/multistructureDetection.ts";
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
    (hexes) => getCompleteStructureIds(hexes, STRUCTURES)
);

export const selectCityAetherAtmosphere = createSelector(
    [selectCityHexes, selectCityBuildings],
    (hexes, buildings) => resolveAetherAtmosphere(hexes, buildings)
);

export const selectCityAetherAtmosphereLevels = createSelector(
    [selectCityAetherAtmosphere],
    (atmosphere) => atmosphere.levels
);

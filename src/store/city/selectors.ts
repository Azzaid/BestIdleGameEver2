import type {RootState} from "../../models/store/appStore.ts";
import {createSelector} from "@reduxjs/toolkit";
import {placeCityBuildings} from "../../pages/City/Components/CityHex/adjacencyUtils.ts";

export const selectCityHexes = (state: RootState) => state.city.hexes;

export const selectCityCellRadius = (state: RootState) => state.city.cellRadius;

export const selectCitySideHexes = createSelector(
    [selectCityCellRadius],
    (cellRadius) => cellRadius + 1
);

export const selectCityBuildings = createSelector(
    [selectCityHexes],
    (hexes) => placeCityBuildings(hexes)
);

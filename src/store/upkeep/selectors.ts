import {createSelector} from "@reduxjs/toolkit";
import {selectCityBuildings, selectCityHexes} from "../city/selectors.ts";
import type {RootState} from "../index.ts";
import {resolveCityUpkeepAndTrace} from "../../pages/City/Components/CityHex/adjacencyUtils.ts";
import type {CityResolution} from "../../models/city/Adjancency.ts";

export const selectCityResolution = createSelector(
    [selectCityHexes, selectCityBuildings],
    (hexes, buildings): CityResolution => resolveCityUpkeepAndTrace(hexes, buildings)
);

export const selectResilience = (state: RootState): number => state.upkeep.resilience;
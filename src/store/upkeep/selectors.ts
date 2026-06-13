import {createSelector} from "@reduxjs/toolkit";
import {selectCityBuildings, selectCityHexes} from "../city/selectors.ts";
import type {RootState} from "../index.ts";
import {resolveCityUpkeepAndTrace} from "../../pages/City/Components/CityHex/adjacencyUtils.ts";
import type {CityResolution} from "../../models/city/Adjancency.ts";
import {selectResolvedActiveTower} from "../towers/selectors.ts";
import {deductUpkeep} from "../../pages/City/Components/CityHex/upkeepUtils.ts";

export const selectCityResolution = createSelector(
    [selectCityHexes, selectCityBuildings],
    (hexes, buildings): CityResolution => resolveCityUpkeepAndTrace(hexes, buildings)
);

export const selectTowerAwareCityResolution = createSelector(
    [selectCityResolution, selectResolvedActiveTower],
    (cityResolution, resolvedTower): CityResolution => ({
        ...cityResolution,
        effectiveUpkeep: deductUpkeep(cityResolution.effectiveUpkeep, resolvedTower.supportCost),
    })
);

export const selectResilience = (state: RootState): number => state.upkeep.resilience;

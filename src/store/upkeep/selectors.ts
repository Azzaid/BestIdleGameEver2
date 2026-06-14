import {createSelector} from "@reduxjs/toolkit";
import {selectCityBuildings, selectCityHexes} from "../city/selectors.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {resolveCityUpkeepAndTrace} from "../../pages/City/Components/CityHex/adjacencyUtils.ts";
import type {CityResolution} from "../../models/city/Adjancency.ts";
import {selectResolvedActiveTower} from "../towers/selectors.ts";
import {deductUpkeep} from "../../pages/City/Components/CityHex/upkeepUtils.ts";
import type {CityTraceStatus} from "../../models/store/upkeep.ts";

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

export const selectBaseResilience = (state: RootState): number => state.upkeep.resilience;

export const selectResilience = selectBaseResilience;

export const selectCityTraceStatus = createSelector(
    [selectTowerAwareCityResolution, selectResilience],
    (cityResolution, resilience): CityTraceStatus => {
        const displayedTrace = Math.min(cityResolution.effectiveTrace, Math.max(0, resilience));
        const fillRatio = resilience > 0
            ? displayedTrace / resilience
            : cityResolution.effectiveTrace > 0 ? 1 : 0;
        const isBesieged = cityResolution.effectiveTrace > resilience;

        return {
            effectiveTrace: cityResolution.effectiveTrace,
            resilience,
            displayedTrace,
            fillRatio,
            stage: isBesieged ? "besieged" : "stable",
            isBesieged,
        };
    }
);

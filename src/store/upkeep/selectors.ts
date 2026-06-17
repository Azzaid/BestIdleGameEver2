import {createSelector} from "@reduxjs/toolkit";
import {selectCityBuildings, selectCityHexes, selectCityScarTrace} from "../city/selectors.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {resolveCityUpkeepAndTrace} from "../../pages/City/Components/CityHex/adjacencyUtils.ts";
import type {CityResolution} from "../../models/city/Adjancency.ts";
import {selectResolvedAvailableTowers} from "../towers/selectors.ts";
import {deductUpkeep} from "../../pages/City/Components/CityHex/upkeepUtils.ts";
import type {CityTraceStatus} from "../../models/store/upkeep.ts";
import {selectIsDebugModeEnabled} from "../debug/selectors.ts";

export const selectCityResolution = createSelector(
    [selectCityHexes, selectCityBuildings, selectCityScarTrace],
    (hexes, buildings, scarTrace): CityResolution => resolveCityUpkeepAndTrace(hexes, buildings, scarTrace)
);

export const selectTowerAwareCityResolution = createSelector(
    [selectCityResolution, selectResolvedAvailableTowers],
    (cityResolution, resolvedTowers): CityResolution => {
        const towerSupportCost = resolvedTowers.reduce(
            (total, {resolved}) => deductUpkeep(total, resolved.supportCost),
            cityResolution.effectiveUpkeep
        );

        return {
            ...cityResolution,
            effectiveUpkeep: towerSupportCost,
        };
    }
);

export const selectBaseResilience = (state: RootState): number => state.upkeep.resilience;

export const selectResilience = selectBaseResilience;

export const selectCityTraceStatus = createSelector(
    [selectTowerAwareCityResolution, selectResilience, selectIsDebugModeEnabled],
    (cityResolution, resilience, isDebugModeEnabled): CityTraceStatus => {
        const displayedTrace = Math.min(cityResolution.effectiveTrace, Math.max(0, resilience));
        const fillRatio = resilience > 0
            ? displayedTrace / resilience
            : cityResolution.effectiveTrace > 0 ? 1 : 0;
        const displayedScarTrace = Math.min(cityResolution.scarTrace, displayedTrace);
        const scarFillRatio = resilience > 0
            ? displayedScarTrace / resilience
            : cityResolution.scarTrace > 0 ? 1 : 0;
        const activeFillRatio = Math.max(0, fillRatio - scarFillRatio);
        const isBesieged = !isDebugModeEnabled && cityResolution.effectiveTrace > resilience;

        return {
            effectiveTrace: cityResolution.effectiveTrace,
            scarTrace: cityResolution.scarTrace,
            resilience,
            displayedTrace,
            fillRatio,
            scarFillRatio,
            activeFillRatio,
            stage: isBesieged ? "besieged" : "stable",
            isBesieged,
        };
    }
);

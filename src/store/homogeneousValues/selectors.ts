import {createSelector} from "@reduxjs/toolkit";
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import {createInitialHomogeneousValueTotals} from "../../models/homogeneousValueResolution.ts";
import type {HomogeneousValueId, HomogeneousValueTotals} from "../../models/homogeneousValues.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {selectCityResolution} from "../upkeep/selectors.ts";
import {selectWallResolution} from "../wall/selectors.ts";

export const selectHomogeneousValueTotals = createSelector(
    [selectCityResolution, selectWallResolution, (state: RootState) => state.upkeep.resilience],
    (cityResolution, wallResolution, controlledTerritory): HomogeneousValueTotals => {
        const initialTotals = createInitialHomogeneousValueTotals();
        const totals = {...initialTotals};

        for (const valueId of Object.keys(totals)) {
            totals[valueId] += (cityResolution.homogeneousValues[valueId] ?? initialTotals[valueId] ?? 0) - (initialTotals[valueId] ?? 0);
            totals[valueId] += (wallResolution.homogeneousValues[valueId] ?? initialTotals[valueId] ?? 0) - (initialTotals[valueId] ?? 0);
        }

        totals[HOMOGENEOUS_VALUE_IDS.cityControlledTerritory] = controlledTerritory;

        return totals;
    },
);

export const selectHomogeneousValue = createSelector(
    [
        selectHomogeneousValueTotals,
        (_state: RootState, valueId: HomogeneousValueId) => valueId,
    ],
    (totals, valueId): number => totals[valueId] ?? 0,
);

export const selectCityVisibility = createSelector(
    [selectCityResolution],
    (cityResolution): number => cityResolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.cityVisibility] ?? 0,
);

export const selectControlledTerritory = createSelector(
    [(state: RootState) => state.upkeep.resilience],
    (controlledTerritory): number => controlledTerritory,
);

export const selectControlledTerritoryGrowthStep = createSelector(
    [selectHomogeneousValueTotals],
    (totals): number => totals[HOMOGENEOUS_VALUE_IDS.cityControlledTerritoryGrowthStep] ?? 1.2,
);

export const selectMonsterModifierValues = createSelector(
    [selectHomogeneousValueTotals],
    (totals) => ({
        hpFlat: totals[HOMOGENEOUS_VALUE_IDS.monsterHpFlat] ?? 0,
        hpMultiplier: totals[HOMOGENEOUS_VALUE_IDS.monsterHpMultiplier] ?? 1,
        speedFlat: totals[HOMOGENEOUS_VALUE_IDS.monsterSpeedFlat] ?? 0,
        speedMultiplier: totals[HOMOGENEOUS_VALUE_IDS.monsterSpeedMultiplier] ?? 1,
        threatDistanceFlat: totals[HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceFlat] ?? 0,
        threatDistanceMultiplier: totals[HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceMultiplier] ?? 1,
        regenAmountFlat: totals[HOMOGENEOUS_VALUE_IDS.monsterRegenAmountFlat] ?? 0,
        regenAmountMultiplier: totals[HOMOGENEOUS_VALUE_IDS.monsterRegenAmountMultiplier] ?? 1,
        regenSpeedFlat: totals[HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedFlat] ?? 0,
        regenSpeedMultiplier: totals[HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedMultiplier] ?? 1,
    }),
);

export const selectSiegeModifierValues = createSelector(
    [selectHomogeneousValueTotals],
    (totals) => ({
        threatFlat: totals[HOMOGENEOUS_VALUE_IDS.siegeThreatFlat] ?? 0,
        threatMultiplier: totals[HOMOGENEOUS_VALUE_IDS.siegeThreatMultiplier] ?? 1,
        lengthFlat: totals[HOMOGENEOUS_VALUE_IDS.siegeLengthFlat] ?? 0,
        lengthMultiplier: totals[HOMOGENEOUS_VALUE_IDS.siegeLengthMultiplier] ?? 1,
        simultaneousMonstersLimitFlat: totals[HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitFlat] ?? 0,
        simultaneousMonstersLimitMultiplier: totals[HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitMultiplier] ?? 1,
    }),
);

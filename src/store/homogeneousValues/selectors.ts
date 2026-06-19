import {createSelector} from "@reduxjs/toolkit";
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import {resolveAetherAtmosphereFromTotals} from "../../models/city/aetherAtmosphereResolution.ts";
import {createInitialHomogeneousValueTotals} from "../../models/homogeneousValueResolution.ts";
import type {HomogeneousValueId, HomogeneousValueTotals} from "../../models/homogeneousValues.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {selectCityHexes} from "../city/selectors.ts";
import {selectTowerAwareCityResolution} from "../upkeep/selectors.ts";

const emptyResolvedValue = {
    producedValue: 0,
    upkeepValue: 0,
    availableValue: 0,
    unlockRequiredValue: 0,
    unlockSatisfied: true,
};

export const selectHomogeneousValueTotals = createSelector(
    [selectTowerAwareCityResolution, (state: RootState) => state.upkeep.controlledTerritory],
    (cityResolution, controlledTerritory): HomogeneousValueTotals => {
        const initialTotals = createInitialHomogeneousValueTotals();
        const totals = {...initialTotals};

        for (const valueId of Object.keys(totals)) {
            totals[valueId] += (cityResolution.homogeneousValues[valueId] ?? initialTotals[valueId] ?? 0) - (initialTotals[valueId] ?? 0);
        }

        totals[HOMOGENEOUS_VALUE_IDS.citySignature] = cityResolution.effectiveSignature;
        totals[HOMOGENEOUS_VALUE_IDS.cityControlledTerritory] = controlledTerritory;
        totals[HOMOGENEOUS_VALUE_IDS.cityFootprint] = cityResolution.cityFootprint;

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

export const selectCitySignature = createSelector(
    [selectTowerAwareCityResolution],
    (cityResolution): number => cityResolution.effectiveSignature,
);

export const selectCityResolvedProducedValue = createSelector(
    [
        selectTowerAwareCityResolution,
        (_state: RootState, valueId: HomogeneousValueId) => valueId,
    ],
    (cityResolution, valueId): number => (
        cityResolution.homogeneousResolvedValues[valueId] ?? emptyResolvedValue
    ).producedValue,
);

export const selectCityResolvedUpkeepValue = createSelector(
    [
        selectTowerAwareCityResolution,
        (_state: RootState, valueId: HomogeneousValueId) => valueId,
    ],
    (cityResolution, valueId): number => (
        cityResolution.homogeneousResolvedValues[valueId] ?? emptyResolvedValue
    ).upkeepValue,
);

export const selectCityResolvedAvailableValue = createSelector(
    [
        selectTowerAwareCityResolution,
        (_state: RootState, valueId: HomogeneousValueId) => valueId,
    ],
    (cityResolution, valueId): number => (
        cityResolution.homogeneousResolvedValues[valueId] ?? emptyResolvedValue
    ).availableValue,
);

export const selectCityResolvedUnlockRequiredValue = createSelector(
    [
        selectTowerAwareCityResolution,
        (_state: RootState, valueId: HomogeneousValueId) => valueId,
    ],
    (cityResolution, valueId): number => (
        cityResolution.homogeneousResolvedValues[valueId] ?? emptyResolvedValue
    ).unlockRequiredValue,
);

export const selectCityResolvedIsUnlockSatisfied = createSelector(
    [
        selectTowerAwareCityResolution,
        (_state: RootState, valueId: HomogeneousValueId) => valueId,
    ],
    (cityResolution, valueId): boolean => (
        cityResolution.homogeneousResolvedValues[valueId] ?? emptyResolvedValue
    ).unlockSatisfied,
);

export const selectAetherAtmosphere = createSelector(
    [selectHomogeneousValueTotals, selectCityHexes],
    (totals, hexes) => {
        const cityHexCount = hexes.filter(hex => hex.kind === "city").length;

        return resolveAetherAtmosphereFromTotals({
            veil: totals[HOMOGENEOUS_VALUE_IDS.resourceVeil] ?? 0,
            manaFlows: totals[HOMOGENEOUS_VALUE_IDS.resourceManaFlows] ?? 0,
            death: totals[HOMOGENEOUS_VALUE_IDS.resourceDeath] ?? 0,
        }, cityHexCount);
    },
);

export const selectAetherAtmosphereLevels = createSelector(
    [selectAetherAtmosphere],
    (atmosphere) => atmosphere.levels,
);

export const selectControlledTerritory = createSelector(
    [(state: RootState) => state.upkeep.controlledTerritory],
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

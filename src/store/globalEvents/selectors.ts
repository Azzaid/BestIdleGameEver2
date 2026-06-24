import {createSelector} from "@reduxjs/toolkit";
import {GLOBAL_MODIFIERS} from "../../data/globalModifiers/index.ts";
import {
  createGlobalModifierHomogeneousEntities,
  type GlobalSignalRequirementSnapshot,
  type GlobalSignalMessage,
} from "../../models/globalEvents.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {selectRequirementResolutionData} from "../unlocks/selectors.ts";

export const selectGlobalEventFlags = (state: RootState): string[] => state.globalEvents.flags;
export const selectExecutedGlobalEventIds = (state: RootState): string[] => state.globalEvents.executedEventIds;
export const selectActiveGlobalModifiers = (state: RootState) => state.globalEvents.activeGlobalModifiers;
export const selectTriggeredEndingIds = (state: RootState): string[] => state.globalEvents.triggeredEndingIds;
export const selectShownCutsceneIds = (state: RootState): string[] => state.globalEvents.shownCutsceneIds;
export const selectPendingTechnologyUnlockIds = (state: RootState): string[] => state.globalEvents.pendingTechnologyUnlockIds;
export const selectPendingGlobalSignals = (state: RootState): GlobalSignalMessage[] => state.globalEvents.pendingSignals;
export const selectPendingAbandonCity = (state: RootState): boolean => state.globalEvents.pendingAbandonCity;
export const selectPendingGlobalEventModalEntries = (state: RootState) => state.globalEvents.pendingModalEntries;

export const selectGlobalModifierHomogeneousEntities = createSelector(
  [selectActiveGlobalModifiers],
  (instances) => createGlobalModifierHomogeneousEntities(GLOBAL_MODIFIERS, instances),
);

export const selectGlobalSignalRequirementSnapshot = createSelector(
  [selectRequirementResolutionData],
  (data): GlobalSignalRequirementSnapshot => ({
    buildingIds: [...data.resolvedCityData.buildingIds].sort(),
    buildingKeywords: [...data.resolvedCityData.buildingKeywords].sort(),
    technologyIds: [...data.unlockedTechnologyIds].sort(),
    globalFlagIds: [...(data.globalFlagIds ?? new Set<string>())].sort(),
    homogeneousValues: Object.fromEntries(
      Object.entries(data.resolvedCityData.homogeneousValues)
        .filter(([, value]) => value !== 0)
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  }),
);

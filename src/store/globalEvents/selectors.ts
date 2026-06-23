import {createSelector} from "@reduxjs/toolkit";
import {GLOBAL_MODIFIERS} from "../../data/globalModifiers/index.ts";
import {
  createGlobalModifierHomogeneousEntities,
  getRunnableGlobalEvents,
  type GlobalEventTrigger,
} from "../../models/globalEvents.ts";
import type {RootState} from "../../models/store/appStore.ts";
import {selectRequirementResolutionData} from "../unlocks/selectors.ts";
import {GLOBAL_EVENT_LIST} from "../../data/globalEvents/index.ts";

export const selectGlobalEventFlags = (state: RootState): string[] => state.globalEvents.flags;
export const selectExecutedGlobalEventIds = (state: RootState): string[] => state.globalEvents.executedEventIds;
export const selectActiveGlobalModifiers = (state: RootState) => state.globalEvents.activeGlobalModifiers;
export const selectTriggeredEndingIds = (state: RootState): string[] => state.globalEvents.triggeredEndingIds;
export const selectShownCutsceneIds = (state: RootState): string[] => state.globalEvents.shownCutsceneIds;
export const selectPendingTechnologyUnlockIds = (state: RootState): string[] => state.globalEvents.pendingTechnologyUnlockIds;
export const selectPendingAbandonCity = (state: RootState): boolean => state.globalEvents.pendingAbandonCity;

export const selectGlobalModifierHomogeneousEntities = createSelector(
  [selectActiveGlobalModifiers],
  (instances) => createGlobalModifierHomogeneousEntities(GLOBAL_MODIFIERS, instances),
);

export function selectRunnableGlobalEventsForTrigger(trigger: GlobalEventTrigger) {
  return createSelector(
    [selectRequirementResolutionData, selectExecutedGlobalEventIds],
    (requirementData, executedEventIds) => getRunnableGlobalEvents(
      GLOBAL_EVENT_LIST,
      trigger,
      requirementData,
      new Set(executedEventIds),
    ),
  );
}

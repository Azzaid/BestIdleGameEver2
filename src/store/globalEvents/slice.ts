import {createSlice, type PayloadAction, type ThunkAction, type UnknownAction} from "@reduxjs/toolkit";
import {GLOBAL_MODIFIERS} from "../../data/globalModifiers/index.ts";
import {
  applyGlobalModifierDefinition,
  type GlobalEventAction,
  type GlobalModifierApplyContext,
} from "../../models/globalEvents.ts";
import type {RootState} from "../../models/store/appStore.ts";
import type {GlobalEventsState} from "../../models/store/globalEvents.ts";
import {purchaseTech} from "../research/slice.ts";

type ExecuteGlobalEventPayload = {
  eventId: string;
  actions: GlobalEventAction[];
  modifierContext: GlobalModifierApplyContext;
};

const initialState: GlobalEventsState = {
  flags: [],
  executedEventIds: [],
  activeGlobalModifiers: {},
  triggeredEndingIds: [],
  shownCutsceneIds: [],
  pendingTechnologyUnlockIds: [],
  pendingAbandonCity: false,
};

export const globalEventsSlice = createSlice({
  name: "globalEvents",
  initialState,
  reducers: {
    executeGlobalEventActions: (
      state,
      action: PayloadAction<ExecuteGlobalEventPayload>,
    ) => {
      if (!state.executedEventIds.includes(action.payload.eventId)) {
        state.executedEventIds.push(action.payload.eventId);
      }

      for (const eventAction of action.payload.actions) {
        executeGlobalEventAction(state, eventAction, action.payload.modifierContext);
      }
    },
    applyGlobalModifier: (
      state,
      action: PayloadAction<{
        modifierId: string;
        context: GlobalModifierApplyContext;
      }>,
    ) => {
      applyGlobalModifierById(state, action.payload.modifierId, action.payload.context);
    },
    addGlobalEventFlag: (state, action: PayloadAction<string>) => {
      addUnique(state.flags, action.payload);
    },
    removeGlobalEventFlag: (state, action: PayloadAction<string>) => {
      state.flags = state.flags.filter(flagId => flagId !== action.payload);
    },
    clearPendingAbandonCity: (state) => {
      state.pendingAbandonCity = false;
    },
  },
});

export const {
  addGlobalEventFlag,
  applyGlobalModifier,
  clearPendingAbandonCity,
  executeGlobalEventActions,
  removeGlobalEventFlag,
} = globalEventsSlice.actions;

export default globalEventsSlice;

export function executeGlobalEvent(
  payload: ExecuteGlobalEventPayload,
): ThunkAction<void, RootState, unknown, UnknownAction> {
  return (dispatch) => {
    dispatch(executeGlobalEventActions(payload));

    for (const action of payload.actions) {
      if (action.type === "unlockTechnology") {
        dispatch(purchaseTech(action.technologyId));
      }
    }
  };
}

function executeGlobalEventAction(
  state: GlobalEventsState,
  action: GlobalEventAction,
  modifierContext: GlobalModifierApplyContext,
): void {
  if (action.type === "applyGlobalModifier") {
    applyGlobalModifierById(state, action.modifierId, modifierContext);
    return;
  }

  if (action.type === "addFlag") {
    addUnique(state.flags, action.flagId);
    return;
  }

  if (action.type === "removeFlag") {
    state.flags = state.flags.filter(flagId => flagId !== action.flagId);
    return;
  }

  if (action.type === "triggerEnding") {
    addUnique(state.triggeredEndingIds, action.endingId);
    return;
  }

  if (action.type === "showCutscene") {
    addUnique(state.shownCutsceneIds, action.cutsceneId);
    return;
  }

  if (action.type === "unlockTechnology") {
    addUnique(state.pendingTechnologyUnlockIds, action.technologyId);
    return;
  }

  if (action.type === "abandonCity") {
    state.pendingAbandonCity = true;
  }
}

function applyGlobalModifierById(
  state: GlobalEventsState,
  modifierId: string,
  context: GlobalModifierApplyContext,
): void {
  const definition = GLOBAL_MODIFIERS[modifierId];
  if (!definition) return;

  state.activeGlobalModifiers[modifierId] = applyGlobalModifierDefinition(
    definition,
    state.activeGlobalModifiers[modifierId],
    context,
  );
}

function addUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

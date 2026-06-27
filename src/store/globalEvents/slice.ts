import {createSlice, type PayloadAction, type ThunkAction, type UnknownAction} from "@reduxjs/toolkit";
import {GLOBAL_MODIFIERS} from "../../data/globalModifiers/index.ts";
import {
  applyGlobalModifierDefinition,
  type GlobalEventAction,
  type GlobalSignal,
  type GlobalSignalMessage,
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
  pendingSignals: [],
  pendingModalEntries: [],
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

      state.pendingModalEntries.push({
        eventId: action.payload.eventId,
        actions: action.payload.actions,
      });
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
    removeGlobalModifier: (state, action: PayloadAction<string>) => {
      removeGlobalModifierById(state, action.payload);
    },
    addGlobalEventFlag: (state, action: PayloadAction<string>) => {
      addUnique(state.flags, action.payload);
    },
    enqueueGlobalSignal: (
      state,
      action: PayloadAction<GlobalSignal | GlobalSignalMessage | Array<GlobalSignal | GlobalSignalMessage>>,
    ) => {
      const messages = (Array.isArray(action.payload) ? action.payload : [action.payload])
        .map(normalizeSignalMessage);
      for (const message of messages) {
        if (!state.pendingSignals.some(pendingMessage => getSignalKey(pendingMessage.signal) === getSignalKey(message.signal))) {
          state.pendingSignals.push(message);
        }
      }
    },
    clearPendingGlobalSignals: (state) => {
      state.pendingSignals = [];
    },
    removeGlobalEventFlag: (state, action: PayloadAction<string>) => {
      state.flags = state.flags.filter(flagId => flagId !== action.payload);
    },
    clearPendingAbandonCity: (state) => {
      state.pendingAbandonCity = false;
    },
    dismissGlobalEventModalEntries: (state) => {
      state.pendingModalEntries = [];
    },
  },
});

export const {
  addGlobalEventFlag,
  applyGlobalModifier,
  clearPendingGlobalSignals,
  clearPendingAbandonCity,
  dismissGlobalEventModalEntries,
  enqueueGlobalSignal,
  executeGlobalEventActions,
  removeGlobalModifier,
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

export function executeGlobalEvents(
  payloads: readonly ExecuteGlobalEventPayload[],
): ThunkAction<void, RootState, unknown, UnknownAction> {
  return (dispatch) => {
    for (const payload of payloads) {
      dispatch(executeGlobalEvent(payload));
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

  if (action.type === "removeGlobalModifier") {
    removeGlobalModifierById(state, action.modifierId);
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

function removeGlobalModifierById(
  state: GlobalEventsState,
  modifierId: string,
): void {
  delete state.activeGlobalModifiers[modifierId];
}

function addUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function getSignalKey(signal: GlobalSignal): string {
  if (signal.type === "manual") return `${signal.type}:${signal.triggerId ?? ""}`;
  if (signal.type === "technologyUnlocked") return `${signal.type}:${signal.technologyId ?? ""}`;
  if (signal.type === "buildingConstructed") return `${signal.type}:${signal.buildingId ?? ""}`;
  if (signal.type === "buildingDiscovered") return `${signal.type}:${signal.buildingId ?? ""}`;

  return signal.type;
}

function normalizeSignalMessage(signalOrMessage: GlobalSignal | GlobalSignalMessage): GlobalSignalMessage {
  return "signal" in signalOrMessage ? signalOrMessage : {signal: signalOrMessage};
}

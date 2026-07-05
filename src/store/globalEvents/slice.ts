import {createSlice, type PayloadAction, type ThunkAction, type UnknownAction} from "@reduxjs/toolkit";
import {GLOBAL_MODIFIERS} from "../../data/globalModifiers/index.ts";
import {
  applyGlobalModifierDefinition,
  type GlobalEventAction,
  type GlobalEventNotificationLevel,
  type GlobalSignal,
  type GlobalSignalMessage,
  type GlobalModifierApplyContext,
} from "../../models/globalEvents.ts";
import type {RootState} from "../../models/store/appStore.ts";
import type {GlobalEventsState} from "../../models/store/globalEvents.ts";
import type {NewNotification} from "../../models/notifications.ts";
import {purchaseTech} from "../research/slice.ts";

type ExecuteGlobalEventPayload = {
  eventId: string;
  actions: GlobalEventAction[];
  modifierContext: GlobalModifierApplyContext;
  eventsToForesee?: string[];
  notificationLevel?: GlobalEventNotificationLevel;
};

type AddNotificationHistoryEntryPayload = NewNotification & {
  silent?: boolean;
};

const initialState: GlobalEventsState = {
  flags: [],
  executedEventIds: [],
  eventHistoryEntries: [],
  foreseenEventIds: [],
  unseenHistoryEntryIds: [],
  lastSeenHistoryEntryId: undefined,
  activeGlobalModifiers: {},
  triggeredEndingIds: [],
  shownCutsceneIds: [],
  pendingTechnologyUnlockIds: [],
  pendingSignals: [],
  pendingAbandonCity: false,
  pendingVictoryEvent: undefined,
};

export const globalEventsSlice = createSlice({
  name: "globalEvents",
  initialState,
  reducers: {
    executeGlobalEventActions: (
      state,
      action: PayloadAction<ExecuteGlobalEventPayload>,
    ) => {
      ensureGlobalEventHistoryState(state);

      const historyEntryId = `event:${state.eventHistoryEntries.length}:${action.payload.eventId}`;
      state.eventHistoryEntries.push({
        id: historyEntryId,
        eventId: action.payload.eventId,
      });
      if (action.payload.notificationLevel === "notify" || action.payload.notificationLevel === "victory") {
        addUnique(state.unseenHistoryEntryIds, historyEntryId);
      }
      if (action.payload.notificationLevel === "victory") {
        state.pendingVictoryEvent = {eventId: action.payload.eventId};
      }

      if (!state.executedEventIds.includes(action.payload.eventId)) {
        state.executedEventIds.push(action.payload.eventId);
      }

      state.foreseenEventIds = state.foreseenEventIds.filter(eventId => eventId !== action.payload.eventId);
      for (const eventId of action.payload.eventsToForesee ?? []) {
        if (eventId !== action.payload.eventId) addUnique(state.foreseenEventIds, eventId);
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
    clearPendingVictoryEvent: (state) => {
      state.pendingVictoryEvent = undefined;
    },
    addNotificationHistoryEntry: (state, action: PayloadAction<AddNotificationHistoryEntryPayload>) => {
      ensureGlobalEventHistoryState(state);

      const historyEntryId = `notification:${state.eventHistoryEntries.length}:${normalizeHistoryId(action.payload.title)}`;
      state.eventHistoryEntries.push({
        id: historyEntryId,
        title: action.payload.title,
        message: action.payload.message,
        imageUrl: action.payload.imageUrl,
        scheme: action.payload.scheme,
      });
      if (!action.payload.silent) addUnique(state.unseenHistoryEntryIds, historyEntryId);
    },
    markGlobalHistorySeen: (state, action: PayloadAction<string | undefined>) => {
      ensureGlobalEventHistoryState(state);

      state.lastSeenHistoryEntryId = action.payload;
      if (!action.payload) {
        state.unseenHistoryEntryIds = [];
        return;
      }

      const seenEntryIndex = state.eventHistoryEntries.findIndex(entry => entry.id === action.payload);
      if (seenEntryIndex < 0) return;

      const seenEntryIds = new Set(state.eventHistoryEntries.slice(0, seenEntryIndex + 1).map(entry => entry.id));
      state.unseenHistoryEntryIds = state.unseenHistoryEntryIds.filter(entryId => !seenEntryIds.has(entryId));
    },
  },
});

export const {
  addNotificationHistoryEntry,
  addGlobalEventFlag,
  applyGlobalModifier,
  clearPendingGlobalSignals,
  clearPendingAbandonCity,
  clearPendingVictoryEvent,
  enqueueGlobalSignal,
  executeGlobalEventActions,
  markGlobalHistorySeen,
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

function ensureGlobalEventHistoryState(state: GlobalEventsState): void {
  state.eventHistoryEntries ??= state.executedEventIds.map((eventId, index) => ({
    id: `legacy:${index}:${eventId}`,
    eventId,
  }));
  state.foreseenEventIds ??= [];
  state.unseenHistoryEntryIds ??= [];
}

function normalizeHistoryId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "entry";
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

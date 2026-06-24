import type {GlobalEventAction, GlobalModifierInstance, GlobalSignalMessage} from "../globalEvents.ts";

export type GlobalEventModalEntry = {
  eventId: string;
  actions: GlobalEventAction[];
};

export interface GlobalEventsState {
  flags: string[];
  executedEventIds: string[];
  activeGlobalModifiers: Record<string, GlobalModifierInstance>;
  triggeredEndingIds: string[];
  shownCutsceneIds: string[];
  pendingTechnologyUnlockIds: string[];
  pendingSignals: GlobalSignalMessage[];
  pendingModalEntries: GlobalEventModalEntry[];
  pendingAbandonCity: boolean;
}

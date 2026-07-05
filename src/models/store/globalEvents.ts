import type {GlobalModifierInstance, GlobalSignalMessage} from "../globalEvents.ts";

export type GlobalEventHistoryEntry = {
  id: string;
  eventId: string;
};

export interface GlobalEventsState {
  flags: string[];
  executedEventIds: string[];
  eventHistoryEntries: GlobalEventHistoryEntry[];
  foreseenEventIds: string[];
  lastSeenHistoryEntryId?: string;
  activeGlobalModifiers: Record<string, GlobalModifierInstance>;
  triggeredEndingIds: string[];
  shownCutsceneIds: string[];
  pendingTechnologyUnlockIds: string[];
  pendingSignals: GlobalSignalMessage[];
  pendingAbandonCity: boolean;
}

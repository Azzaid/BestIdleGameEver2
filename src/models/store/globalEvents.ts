import type {GlobalModifierInstance, GlobalSignalMessage} from "../globalEvents.ts";
import type {NotificationScheme} from "../notifications.ts";

export type GlobalEventHistoryEntry = {
  id: string;
  eventId?: string;
  title?: string;
  message?: string;
  imageUrl?: string;
  scheme?: NotificationScheme;
};

export type VictoryEventEntry = {
  eventId: string;
};

export interface GlobalEventsState {
  flags: string[];
  executedEventIds: string[];
  eventHistoryEntries: GlobalEventHistoryEntry[];
  foreseenEventIds: string[];
  unseenHistoryEntryIds: string[];
  lastSeenHistoryEntryId?: string;
  activeGlobalModifiers: Record<string, GlobalModifierInstance>;
  triggeredEndingIds: string[];
  shownCutsceneIds: string[];
  pendingTechnologyUnlockIds: string[];
  pendingSignals: GlobalSignalMessage[];
  pendingAbandonCity: boolean;
  pendingVictoryEvent?: VictoryEventEntry;
}

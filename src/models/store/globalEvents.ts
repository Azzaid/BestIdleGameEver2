import type {GlobalModifierInstance} from "../globalEvents.ts";

export interface GlobalEventsState {
  flags: string[];
  executedEventIds: string[];
  activeGlobalModifiers: Record<string, GlobalModifierInstance>;
  triggeredEndingIds: string[];
  shownCutsceneIds: string[];
  pendingTechnologyUnlockIds: string[];
  pendingAbandonCity: boolean;
}

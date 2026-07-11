import {clearPersistedState} from "./persistence.ts";

export function cleanSlateAndReload(): void {
  clearPersistedState();
  window.location.reload();
}

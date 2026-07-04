const DEBUG_STORAGE_KEY = "best-idle-game-ever-2:devtools-debug";

export function loadPersistedDebugMode(): boolean {
  if (!import.meta.env.DEV || !isStorageAvailable()) return false;

  try {
    return localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function savePersistedDebugMode(enabled: boolean): void {
  if (!import.meta.env.DEV || !isStorageAvailable()) return;

  try {
    localStorage.setItem(DEBUG_STORAGE_KEY, String(enabled));
  } catch {
    // Debug mode persistence is a devtools convenience only.
  }
}

function isStorageAvailable(): boolean {
  return typeof localStorage !== "undefined";
}

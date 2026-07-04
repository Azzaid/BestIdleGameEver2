import { initialDevToolsState, type DevToolsState, type IdAuditStatusFilter } from "./state.ts";

const DEVTOOLS_STORAGE_KEY = "best-idle-game-ever-2:devtools";
const DEVTOOLS_SAVE_VERSION = 1;

type DevToolsSaveFile = {
  version: typeof DEVTOOLS_SAVE_VERSION;
  state: Partial<DevToolsState>;
};

const statusFilters: readonly IdAuditStatusFilter[] = ["ok", "missing", "none", "any"];

export function loadDevToolsState(): DevToolsState | undefined {
  if (!isStorageAvailable()) return undefined;

  try {
    const savedValue = localStorage.getItem(DEVTOOLS_STORAGE_KEY);
    if (!savedValue) return undefined;

    const saveFile = JSON.parse(savedValue) as unknown;
    if (!isCurrentSaveFile(saveFile)) return undefined;

    return pickDevToolsState(saveFile.state);
  } catch {
    return undefined;
  }
}

export function saveDevToolsState(state: DevToolsState): void {
  if (!isStorageAvailable()) return;

  try {
    const saveFile: DevToolsSaveFile = {
      version: DEVTOOLS_SAVE_VERSION,
      state: pickDevToolsState(state),
    };

    localStorage.setItem(DEVTOOLS_STORAGE_KEY, JSON.stringify(saveFile));
  } catch {
    // Devtools state is convenience-only and should never break gameplay.
  }
}

function pickDevToolsState(state: Partial<DevToolsState>): DevToolsState {
  return {
    idAudit: {
      ...initialDevToolsState.idAudit,
      ...sanitizeIdAuditFilters(state.idAudit),
    },
  };
}

function sanitizeIdAuditFilters(value: unknown): Partial<DevToolsState["idAudit"]> {
  if (!isRecord(value)) return {};

  const filters: Partial<DevToolsState["idAudit"]> = {};

  if (typeof value.search === "string") filters.search = value.search;
  if (typeof value.categoryFilter === "string") filters.categoryFilter = value.categoryFilter;
  if (isStatusFilter(value.dataFilter)) filters.dataFilter = value.dataFilter;
  if (isStatusFilter(value.progressionFilter)) filters.progressionFilter = value.progressionFilter;
  if (isStatusFilter(value.assetFilter)) filters.assetFilter = value.assetFilter;
  if (typeof value.problemsOnly === "boolean") filters.problemsOnly = value.problemsOnly;

  return filters;
}

function isCurrentSaveFile(value: unknown): value is DevToolsSaveFile {
  if (!isRecord(value)) return false;
  if (value.version !== DEVTOOLS_SAVE_VERSION) return false;

  return isRecord(value.state);
}

function isStatusFilter(value: unknown): value is IdAuditStatusFilter {
  return typeof value === "string" && statusFilters.includes(value as IdAuditStatusFilter);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStorageAvailable(): boolean {
  return typeof localStorage !== "undefined";
}

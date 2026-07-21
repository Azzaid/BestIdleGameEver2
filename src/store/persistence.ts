import type { CityState } from "../models/store/city.ts";
import type { GlobalEventsState } from "../models/store/globalEvents.ts";
import type { HexBackgroundEditorState } from "../models/store/hexBackgroundEditor.ts";
import type { ResearchState } from "../models/store/research.ts";
import type { TowersState } from "../models/store/towers.ts";
import type { UnlocksState } from "../models/store/unlocks.ts";
import type { UpkeepState } from "../models/store/upkeep.ts";

const SAVE_STORAGE_KEY = "best-idle-game-ever-2:redux-save";
const SAVE_VERSION = 1;

type PersistedStoreState = {
  city: CityState;
  upkeep: UpkeepState;
  research: ResearchState;
  towers: TowersState;
  unlocks: UnlocksState;
  globalEvents: GlobalEventsState;
  hexBackgroundEditor: HexBackgroundEditorState;
};

type SaveFile = {
  version: typeof SAVE_VERSION;
  state: Partial<PersistedStoreState>;
};

export function loadPersistedState(): Partial<PersistedStoreState> | undefined {
  if (!isStorageAvailable()) return undefined;

  try {
    const savedValue = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!savedValue) return undefined;

    const saveFile = JSON.parse(savedValue) as unknown;
    if (!isCurrentSaveFile(saveFile)) return undefined;

    return pickPersistedSlices(saveFile.state);
  } catch {
    return undefined;
  }
}

export function savePersistedState(state: Partial<PersistedStoreState>): void {
  if (!isStorageAvailable()) return;

  try {
    const saveFile: SaveFile = {
      version: SAVE_VERSION,
      state: pickPersistedSlices(state),
    };

    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveFile));
  } catch {
    // Storage can be unavailable, full, or blocked by browser settings.
  }
}

export function clearPersistedState(): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // Storage can be unavailable or blocked by browser settings.
  }
}

function pickPersistedSlices(state: Partial<PersistedStoreState>): Partial<PersistedStoreState> {
  const persistedState: Partial<PersistedStoreState> = {};

  if (state.city !== undefined) persistedState.city = state.city;
  if (state.upkeep !== undefined) persistedState.upkeep = state.upkeep;
  if (state.research !== undefined) persistedState.research = state.research;
  if (state.towers !== undefined) persistedState.towers = state.towers;
  if (state.unlocks !== undefined) persistedState.unlocks = state.unlocks;
  if (state.globalEvents !== undefined) persistedState.globalEvents = state.globalEvents;
  if (state.hexBackgroundEditor !== undefined) persistedState.hexBackgroundEditor = state.hexBackgroundEditor;

  return persistedState;
}

function isCurrentSaveFile(value: unknown): value is SaveFile {
  if (!isRecord(value)) return false;
  if (value.version !== SAVE_VERSION) return false;

  return isRecord(value.state);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStorageAvailable(): boolean {
  return typeof localStorage !== "undefined";
}

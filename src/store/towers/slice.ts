import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TowerPartSlot } from '../../models/battle/towerParts.ts';
import type {TowersState} from "../../models/store/towers.ts";
import { MAX_TOWER_SLOTS } from '../../data/constants.ts';

const starterTowerId = 'tower-1';
const emptyStarterTowerParts: Partial<Record<TowerPartSlot, string>> = {};
const towerIds = Array.from({ length: MAX_TOWER_SLOTS }, (_, index) => `tower-${index + 1}`);

const initialState: TowersState = {
  activeTowerId: starterTowerId,
  towers: Object.fromEntries(towerIds.map((towerId, index) => [
    towerId,
    {
      id: towerId,
      name: index === 0 ? 'Wall Prototype' : `Tower ${index + 1}`,
      selectedPartIds: {},
    },
  ])),
  towerDrafts: Object.fromEntries(towerIds.map((towerId) => [towerId, {}])),
};

initialState.towers[starterTowerId].selectedPartIds = emptyStarterTowerParts;
initialState.towerDrafts[starterTowerId] = emptyStarterTowerParts;

export const towersSlice = createSlice({
  name: 'towers',
  initialState,
  reducers: {
    selectTower: (
      state,
      action: PayloadAction<{ towerId: string }>
    ) => {
      if (!state.towers[action.payload.towerId]) return;

      state.activeTowerId = action.payload.towerId;
    },
    selectTowerPart: (
      state,
      action: PayloadAction<{ towerId?: string; slot: TowerPartSlot; partId: string }>
    ) => {
      const towerId = action.payload.towerId ?? state.activeTowerId;
      const tower = state.towers[towerId];
      if (!tower) return;

      tower.selectedPartIds[action.payload.slot] = action.payload.partId;
    },
    selectTowerDraftPart: (
      state,
      action: PayloadAction<{ towerId?: string; slot: TowerPartSlot; partId: string }>
    ) => {
      const towerId = action.payload.towerId ?? state.activeTowerId;
      const tower = state.towers[towerId];
      if (!tower) return;

      state.towerDrafts[towerId] = state.towerDrafts[towerId] ?? { ...tower.selectedPartIds };
      state.towerDrafts[towerId][action.payload.slot] = action.payload.partId;
    },
    clearTowerPart: (
      state,
      action: PayloadAction<{ towerId?: string; slot: TowerPartSlot }>
    ) => {
      const towerId = action.payload.towerId ?? state.activeTowerId;
      const tower = state.towers[towerId];
      if (!tower) return;

      delete tower.selectedPartIds[action.payload.slot];
    },
    clearTowerDraftPart: (
      state,
      action: PayloadAction<{ towerId?: string; slot: TowerPartSlot }>
    ) => {
      const towerId = action.payload.towerId ?? state.activeTowerId;
      const tower = state.towers[towerId];
      if (!tower) return;

      state.towerDrafts[towerId] = state.towerDrafts[towerId] ?? { ...tower.selectedPartIds };
      delete state.towerDrafts[towerId][action.payload.slot];
    },
    commitTowerDraft: (
      state,
      action: PayloadAction<{ towerId?: string } | undefined>
    ) => {
      const towerId = action.payload?.towerId ?? state.activeTowerId;
      const tower = state.towers[towerId];
      if (!tower) return;

      const draft = state.towerDrafts[towerId] ?? tower.selectedPartIds;
      tower.selectedPartIds = { ...draft };
      state.towerDrafts[towerId] = { ...tower.selectedPartIds };
    },
    cancelTowerDraft: (
      state,
      action: PayloadAction<{ towerId?: string } | undefined>
    ) => {
      const towerId = action.payload?.towerId ?? state.activeTowerId;
      const tower = state.towers[towerId];
      if (!tower) return;

      state.towerDrafts[towerId] = { ...tower.selectedPartIds };
    },
    renameTower: (
      state,
      action: PayloadAction<{ towerId?: string; name: string }>
    ) => {
      const towerId = action.payload.towerId ?? state.activeTowerId;
      const tower = state.towers[towerId];
      if (!tower) return;

      tower.name = action.payload.name;
    },
  },
});

export const {
  cancelTowerDraft,
  clearTowerDraftPart,
  clearTowerPart,
  commitTowerDraft,
  renameTower,
  selectTower,
  selectTowerDraftPart,
  selectTowerPart,
} = towersSlice.actions;

export default towersSlice;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TowerPartSlot } from '../../models/battle/towerParts.ts';

export interface StoredTowerAssembly {
  id: string;
  name: string;
  selectedPartIds: Partial<Record<TowerPartSlot, string>>;
}

interface TowersState {
  activeTowerId: string;
  towers: Record<string, StoredTowerAssembly>;
  towerDrafts: Record<string, Partial<Record<TowerPartSlot, string>>>;
}

const starterTowerId = 'tower-1';
const starterTowerParts: Partial<Record<TowerPartSlot, string>> = {
  base: 'base_fixed_mount',
  barrel: 'barrel_basic',
  ammo: 'ammo_standard',
  aimSystem: 'aim_wall_watch',
  loadingSystem: 'loader_manual_crew',
  launchSystem: 'launch_gunpowder',
};

const initialState: TowersState = {
  activeTowerId: starterTowerId,
  towers: {
    [starterTowerId]: {
      id: starterTowerId,
      name: 'Wall Prototype',
      selectedPartIds: starterTowerParts,
    },
  },
  towerDrafts: {
    [starterTowerId]: starterTowerParts,
  },
};

export const towersSlice = createSlice({
  name: 'towers',
  initialState,
  reducers: {
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
  selectTowerDraftPart,
  selectTowerPart,
} = towersSlice.actions;

export default towersSlice;

import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {UnlocksState} from "../../models/store/unlocks.ts";
import {BUILDINGS_ATLAS} from "../../data/buildings/index.ts";
import {TOWER_PARTS} from "../../data/towers/index.ts";
import {WALL_TOWER_BUILDINGS, WALL_SEGMENT_BUILDINGS} from "../../data/wall/index.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";

const initialState: UnlocksState = {
  unlockedBuildingIds: getInitiallyUnlockedIds(
    Object.values(DEVELOPMENT_VECTORS).flatMap(vector => Object.values(BUILDINGS_ATLAS[vector])),
  ),
  unlockedTowerPartIds: getInitiallyUnlockedIds(TOWER_PARTS),
  unlockedWallSegmentIds: getInitiallyUnlockedIds(Object.values(WALL_SEGMENT_BUILDINGS)),
  unlockedWallSuperstructureIds: getInitiallyUnlockedIds(Object.values(WALL_TOWER_BUILDINGS)),
};

export const unlocksSlice = createSlice({
  name: "unlocks",
  initialState,
  reducers: {
    unlockBuildings: (state, action: PayloadAction<string[]>) => {
      addUniqueIds(state.unlockedBuildingIds, action.payload);
    },
    unlockTowerParts: (state, action: PayloadAction<string[]>) => {
      addUniqueIds(state.unlockedTowerPartIds, action.payload);
    },
    unlockWallSegments: (state, action: PayloadAction<string[]>) => {
      addUniqueIds(state.unlockedWallSegmentIds, action.payload);
    },
    unlockWallSuperstructures: (state, action: PayloadAction<string[]>) => {
      addUniqueIds(state.unlockedWallSuperstructureIds, action.payload);
    },
  },
});

function getInitiallyUnlockedIds(items: readonly {id: string; requirements?: readonly unknown[]}[]): string[] {
  return items
    .filter(item => !item.requirements?.length)
    .map(item => item.id);
}

function addUniqueIds(target: string[], ids: readonly string[]) {
  for (const id of ids) {
    if (!target.includes(id)) {
      target.push(id);
    }
  }
}

export const {
  unlockBuildings,
  unlockTowerParts,
  unlockWallSegments,
  unlockWallSuperstructures,
} = unlocksSlice.actions;

export default unlocksSlice;

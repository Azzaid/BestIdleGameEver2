import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../models/store/appStore.ts';
import { resolveTowerAssembly } from '../../models/battle/resolveTowerAssembly.ts';
import { selectBuiltTowerPlatformCount } from '../wall/selectors.ts';
import {selectUnlockedTowerPartIds} from "../unlocks/selectors.ts";

export const selectTowersState = (state: RootState) => state.towers;

export const selectTowerList = createSelector(
  [selectTowersState],
  (towersState) => Object.values(towersState.towers)
);

export const selectAvailableTowerList = createSelector(
  [selectTowerList, selectBuiltTowerPlatformCount],
  (towers, towerPlatformCount) => towers.slice(0, towerPlatformCount)
);

export const selectActiveTower = createSelector(
  [selectTowersState],
  (towersState) => towersState.towers[towersState.activeTowerId]
);

export const selectActiveTowerAssembly = createSelector(
  [selectActiveTower],
  (tower) => ({ selectedPartIds: tower?.selectedPartIds ?? {} })
);

export const selectActiveTowerDraftAssembly = createSelector(
  [selectTowersState, selectActiveTower],
  (towersState, tower) => ({
    selectedPartIds: towersState.towerDrafts[towersState.activeTowerId] ?? tower?.selectedPartIds ?? {},
  })
);

export const selectResolvedActiveTower = createSelector(
  [selectActiveTowerAssembly, selectUnlockedTowerPartIds],
  (assembly, unlockedTowerPartIds) => resolveTowerAssembly(assembly, unlockedTowerPartIds)
);

export const selectResolvedActiveTowerDraft = createSelector(
  [selectActiveTowerDraftAssembly, selectUnlockedTowerPartIds],
  (assembly, unlockedTowerPartIds) => resolveTowerAssembly(assembly, unlockedTowerPartIds)
);

export const selectHasActiveTowerBuild = createSelector(
  [selectResolvedActiveTower],
  (resolvedTower) => resolvedTower.warnings.length === 0
);

export const selectHasAnyTowerBuild = createSelector(
  [selectAvailableTowerList, selectUnlockedTowerPartIds],
  (towers, unlockedTowerPartIds) => towers.some((tower) => (
    resolveTowerAssembly({ selectedPartIds: tower.selectedPartIds }, unlockedTowerPartIds).warnings.length === 0
  ))
);

export const selectResolvedAvailableTowers = createSelector(
  [selectAvailableTowerList, selectUnlockedTowerPartIds],
  (towers, unlockedTowerPartIds) => towers
    .map((tower) => ({
      tower,
      resolved: resolveTowerAssembly({ selectedPartIds: tower.selectedPartIds }, unlockedTowerPartIds),
    }))
);

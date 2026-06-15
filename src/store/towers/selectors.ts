import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../models/store/appStore.ts';
import { resolveTowerAssembly } from '../../models/battle/resolveTowerAssembly.ts';
import { selectPurchasedTechsIds } from '../research/selectors.ts';

export const selectTowersState = (state: RootState) => state.towers;

export const selectTowerList = createSelector(
  [selectTowersState],
  (towersState) => Object.values(towersState.towers)
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
  [selectActiveTowerAssembly, selectPurchasedTechsIds],
  (assembly, purchasedTechIds) => resolveTowerAssembly(assembly, purchasedTechIds)
);

export const selectResolvedActiveTowerDraft = createSelector(
  [selectActiveTowerDraftAssembly, selectPurchasedTechsIds],
  (assembly, purchasedTechIds) => resolveTowerAssembly(assembly, purchasedTechIds)
);

export const selectHasActiveTowerBuild = createSelector(
  [selectResolvedActiveTower],
  (resolvedTower) => resolvedTower.warnings.length === 0
);

export const selectHasAnyTowerBuild = createSelector(
  [selectTowerList, selectPurchasedTechsIds],
  (towers, purchasedTechIds) => towers.some((tower) => (
    resolveTowerAssembly({ selectedPartIds: tower.selectedPartIds }, purchasedTechIds).warnings.length === 0
  ))
);

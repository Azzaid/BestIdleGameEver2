import {createSelector} from "@reduxjs/toolkit";
import {BUILDINGS_ATLAS} from "../../data/buildings/index.ts";
import {TOWER_PARTS} from "../../data/gunParts/index.ts";
import {WALL_SEGMENT_BUILDINGS, WALL_TOWER_BUILDINGS} from "../../data/wall/index.ts";
import {researchTree} from "../../data/research/index.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import type {GunPart} from "../../models/battle/towerParts.ts";
import type {Building} from "../../models/city/Building.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import type {RootState} from "../../models/store/appStore.ts";
import type {RequirementGate} from "../../models/progression/requirements.ts";
import {
  areRequirementsMet,
  type RequirementResolutionData,
} from "../../models/progression/requirements.ts";
import {selectPurchasedTechsIds} from "../research/selectors.ts";
import {selectCityResolution} from "../city/selectors.ts";

export const selectUnlockedBuildingIds = (state: RootState): string[] => state.unlocks.unlockedBuildingIds;
export const selectUnlockedTowerPartIds = (state: RootState): string[] => state.unlocks.unlockedTowerPartIds;
export const selectUnlockedWallSegmentIds = (state: RootState): string[] => state.unlocks.unlockedWallSegmentIds;
export const selectUnlockedWallSuperstructureIds = (state: RootState): string[] => state.unlocks.unlockedWallSuperstructureIds;

export const selectRequirementResolutionData = createSelector(
  [selectCityResolution, selectPurchasedTechsIds],
  (resolvedCityData, purchasedTechIds): RequirementResolutionData => ({
    resolvedCityData,
    unlockedTechnologyIds: new Set(purchasedTechIds),
  }),
);

export const selectUnlockableBuildingIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getRuleMetIds(getAllBuildings(), data),
);

export const selectVisibleBuildingIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getVisibleIds(getAllBuildings(), data),
);

export const selectUnlockableTowerPartIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getRuleMetIds(TOWER_PARTS, data),
);

export const selectVisibleTowerPartIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getVisibleIds(TOWER_PARTS, data),
);

export const selectUnlockableWallSegmentIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getRuleMetIds(Object.values(WALL_SEGMENT_BUILDINGS), data),
);

export const selectVisibleWallSegmentIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getVisibleIds(Object.values(WALL_SEGMENT_BUILDINGS), data),
);

export const selectUnlockableWallSuperstructureIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getRuleMetIds(Object.values(WALL_TOWER_BUILDINGS), data),
);

export const selectVisibleWallSuperstructureIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getVisibleIds(Object.values(WALL_TOWER_BUILDINGS), data),
);

export const selectUnlockableTechnologyIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getRuleMetIds(Object.values(researchTree), data),
);

export const selectVisibleTechnologyIds = createSelector(
  [selectRequirementResolutionData],
  (data) => getVisibleIds(Object.values(researchTree), data),
);

function getAllBuildings(): Building[] {
  return Object.values(DEVELOPMENT_VECTORS).flatMap(vector => Object.values(BUILDINGS_ATLAS[vector]));
}

function getRuleMetIds<T extends {id: string} & RequirementGate>(
  items: readonly T[],
  data: RequirementResolutionData,
): string[] {
  return items
    .filter(item => areRequirementsMet(item.requirements, data))
    .map(item => item.id);
}

function getVisibleIds<T extends {id: string} & RequirementGate>(
  items: readonly T[],
  data: RequirementResolutionData,
): string[] {
  return getRuleMetIds(items, data);
}

export function resolveBuildingUnlocked(building: Building, data: RequirementResolutionData): boolean {
  return areRequirementsMet(building.requirements, data);
}

export function resolveTowerPartUnlocked(part: GunPart, data: RequirementResolutionData): boolean {
  return areRequirementsMet(part.requirements, data);
}

export function resolveWallBuildingUnlocked(wallBuilding: WallBuilding, data: RequirementResolutionData): boolean {
  return areRequirementsMet(wallBuilding.requirements, data);
}

export function resolveWallSegmentUnlocked(wallSegment: WallBuilding, data: RequirementResolutionData): boolean {
  return resolveWallBuildingUnlocked(wallSegment, data);
}

export function resolveWallSuperstructureUnlocked(wallSuperstructure: WallBuilding, data: RequirementResolutionData): boolean {
  return resolveWallBuildingUnlocked(wallSuperstructure, data);
}

export function resolveTechnologyUnlocked(technology: ResearchNodeData, data: RequirementResolutionData): boolean {
  return areRequirementsMet(technology.requirements, data);
}

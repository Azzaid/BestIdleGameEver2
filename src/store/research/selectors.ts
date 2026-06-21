import {createSelector} from "@reduxjs/toolkit";
import {researchTree} from "../../data/research/index.ts";
import type {HomogeneousValueEntitySource} from "../../models/homogeneousValueResolution.ts";
import {resolveCity} from "../../models/homogeneousValueResolution.ts";
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import type {RootState} from "../../models/store/appStore.ts";

export const selectPurchasedTechsIds = (state: RootState): string[] => state.research.purchasedTechsIds;

export const selectUnlockedTechnologies = createSelector(
  [selectPurchasedTechsIds],
  (purchasedTechIds) => purchasedTechIds
    .map(technologyId => researchTree[technologyId])
    .filter((technology): technology is ResearchNodeData => Boolean(technology)),
);

export const selectTechnologyHomogeneousEntities = createSelector(
  [selectUnlockedTechnologies],
  (technologies): HomogeneousValueEntitySource[] => technologies.map(technology => ({
    id: `technology:${technology.id}`,
    contentId: technology.id,
    entityType: "technology",
    keywords: technology.keywords,
    values: technology.values,
    effects: technology.effects,
  })),
);

export const selectResolvedTechnologies = createSelector(
  [selectTechnologyHomogeneousEntities],
  (technologyEntities) => resolveCity(technologyEntities),
);

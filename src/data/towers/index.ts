import type {DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {GunPart, TowerPartsAtlas} from "../../models/battle/towerParts.ts";
import {PROGRESSION_RULES} from "../progression/rules.ts";
import {getResearchRequirementsForTarget} from "../progression/progression.ts";
import {researchTree} from "../research/index.ts";
import {
  REQUIRED_TOWER_PART_SLOTS,
  TOWER_PART_SLOT_ORDER,
  TOWER_PART_DEFINITIONS,
  TOWER_SYNERGY_RULES,
} from "./parts/index.ts";

const createEmptyTowerPartsAtlas = (): TowerPartsAtlas => ({
  tech: {},
  nature: {},
  medieval: {},
  aether: {},
});

const TOWER_PART_LIST = TOWER_PART_DEFINITIONS.map<GunPart>(part => {
  const requiredResearchIds = getResearchRequirementsForTarget(PROGRESSION_RULES, "towerPart", part.id);

  if (!requiredResearchIds.length) return part;

  return {
    ...part,
    unlockRequirements: requiredResearchIds.map(researchId => ({
      researchId,
      label: researchTree[researchId]?.name ?? researchId,
    })),
  };
});

export const TOWER_PARTS_ATLAS = TOWER_PART_LIST.reduce<TowerPartsAtlas>((atlas, part) => {
  const vector: DevelopmentVectorKey = part.vector ?? "medieval";
  atlas[vector][part.id] = part;
  return atlas;
}, createEmptyTowerPartsAtlas());

export const TOWER_PARTS: GunPart[] = Object.values(TOWER_PARTS_ATLAS).flatMap(partsById => Object.values(partsById));

export const TOWER_PARTS_BY_ID = Object.values(TOWER_PARTS_ATLAS).reduce<Record<string, GunPart>>(
  (allParts, partsById) => ({...allParts, ...partsById}),
  {},
);

export {
  REQUIRED_TOWER_PART_SLOTS,
  TOWER_PART_SLOT_ORDER,
  TOWER_SYNERGY_RULES,
};

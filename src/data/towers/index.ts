import type {DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {GunPart, TowerPartsAtlas} from "../../models/battle/towerParts.ts";
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

export const TOWER_PARTS_ATLAS = TOWER_PART_DEFINITIONS.reduce<TowerPartsAtlas>((atlas, part) => {
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

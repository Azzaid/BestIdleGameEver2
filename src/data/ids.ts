import {BUILDINGS_ATLAS} from "./buildings/index.ts";
import {BATTLE_ENEMY_BLUEPRINTS_ATLAS} from "./enemies/index.ts";
import {TOWER_PARTS} from "./gunParts/index.ts";
import {researchTree} from "./research/index.ts";
import {WALL_SEGMENT_BUILDINGS} from "./wallSegments/index.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS} from "./wallSuperstructures/index.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey, type DevelopmentVectorValue} from "../models/DevlopmentVector.ts";
import {getResearchNodeVector} from "../models/research/ResearchNode.ts";

type GroupedIds = Record<string, Record<string, string>>;

const vectorKeys = Object.keys(DEVELOPMENT_VECTORS) as DevelopmentVectorKey[];

export const buildings = Object.fromEntries(
  vectorKeys.map(vector => [
    vector,
    Object.fromEntries(Object.values(BUILDINGS_ATLAS[DEVELOPMENT_VECTORS[vector]]).map(item => [getIdKey(item.id), item.id])),
  ]),
) as GroupedIds;

export const buildingIds = Object.values(buildings).flatMap(group => Object.values(group));

export const technologies = Object.fromEntries(
  vectorKeys.map(vector => [
    vector,
    Object.fromEntries(
      Object.values(researchTree)
        .filter(item => getResearchNodeVector(item) === vector)
        .map(item => [getIdKey(item.id), item.id]),
    ),
  ]),
) as GroupedIds;

export const technologyIds = Object.values(technologies).flatMap(group => Object.values(group));

export const gunparts = Object.fromEntries(
  [...new Set(TOWER_PARTS.flatMap(part => part.slot ? [part.slot] : []))].map(slot => [
    slot,
    Object.fromEntries(vectorKeys.map(vector => [vector, {}])),
  ]),
) as Record<string, GroupedIds>;

for (const part of TOWER_PARTS) {
  if (!part.slot || !part.vector) continue;
  gunparts[part.slot][part.vector][getIdKey(part.id)] = part.id;
}

export const gunpartIds = Object.values(gunparts).flatMap(byVector => (
  Object.values(byVector).flatMap(group => Object.values(group))
));

export const gunpartIdRows = Object.entries(gunparts).flatMap(([slot, byVector]) => (
  Object.entries(byVector).flatMap(([vector, group]) => (
    Object.entries(group).map(([key, id]) => ({slot, vector, key, id}))
  ))
));

export const enemies = Object.fromEntries(
  Object.entries(BATTLE_ENEMY_BLUEPRINTS_ATLAS).map(([region, group]) => [
    region,
    Object.fromEntries(Object.values(group).map(item => [getIdKey(item.id), item.id])),
  ]),
) as GroupedIds;

export const enemyIds = Object.values(enemies).flatMap(group => Object.values(group));

export const walls = groupWallIds(WALL_SEGMENT_BUILDINGS);
export const wallIds = Object.values(walls).flatMap(group => Object.values(group));

export const superstructures = groupWallIds(WALL_SUPERSTRUCTURE_BUILDINGS);
export const superstructureIds = Object.values(superstructures).flatMap(group => Object.values(group));

function groupWallIds(source: Record<string, { id: string; vector?: DevelopmentVectorValue }>): GroupedIds {
  return Object.fromEntries(
    vectorKeys.map(vector => [
      vector,
      Object.fromEntries(
        Object.values(source)
          .filter(item => item.vector === DEVELOPMENT_VECTORS[vector])
          .map(item => [getIdKey(item.id), item.id]),
      ),
    ]),
  ) as GroupedIds;
}

function getIdKey(id: string): string {
  return id.split(".").at(-1) ?? id;
}

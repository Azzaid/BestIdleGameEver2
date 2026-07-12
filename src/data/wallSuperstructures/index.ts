import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {WallBuilding, WallBuildingAtlas, WallTopCategory} from "../../models/city/Wall.ts";
import type {HomogeneousAdjacencyRule, HomogeneousDerivedValueEffect, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../homogeneousValues/index.ts";
import aetherWallSuperstructureDefinitions from "./aether.json";
import medievalWallSuperstructureDefinitions from "./medieval.json";
import natureWallSuperstructureDefinitions from "./nature.json";
import neutralWallSuperstructureDefinitions from "./neutral.json";
import techWallSuperstructureDefinitions from "./tech.json";
import {createWallSuperstructureFactory} from "./wallSuperstructureFactory.ts";

type WallSuperstructureDefinition = {
  id: string;
  name: string;
  description: string;
  wallTopCategory?: WallTopCategory;
  keywords?: BuildingKeyword[];
  requirements?: Requirement[];
  buildRequirements?: Requirement[];
  values?: HomogeneousValueEffect[];
  derivedValues?: HomogeneousDerivedValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  visualAssetId?: string;
};

const definitionsByVector: Record<DevelopmentVectorKey, readonly WallSuperstructureDefinition[]> = {
  neutral: neutralWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
  tech: techWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
  nature: natureWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
  medieval: medievalWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
  aether: aetherWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
};

export const WALL_SUPERSTRUCTURES_ATLAS: WallBuildingAtlas = {
  [DEVELOPMENT_VECTORS.neutral]: buildWallSuperstructures("neutral"),
  [DEVELOPMENT_VECTORS.tech]: buildWallSuperstructures("tech"),
  [DEVELOPMENT_VECTORS.nature]: buildWallSuperstructures("nature"),
  [DEVELOPMENT_VECTORS.medieval]: buildWallSuperstructures("medieval"),
  [DEVELOPMENT_VECTORS.aether]: buildWallSuperstructures("aether"),
};

export const WALL_SUPERSTRUCTURE_BUILDINGS: Record<string, WallBuilding> = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, WallBuilding>>(
  (allWallSuperstructures, vector) => ({
    ...allWallSuperstructures,
    ...WALL_SUPERSTRUCTURES_ATLAS[vector],
  }),
  {},
);

function buildWallSuperstructures(vector: DevelopmentVectorKey): Record<string, WallBuilding> {
  const tower = createWallSuperstructureFactory({
    vector: DEVELOPMENT_VECTORS[vector],
  });

  return Object.fromEntries(
    definitionsByVector[vector].map(definition => [
      definition.id,
      tower(
        definition.id,
        definition.name,
        definition.description,
        {
          keywords: definition.keywords,
          wallTopCategory: definition.wallTopCategory,
          requirements: definition.requirements,
          buildRequirements: definition.buildRequirements,
          values: definition.values,
          derivedValues: definition.derivedValues,
          effects: definition.effects,
          visualAssetId: definition.visualAssetId,
        },
      ),
    ]),
  );
}

export function isWallTopTower(building: WallBuilding): boolean {
  return (
    building.wallTopCategory === "tower"
    || building.values?.some((value) => (
      value.valueId === HOMOGENEOUS_VALUE_IDS.towerMaximumWeight
      || value.valueId === HOMOGENEOUS_VALUE_IDS.towerMaximumRange
    )) === true
    || building.derivedValues?.some((value) => (
      value.valueId === HOMOGENEOUS_VALUE_IDS.towerMaximumWeight
      || value.valueId === HOMOGENEOUS_VALUE_IDS.towerMaximumRange
    )) === true
  );
}

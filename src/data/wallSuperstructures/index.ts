import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {WallBuilding, WallBuildingAtlas} from "../../models/city/Wall.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import aetherWallSuperstructureDefinitions from "./aether.json";
import medievalWallSuperstructureDefinitions from "./medieval.json";
import natureWallSuperstructureDefinitions from "./nature.json";
import techWallSuperstructureDefinitions from "./tech.json";
import {createWallSuperstructureFactory} from "./wallSuperstructureFactory.ts";

type WallSuperstructureDefinition = {
  id: string;
  name: string;
  description: string;
  keywords?: BuildingKeyword[];
  requirements?: Requirement[];
  buildRequirements?: Requirement[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
};

const definitionsByVector: Record<DevelopmentVectorKey, readonly WallSuperstructureDefinition[]> = {
  tech: techWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
  nature: natureWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
  medieval: medievalWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
  aether: aetherWallSuperstructureDefinitions as readonly WallSuperstructureDefinition[],
};

export const WALL_SUPERSTRUCTURES_ATLAS: WallBuildingAtlas = {
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

export {WALL_SUPERSTRUCTURE_BUILDINGS as WALL_TOWER_BUILDINGS};

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
          requirements: definition.requirements,
          buildRequirements: definition.buildRequirements,
          values: definition.values,
          effects: definition.effects,
        },
      ),
    ]),
  );
}

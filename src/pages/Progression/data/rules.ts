import {BUILDINGS_ATLAS} from "../../../data/buildings/index.ts";
import {researchTree} from "../../../data/research/index.ts";
import {TOWER_PARTS} from "../../../data/gunParts/index.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../../data/wallSegments/index.ts";
import {WALL_TOWER_BUILDINGS} from "../../../data/wallSuperstructures/index.ts";
import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import {defineProgression} from "./progression.ts";
import {getProgressionNodeRefFromId} from "./nodeIdentity.ts";
import type {Requirement} from "../../../models/progression/requirements.ts";
import type {ProgressionRequirements, ProgressionRule} from "./types.ts";

type RuleSource = {
  id: string;
  requirements?: readonly Requirement[];
};

export const PROGRESSION_RULES = defineProgression(
  getProgressionRuleSources().map((source): ProgressionRule => ({
      target: getProgressionNodeRefFromId(source.id),
      requires: requirementsToProgressionRequirements(source.requirements),
  })),
);

function getProgressionRuleSources(): RuleSource[] {
  return [
    ...Object.values(DEVELOPMENT_VECTORS)
      .flatMap(vector => Object.values(BUILDINGS_ATLAS[vector]))
      .map((building): RuleSource => ({
        id: building.id,
        requirements: building.requirements,
      })),
    ...Object.values(WALL_SEGMENT_BUILDINGS).map((wallSegment): RuleSource => ({
      id: wallSegment.id,
      requirements: wallSegment.requirements,
    })),
    ...Object.values(WALL_TOWER_BUILDINGS).map((wallSuperstructure): RuleSource => ({
      id: wallSuperstructure.id,
      requirements: wallSuperstructure.requirements,
    })),
    ...TOWER_PARTS.map((part): RuleSource => ({
      id: part.id,
      requirements: part.requirements,
    })),
    ...Object.values(researchTree).map((research): RuleSource => ({
      id: research.id,
      requirements: research.requirements,
    })),
  ];
}

function requirementsToProgressionRequirements(
  requirements: readonly Requirement[] | undefined,
): ProgressionRequirements | undefined {
  const converted: ProgressionRequirements = {};

  for (const requirement of requirements ?? []) {
    if (requirement.type === "technologyUnlocked") {
      converted.research = [...(converted.research ?? []), requirement.technologyId];
    }

    if (requirement.type === "buildingExists") {
      converted.buildings = [...(converted.buildings ?? []), requirement.buildingId];
    }
  }

  return Object.keys(converted).length ? converted : undefined;
}

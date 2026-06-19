import {BUILDINGS_ATLAS} from "../buildings/index.ts";
import {researchTree} from "../research/index.ts";
import {TOWER_PARTS} from "../towers/index.ts";
import {TOWER_PLATFORM_BUILDINGS, WALL_SEGMENT_BUILDINGS} from "../wall/index.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {defineProgression} from "./progression.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import type {ProgressionNodeKind, ProgressionRequirements, ProgressionRule} from "./types.ts";

type RuleSource = {
  kind: ProgressionNodeKind;
  id: string;
  requirements?: readonly Requirement[];
};

export const PROGRESSION_RULES = defineProgression(
  getProgressionRuleSources().map((source): ProgressionRule => ({
      target: {
        kind: source.kind,
        id: source.id,
      },
      requires: requirementsToProgressionRequirements(source.requirements),
  })),
);

function getProgressionRuleSources(): RuleSource[] {
  return [
    ...Object.values(DEVELOPMENT_VECTORS)
      .flatMap(vector => Object.values(BUILDINGS_ATLAS[vector]))
      .map((building): RuleSource => ({
        kind: "building",
        id: building.id,
        requirements: building.requirements,
      })),
    ...Object.values(WALL_SEGMENT_BUILDINGS).map((wallSegment): RuleSource => ({
      kind: "building",
      id: wallSegment.id,
      requirements: wallSegment.requirements,
    })),
    ...Object.values(TOWER_PLATFORM_BUILDINGS).map((wallSuperstructure): RuleSource => ({
      kind: "building",
      id: wallSuperstructure.id,
      requirements: wallSuperstructure.requirements,
    })),
    ...TOWER_PARTS.map((part): RuleSource => ({
      kind: "towerPart",
      id: part.id,
      requirements: part.requirements,
    })),
    ...Object.values(researchTree).map((research): RuleSource => ({
      kind: "research",
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

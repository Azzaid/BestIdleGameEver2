import {type DevelopmentVectorKey} from "../../../models/DevlopmentVector.ts";
import type {ProgressionNodeKind, ProgressionNodeRef} from "./types.ts";

const VECTOR_KEYS: readonly DevelopmentVectorKey[] = ["tech", "nature", "medieval", "aether"];

export function getProgressionNodeRefFromId(id: string): ProgressionNodeRef {
  return {
    kind: getProgressionNodeKindFromId(id),
    id,
  };
}

export function getProgressionNodeKindFromId(id: string): ProgressionNodeKind {
  const [prefix] = id.split(".");

  if (prefix === "research") return "research";
  if (prefix === "gunParts") return "towerPart";
  if (prefix === "wallSuperstructures") return "structure";

  return "building";
}

export function getProgressionNodeVectorFromId(id: string): DevelopmentVectorKey | undefined {
  const [, vector] = id.split(".");

  return isDevelopmentVectorKey(vector) ? vector : undefined;
}

function isDevelopmentVectorKey(value: string | undefined): value is DevelopmentVectorKey {
  return VECTOR_KEYS.includes(value as DevelopmentVectorKey);
}

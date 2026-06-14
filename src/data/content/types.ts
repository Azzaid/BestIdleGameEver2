import type {UpkeepAmount} from "../../models/Upkeep.ts";

export type ProgressionNodeKind = "research" | "building" | "towerPart" | "structure";

export type ProgressionNodeRef = {
  kind: ProgressionNodeKind;
  id: string;
};

export type ProgressionRequirements = {
  research?: string[];
  buildings?: string[];
  structures?: string[];
  freeUpkeep?: UpkeepAmount;
};

export type ProgressionRule = {
  target: ProgressionNodeRef;
  requires?: ProgressionRequirements;
  notes?: string;
};

export type ProgressionEdgeKind = "research" | "building" | "structure" | "freeUpkeep";

export type ProgressionEdge = {
  id: string;
  from: ProgressionNodeRef;
  to: ProgressionNodeRef;
  kind: ProgressionEdgeKind;
};

export type ProgressionGraphNode = ProgressionNodeRef & {
  name: string;
};

export type ProgressionGraph = {
  nodes: ProgressionGraphNode[];
  edges: ProgressionEdge[];
};

export type ProgressionRegistry = {
  research: Record<string, string>;
  buildings: Record<string, string>;
  towerParts: Record<string, string>;
  structures: Record<string, string>;
};

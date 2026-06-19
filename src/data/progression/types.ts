import type {UpkeepAmount} from "../../models/Upkeep.ts";
import type {DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {AetherAtmosphere, AetherAtmosphereLevel} from "../../models/city/AetherAtmosphere.ts";

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
  aetherAtmosphere?: Partial<Record<AetherAtmosphere, AetherAtmosphereLevel>>;
  biodiversity?: number;
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
  vector?: DevelopmentVectorKey;
  requirements?: ProgressionRequirements;
};

export type ProgressionGraph = {
  nodes: ProgressionGraphNode[];
  edges: ProgressionEdge[];
};

export type ProgressionRegistry = {
  research: Record<string, ProgressionRegistryEntry>;
  buildings: Record<string, ProgressionRegistryEntry>;
  towerParts: Record<string, ProgressionRegistryEntry>;
  structures: Record<string, ProgressionRegistryEntry>;
};

export type ProgressionRegistryEntry = {
  name: string;
  vector?: DevelopmentVectorKey;
};

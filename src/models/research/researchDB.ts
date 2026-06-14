import type {ResearchNodeData} from "./ResearchNode.ts";
import type {DevelopmentVectorKey} from "../DevlopmentVector.ts";

export type ResearchDB = Record<string, ResearchNodeData>;
export type ResearchAtlas = Record<DevelopmentVectorKey, ResearchDB>;

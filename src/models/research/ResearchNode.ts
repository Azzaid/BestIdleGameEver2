import type {DevelopmentVectorKey} from "../DevlopmentVector.ts";

export type ResearchNodeData = {
    id: string;
    parentId: string | null;             // canonical parent for collapse/navigation
    name: string;
    vector: DevelopmentVectorKey;
    summary?: string;
    unlocks?: string[];
    costs?: { type: string; amount: number }[];
    notes?: string;
    /** Additional prerequisites (multi-parent DAG edges) */
    alsoRequires?: string[];             // other node IDs required
};
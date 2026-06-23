import type {DevelopmentVectorKey} from "../DevlopmentVector.ts";
import type {ThemeName} from "../Theme.ts";
import type {UpkeepAmount} from "../Upkeep.ts";
import type {AetherAtmosphere, AetherAtmosphereLevel} from "../city/AetherAtmosphere.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../homogeneousValues.ts";
import type {Requirement} from "../progression/requirements.ts";

export type ResearchNodeData = {
    id: string;
    parentId: string | null;             // canonical parent for collapse/navigation
    name: string;
    keywords: string[];
    summary?: string;
    unlocks?: string[];
    requirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
    requiredBuildings?: string[];
    requiredStructures?: string[];
    requiredFreeUpkeep?: UpkeepAmount;
    requiredAetherAtmosphere?: Partial<Record<AetherAtmosphere, AetherAtmosphereLevel>>;
    requiredBiodiversity?: number;
    notes?: string;
    /** Additional prerequisites (multi-parent DAG edges) */
    alsoRequires?: string[];             // other node IDs required
};

const TECHNOLOGY_VECTOR_KEYWORDS: DevelopmentVectorKey[] = ["tech", "nature", "medieval", "aether"];

export function getResearchNodeVector(node: Pick<ResearchNodeData, "id">): DevelopmentVectorKey {
    return getResearchNodeVectorFromId(node.id) ?? "medieval";
}

export function getResearchNodeThemeName(node: Pick<ResearchNodeData, "id">): ThemeName {
    return getResearchNodeVector(node);
}

export function getResearchNodeVectorMatches(node: Pick<ResearchNodeData, "id">): DevelopmentVectorKey[] {
    const vector = getResearchNodeVectorFromId(node.id);
    return vector ? [vector] : [];
}

export function getResearchNodeVectorFromId(id: string): DevelopmentVectorKey | undefined {
    const [type, vector] = id.split(".");
    if (type !== "research") return undefined;

    return isTechnologyVectorKey(vector) ? vector : undefined;
}

function isTechnologyVectorKey(value: string | undefined): value is DevelopmentVectorKey {
    return TECHNOLOGY_VECTOR_KEYWORDS.includes(value as DevelopmentVectorKey);
}

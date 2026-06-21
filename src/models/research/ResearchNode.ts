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
const TECHNOLOGY_THEME_KEYWORDS: Record<DevelopmentVectorKey, readonly string[]> = {
    tech: ["tech", "technology"],
    nature: ["nature", "bio", "biology"],
    medieval: ["medieval", "human"],
    aether: ["aether", "magic"],
};

export function getResearchNodeVector(node: Pick<ResearchNodeData, "keywords">): DevelopmentVectorKey {
    return getResearchNodeVectorMatches(node)[0] ?? "medieval";
}

export function getResearchNodeThemeName(node: Pick<ResearchNodeData, "keywords">): ThemeName {
    return getResearchNodeVector(node);
}

export function getResearchNodeVectorMatches(node: Pick<ResearchNodeData, "keywords">): DevelopmentVectorKey[] {
    return TECHNOLOGY_VECTOR_KEYWORDS.filter(vector => hasAnyKeyword(node, TECHNOLOGY_THEME_KEYWORDS[vector]));
}

function hasAnyKeyword(node: Pick<ResearchNodeData, "keywords">, keywords: readonly string[]): boolean {
    const nodeKeywords = new Set(node.keywords);
    return keywords.some(keyword => nodeKeywords.has(keyword));
}

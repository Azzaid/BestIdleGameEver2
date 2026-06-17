import type {DevelopmentVectorKey} from "../DevlopmentVector.ts";
import type {UpkeepAmount} from "../Upkeep.ts";
import type {AetherAtmosphere, AetherAtmosphereLevel} from "../city/AetherAtmosphere.ts";

export type ResearchNodeData = {
    id: string;
    parentId: string | null;             // canonical parent for collapse/navigation
    name: string;
    vector: DevelopmentVectorKey;
    summary?: string;
    unlocks?: string[];
    requiredBuildings?: string[];
    requiredStructures?: string[];
    requiredFreeUpkeep?: UpkeepAmount;
    requiredAetherAtmosphere?: Partial<Record<AetherAtmosphere, AetherAtmosphereLevel>>;
    requiredBiodiversity?: number;
    notes?: string;
    /** Additional prerequisites (multi-parent DAG edges) */
    alsoRequires?: string[];             // other node IDs required
};

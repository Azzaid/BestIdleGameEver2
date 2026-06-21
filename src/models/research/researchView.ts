import type {ResearchNodeData} from './ResearchNode.ts';
import type {ThemeName} from "../Theme.ts";

export type RequirementStatus = {
    requiredBuildings: {id: string; name: string; met: boolean}[];
    requiredStructures: {id: string; name: string; met: boolean}[];
    requiredFreeUpkeep: {name: string; required: number; available: number; met: boolean}[];
    requiredAetherAtmosphere: {name: string; required: string; available: string; met: boolean}[];
    requiredBiodiversity: {required: number} | null;
};

export type StubData = {
    id: string;
    missingOf: string;
    target: string;
    progressText: string;
    themeName: ThemeName;
};

export type FlatNode = {
    id: string;
    width: number;
    height: number;
    data: { kind: 'normal' | 'stub'; data: ResearchNodeData | StubData }
};

export type FlatEdgeData = { kind?: 'normal' | 'preview' | 'stub' };
export type FlatEdge = { id: string; from: string; to: string; data: FlatEdgeData };

export type NodeCardProps = {
    data: ResearchNodeData,
    nodeWidth: number,
    nodeHeight: number,
    requirements: RequirementStatus,
    isResearched: boolean,
    canResearch: boolean,
};

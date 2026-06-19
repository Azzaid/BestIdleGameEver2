import type {ResearchNodeData} from "./ResearchNode.ts";
import type {ResearchDB} from "./researchDB.ts";
import type {FlatEdge, FlatNode, StubData} from "./researchView.ts";
import {areProgressionRequirementsMet, type ProgressionUnlockContext} from "../../data/progression/progression.ts";
import type {UpkeepAmount} from "../Upkeep.ts";
import type {AetherAtmosphereLevels} from "../city/AetherAtmosphere.ts";

export type ResearchPurchaseContext = {
    purchased: ReadonlySet<string>;
    builtBuildingIds: ReadonlySet<string>;
    completeStructureIds: ReadonlySet<string>;
    effectiveUpkeep: UpkeepAmount;
    aetherAtmosphereLevels: AetherAtmosphereLevels;
    biodiversity?: number;
    isBesieged: boolean;
};

export function canPurchaseResearch(node: ResearchNodeData, context: ResearchPurchaseContext): boolean {
    if (context.isBesieged || context.purchased.has(node.id)) return false;
    if (!isResearchUnlocked(node, context.purchased)) return false;

    const progressionContext: ProgressionUnlockContext = {
        researchIds: context.purchased,
        buildingIds: context.builtBuildingIds,
        structureIds: context.completeStructureIds,
        freeUpkeep: context.effectiveUpkeep,
        aetherAtmosphereLevels: context.aetherAtmosphereLevels,
        biodiversity: context.biodiversity,
    };

    return areProgressionRequirementsMet({
        buildings: node.requiredBuildings,
        structures: node.requiredStructures,
        freeUpkeep: node.requiredFreeUpkeep,
        aetherAtmosphere: node.requiredAetherAtmosphere,
        biodiversity: node.requiredBiodiversity,
    }, progressionContext);
}

const ROOT_CHILD_ORDER = ['aether', 'tech', 'nature', 'medieval'];

export function getResearchPrerequisites(node: ResearchNodeData): string[] {
    const prerequisites: string[] = [];
    if (node.parentId) prerequisites.push(node.parentId);
    if (node.alsoRequires?.length) prerequisites.push(...node.alsoRequires);
    return prerequisites;
}

export function isResearchUnlocked(node: ResearchNodeData, purchased: ReadonlySet<string>): boolean {
    return getResearchPrerequisites(node).every(id => purchased.has(id));
}

export function hasAnyResearchPrerequisiteMet(node: ResearchNodeData, purchased: ReadonlySet<string>): boolean {
    return getResearchPrerequisites(node).some(id => purchased.has(id));
}

export function getResearchNodeOrder(db: ResearchDB): string[] {
    const allIds = Object.keys(db);
    const originalOrder = new Map(allIds.map((id, index) => [id, index]));
    const rootChildOrder = new Map(ROOT_CHILD_ORDER.map((id, index) => [id, index]));

    return [...allIds].sort((a, b) => {
        const aRootChildOrder = rootChildOrder.get(a);
        const bRootChildOrder = rootChildOrder.get(b);

        if (aRootChildOrder !== undefined && bRootChildOrder !== undefined) {
            return aRootChildOrder - bRootChildOrder;
        }

        if (aRootChildOrder !== undefined) return -1;
        if (bRootChildOrder !== undefined) return 1;

        return (originalOrder.get(a) ?? 0) - (originalOrder.get(b) ?? 0);
    });
}

export function buildResearchPreviewGraph(
    db: ResearchDB,
    purchased: ReadonlySet<string>,
    nodeSize: {width: number; height: number},
    options: {getNodeSize?: (node: ResearchNodeData) => {width: number; height: number}} = {},
): {nodes: FlatNode[]; edges: FlatEdge[]} {
    const nodes: FlatNode[] = [];
    const edges: FlatEdge[] = [];
    const allIds = getResearchNodeOrder(db);
    const unlockedIds = new Set<string>();
    const previewIds = new Set<string>();

    for (const id of allIds) {
        const node = db[id];
        if (id === 'root') continue;
        if (isResearchUnlocked(node, purchased)) {
            unlockedIds.add(id);
        } else if (hasAnyResearchPrerequisiteMet(node, purchased)) {
            previewIds.add(id);
        }
    }

    const visibleIds = new Set<string>(['root']);

    for (const id of allIds) {
        if (purchased.has(id) || unlockedIds.has(id) || previewIds.has(id)) {
            visibleIds.add(id);
        }
    }

    for (const id of visibleIds) {
        const node = db[id];
        if (!node) continue;
        const size = options.getNodeSize?.(node) ?? nodeSize;

        nodes.push({
            id,
            width: size.width,
            height: size.height,
            data: {kind: 'normal', data: node},
        });
    }

    for (const id of visibleIds) {
        const node = db[id];
        if (!node) continue;

        for (const prerequisiteId of getResearchPrerequisites(node)) {
            if (!visibleIds.has(prerequisiteId)) continue;

            const kind = unlockedIds.has(id) || purchased.has(id) ? 'normal' : 'preview';
            edges.push({
                id: `${prerequisiteId}->${id}`,
                from: prerequisiteId,
                to: id,
                data: {kind},
            });
        }
    }

    for (const id of visibleIds) {
        if (!previewIds.has(id)) continue;

        const node = db[id];
        if (!node) continue;

        const prerequisites = getResearchPrerequisites(node);
        const met = prerequisites.filter(prerequisiteId => purchased.has(prerequisiteId));
        const missing = prerequisites.filter(prerequisiteId => !purchased.has(prerequisiteId));

        for (const missingId of missing) {
            const stubId = `stub:${missingId}->${id}`;
            const progressText = `${met.length}/${prerequisites.length}`;
            const stub: StubData = {
                id: stubId,
                missingOf: missingId,
                target: id,
                progressText,
                vector: node.vector,
            };

            nodes.push({
                id: stubId,
                width: 12,
                height: 12,
                data: {kind: 'stub', data: stub},
            });
            edges.push({
                id: `${stubId}=>${id}`,
                from: stubId,
                to: id,
                data: {kind: 'stub'},
            });
        }
    }

    return {nodes, edges};
}

export function validateResearchGraph(
    db: ResearchDB,
    requiredResearchById: Record<string, string[]> = {},
): string[] {
    const errors: string[] = [];
    const ids = new Set(Object.keys(db));

    for (const [id, node] of Object.entries(db)) {
        if (id !== node.id) {
            errors.push(`Research key "${id}" does not match node id "${node.id}".`);
        }

        for (const prerequisiteId of getResearchPrerequisites(node)) {
            if (!ids.has(prerequisiteId)) {
                errors.push(`${node.id} requires unknown research "${prerequisiteId}".`);
            }
        }

        const graphPrerequisites = [...new Set(getResearchPrerequisites(node))].sort();
        const rulePrerequisites = [...new Set(requiredResearchById[node.id] ?? [])].sort();
        const missingFromGraph = rulePrerequisites.filter(prerequisiteId => !graphPrerequisites.includes(prerequisiteId));
        const missingFromRules = graphPrerequisites.filter(prerequisiteId => !rulePrerequisites.includes(prerequisiteId));

        if (missingFromGraph.length) {
            errors.push(`${node.id} has progression research requirements missing from the visual graph: ${missingFromGraph.join(', ')}.`);
        }

        if (missingFromRules.length && node.id !== 'root') {
            errors.push(`${node.id} has visual graph prerequisites missing from progression rules: ${missingFromRules.join(', ')}.`);
        }
    }

    for (const id of ids) {
        const visited = new Set<string>();
        const active = new Set<string>();

        const visit = (nodeId: string): boolean => {
            if (active.has(nodeId)) return true;
            if (visited.has(nodeId)) return false;

            visited.add(nodeId);
            active.add(nodeId);

            const node = db[nodeId];
            if (node) {
                for (const prerequisiteId of getResearchPrerequisites(node)) {
                    if (ids.has(prerequisiteId) && visit(prerequisiteId)) {
                        return true;
                    }
                }
            }

            active.delete(nodeId);
            return false;
        };

        if (visit(id)) {
            errors.push(`Research graph contains a prerequisite cycle involving "${id}".`);
        }
    }

    if (!ids.has('root')) {
        errors.push('Research graph is missing the "root" node.');
    }

    return [...new Set(errors)];
}

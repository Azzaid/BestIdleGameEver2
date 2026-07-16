import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../../models/DevlopmentVector.ts";
import type {ProgressionGraph, ProgressionGraphNode, ProgressionNodeKind} from "./types.ts";

export const PROGRESSION_VECTOR_ORDER: DevelopmentVectorKey[] = [
  "medieval",
  "nature",
  "aether",
  "tech",
  "neutral",
];

export type ProgressionMapItem = ProgressionGraphNode & {
  layoutDepth: number;
  ownerResearchId?: string;
  ownerResearchName?: string;
  ownerBuildingIds: string[];
};

export type ProgressionMapBranch = {
  id: string;
  vector: DevelopmentVectorKey;
  depth: number;
  title: string;
  branch: string;
  gate?: ProgressionGraphNode;
  items: ProgressionMapItem[];
  children: ProgressionMapBranch[];
};

export type ProgressionMapLane = {
  vector: DevelopmentVectorKey;
  branches: ProgressionMapBranch[];
};

type ResolvedResearch = ProgressionGraphNode & {
  depth: number;
  parentResearchId?: string;
};

export function buildProgressionMap(
  graph: ProgressionGraph,
  visibleNodeKeys: ReadonlySet<string>,
): ProgressionMapLane[] {
  const nodesByKey = new Map(graph.nodes.map(node => [getProgressionMapNodeKey(node), node]));
  const researchNodes = graph.nodes.filter((node): node is ProgressionGraphNode & {kind: "research"} => node.kind === "research");
  const parentByResearchId = getResearchParents(researchNodes, nodesByKey);
  const depthByResearchId = getResearchDepths(researchNodes, parentByResearchId);
  const researchById = new Map<string, ResolvedResearch>();

  for (const node of researchNodes) {
    researchById.set(node.id, {
      ...node,
      depth: depthByResearchId.get(node.id) ?? 0,
      parentResearchId: parentByResearchId.get(node.id),
    });
  }

  const childResearchIds = new Map<string | undefined, string[]>();
  for (const research of researchById.values()) {
    const key = research.parentResearchId;
    childResearchIds.set(key, [...(childResearchIds.get(key) ?? []), research.id]);
  }

  const itemsByOwnerId = new Map<string | undefined, ProgressionMapItem[]>();

  for (const node of graph.nodes) {
    if (node.kind === "research") continue;
    const nodeKey = getProgressionMapNodeKey(node);
    if (!visibleNodeKeys.has(nodeKey)) continue;

    const owner = getOwnerResearch(node, researchById);
    const item: ProgressionMapItem = {
      ...node,
      layoutDepth: owner?.depth ?? 0,
      ownerResearchId: owner?.id,
      ownerResearchName: owner?.name,
      ownerBuildingIds: node.requirements?.buildings ?? [],
    };
    itemsByOwnerId.set(owner?.id, [...(itemsByOwnerId.get(owner?.id) ?? []), item]);
  }

  function buildBranch(research: ResolvedResearch): ProgressionMapBranch | undefined {
    const children = (childResearchIds.get(research.id) ?? [])
      .map(id => researchById.get(id))
      .filter((child): child is ResolvedResearch => Boolean(child))
      .sort(compareResearch)
      .map(buildBranch)
      .filter((branch): branch is ProgressionMapBranch => Boolean(branch));
    const gateVisible = visibleNodeKeys.has(getProgressionMapNodeKey(research));
    const items = [...(itemsByOwnerId.get(research.id) ?? [])].sort(compareItems);

    if (!gateVisible && !items.length && !children.length) return undefined;

    return {
      id: research.id,
      vector: getNodeVector(research, undefined),
      depth: research.depth,
      title: research.name,
      branch: research.branch ?? research.name,
      gate: gateVisible ? research : undefined,
      items,
      children,
    };
  }

  const rootBranchesByVector = new Map<DevelopmentVectorKey, ProgressionMapBranch[]>();

  for (const research of (childResearchIds.get(undefined) ?? [])
    .map(id => researchById.get(id))
    .filter((node): node is ResolvedResearch => Boolean(node))
    .sort(compareResearch)) {
    const branch = buildBranch(research);
    if (!branch) continue;
    rootBranchesByVector.set(branch.vector, [...(rootBranchesByVector.get(branch.vector) ?? []), branch]);
  }

  for (const item of itemsByOwnerId.get(undefined) ?? []) {
    const vector = getNodeVector(item, undefined);
    const startBranch: ProgressionMapBranch = {
      id: `start:${vector}`,
      vector,
      depth: 0,
      title: "Start",
      branch: "Start",
      items: [item],
      children: [],
    };
    const existing = rootBranchesByVector.get(vector)?.find(branch => branch.id === startBranch.id);
    if (existing) {
      existing.items.push(item);
      existing.items.sort(compareItems);
    } else {
      rootBranchesByVector.set(vector, [startBranch, ...(rootBranchesByVector.get(vector) ?? [])]);
    }
  }

  return PROGRESSION_VECTOR_ORDER.map(vector => ({
    vector,
    branches: rootBranchesByVector.get(vector) ?? [],
  })).filter(lane => lane.branches.length);
}

export function getProgressionMapNodeKey(node: {kind: ProgressionNodeKind; id: string}) {
  return `${node.kind}:${node.id}`;
}

function getResearchParents(
  researchNodes: readonly ProgressionGraphNode[],
  nodesByKey: ReadonlyMap<string, ProgressionGraphNode>,
): ReadonlyMap<string, string | undefined> {
  const parentByResearchId = new Map<string, string | undefined>();
  const researchIds = new Set(researchNodes.map(node => node.id));

  for (const node of researchNodes) {
    const prerequisites = (node.requirements?.research ?? []).filter(id => {
      const prerequisite = nodesByKey.get(getProgressionMapNodeKey({kind: "research", id}));
      return researchIds.has(id) && prerequisite?.vector === node.vector;
    });
    const parent = prerequisites
      .map(id => nodesByKey.get(getProgressionMapNodeKey({kind: "research", id})))
      .filter((candidate): candidate is ProgressionGraphNode => Boolean(candidate))
      .sort((a, b) => getResearchSortHint(b) - getResearchSortHint(a) || a.name.localeCompare(b.name))[0];

    parentByResearchId.set(node.id, parent?.id);
  }

  return parentByResearchId;
}

function getResearchDepths(
  researchNodes: readonly ProgressionGraphNode[],
  parentByResearchId: ReadonlyMap<string, string | undefined>,
): ReadonlyMap<string, number> {
  const researchIds = new Set(researchNodes.map(node => node.id));
  const depths = new Map<string, number>();
  const visiting = new Set<string>();

  function resolve(id: string): number {
    const cached = depths.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;

    visiting.add(id);
    const parentId = parentByResearchId.get(id);
    const depth = parentId && researchIds.has(parentId) ? resolve(parentId) + 1 : 0;
    depths.set(id, depth);
    visiting.delete(id);
    return depth;
  }

  for (const node of researchNodes) {
    resolve(node.id);
  }

  return depths;
}

function getOwnerResearch(
  node: ProgressionGraphNode,
  researchById: ReadonlyMap<string, ResolvedResearch>,
): ResolvedResearch | undefined {
  return (node.requirements?.research ?? [])
    .map(id => researchById.get(id))
    .filter((candidate): candidate is ResolvedResearch => Boolean(candidate))
    .sort((a, b) => b.depth - a.depth || getResearchSortHint(b) - getResearchSortHint(a) || a.name.localeCompare(b.name))[0];
}

function getNodeVector(node: ProgressionGraphNode, ownerResearch: ProgressionGraphNode | undefined): DevelopmentVectorKey {
  return node.vector ?? ownerResearch?.vector ?? DEVELOPMENT_VECTORS.neutral;
}

function compareResearch(a: ResolvedResearch, b: ResolvedResearch): number {
  return getResearchSortHint(a) - getResearchSortHint(b)
    || (a.branch ?? "").localeCompare(b.branch ?? "")
    || a.name.localeCompare(b.name)
    || a.id.localeCompare(b.id);
}

function getResearchSortHint(node: ProgressionGraphNode): number {
  return node.level ?? 0;
}

function compareItems(a: ProgressionMapItem, b: ProgressionMapItem): number {
  return getKindSort(a.kind) - getKindSort(b.kind)
    || (a.level ?? 0) - (b.level ?? 0)
    || a.name.localeCompare(b.name)
    || a.id.localeCompare(b.id);
}

function getKindSort(kind: ProgressionNodeKind): number {
  if (kind === "building") return 1;
  if (kind === "structure") return 2;
  if (kind === "towerPart") return 3;
  return 0;
}

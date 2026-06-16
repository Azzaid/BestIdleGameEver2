import type {
  ProgressionEdge,
  ProgressionGraph,
  ProgressionNodeKind,
  ProgressionNodeRef,
  ProgressionRegistry,
  ProgressionRequirements,
  ProgressionRule,
} from "./types.ts";

export function contentRef(kind: ProgressionNodeKind, id: string): ProgressionNodeRef {
  return {kind, id};
}

export function unlocks(kind: ProgressionNodeKind, id: string) {
  return {
    fromStart(notes?: string): ProgressionRule {
      return {target: contentRef(kind, id), notes};
    },
    requires(requires: ProgressionRequirements, notes?: string): ProgressionRule {
      return {target: contentRef(kind, id), requires, notes};
    },
  };
}

export function defineProgression(rules: ProgressionRule[]): ProgressionRule[] {
  return rules;
}

export function getRuleForTarget(
  rules: readonly ProgressionRule[],
  kind: ProgressionNodeKind,
  id: string,
): ProgressionRule | undefined {
  return rules.find(rule => rule.target.kind === kind && rule.target.id === id);
}

export function getResearchRequirementsForTarget(
  rules: readonly ProgressionRule[],
  kind: ProgressionNodeKind,
  id: string,
): string[] {
  return getRuleForTarget(rules, kind, id)?.requires?.research ?? [];
}

export function getProgressionUnlockLabels(
  rules: readonly ProgressionRule[],
  registry: ProgressionRegistry,
  researchId: string,
): string[] {
  return rules
    .filter(rule => rule.requires?.research?.includes(researchId))
    .map(rule => getRegistryName(registry, rule.target))
    .filter((label): label is string => Boolean(label));
}

export function buildProgressionGraph(
  rules: readonly ProgressionRule[],
  registry: ProgressionRegistry,
): ProgressionGraph {
  const nodesByKey = new Map<string, ProgressionNodeRef>();
  const edges: ProgressionEdge[] = [];

  function addNode(ref: ProgressionNodeRef) {
    nodesByKey.set(getNodeKey(ref), ref);
  }

  function addEdge(from: ProgressionNodeRef, to: ProgressionNodeRef, kind: ProgressionEdge["kind"]) {
    addNode(from);
    addNode(to);
    edges.push({
      id: `${getNodeKey(from)}->${getNodeKey(to)}:${kind}`,
      from,
      to,
      kind,
    });
  }

  for (const id of Object.keys(registry.research)) {
    addNode(contentRef("research", id));
  }

  for (const id of Object.keys(registry.buildings)) {
    addNode(contentRef("building", id));
  }

  for (const id of Object.keys(registry.towerParts)) {
    addNode(contentRef("towerPart", id));
  }

  for (const id of Object.keys(registry.structures)) {
    addNode(contentRef("structure", id));
  }

  for (const rule of rules) {
    addNode(rule.target);

    for (const researchId of rule.requires?.research ?? []) {
      addEdge(contentRef("research", researchId), rule.target, "research");
    }

    for (const buildingId of rule.requires?.buildings ?? []) {
      addEdge(contentRef("building", buildingId), rule.target, "building");
    }

    for (const structureId of rule.requires?.structures ?? []) {
      addEdge(contentRef("structure", structureId), rule.target, "structure");
    }
  }

  return {
    nodes: [...nodesByKey.values()].map(node => ({
      ...node,
      name: getRegistryName(registry, node) ?? node.id,
    })),
    edges,
  };
}

export function validateProgressionGraph(
  rules: readonly ProgressionRule[],
  registry: ProgressionRegistry,
): string[] {
  const errors: string[] = [];
  const targetKeys = new Set<string>();

  for (const rule of rules) {
    const targetKey = getNodeKey(rule.target);

    if (targetKeys.has(targetKey)) {
      errors.push(`Duplicate progression rule for ${targetKey}.`);
    }
    targetKeys.add(targetKey);

    if (!getRegistryName(registry, rule.target)) {
      errors.push(`Unknown progression target ${targetKey}.`);
    }

    for (const researchId of rule.requires?.research ?? []) {
      if (!registry.research[researchId]) {
        errors.push(`${targetKey} requires unknown research:${researchId}.`);
      }
    }

    for (const buildingId of rule.requires?.buildings ?? []) {
      if (!registry.buildings[buildingId]) {
        errors.push(`${targetKey} requires unknown building:${buildingId}.`);
      }
    }

    for (const structureId of rule.requires?.structures ?? []) {
      if (!registry.structures[structureId]) {
        errors.push(`${targetKey} requires unknown structure:${structureId}.`);
      }
    }
  }

  return errors;
}

function getNodeKey(ref: ProgressionNodeRef): string {
  return `${ref.kind}:${ref.id}`;
}

function getRegistryName(registry: ProgressionRegistry, ref: ProgressionNodeRef): string | undefined {
  if (ref.kind === "research") return registry.research[ref.id];
  if (ref.kind === "building") return registry.buildings[ref.id];
  if (ref.kind === "towerPart") return registry.towerParts[ref.id];
  return registry.structures[ref.id];
}

import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";

export const prereqsOf = (n: ResearchNodeData) => {
    const list: string[] = [];
    if (n.parentId) list.push(n.parentId);
    if (n.alsoRequires?.length) list.push(...n.alsoRequires);
    return list;
};

export const isUnlocked = (n: ResearchNodeData, purchased: Set<string>) =>
    prereqsOf(n).every(id => purchased.has(id));

export const anyMet = (n: ResearchNodeData, purchased: Set<string>) =>
    prereqsOf(n).some(id => purchased.has(id));
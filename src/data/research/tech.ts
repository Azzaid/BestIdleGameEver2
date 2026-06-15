import type {ResearchDB} from "../../models/research/researchDB.ts";

export const techResearch: ResearchDB = {
  tech: {
    id: "tech",
    parentId: "root",
    name: "Tech Branch",
    vector: "tech",
    summary: "Start of technology.",
  },
  "copper-tools": {
    id: "copper-tools",
    parentId: "tech",
    name: "Copper Tools",
    vector: "tech",
    summary: "Basic tools.",
  },
  "basic-circuits": {
    id: "basic-circuits",
    parentId: "tech",
    name: "Basic Circuits",
    vector: "tech",
    summary: "Tiny brains.",
  },
  "precision-fabrication": {
    id: "precision-fabrication",
    parentId: "basic-circuits",
    name: "Precision Fabrication",
    vector: "tech",
    summary: "Unlock high-tech component production and refined machine parts.",
  },
  "automation-i": {
    id: "automation-i",
    parentId: "tech",
    name: "Automation I",
    vector: "tech",
    summary: "First tier automation.",
    alsoRequires: ["copper-tools", "basic-circuits"],
  },
};

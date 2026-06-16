import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const techResearch: ResearchDB = {
  [technologies.tech.branch]: {
    id: technologies.tech.branch,
    parentId: technologies.medieval.root,
    name: "Tech Branch",
    vector: "tech",
    summary: "Start of technology.",
  },
  [technologies.tech.copperTools]: {
    id: technologies.tech.copperTools,
    parentId: technologies.tech.branch,
    name: "Copper Tools",
    vector: "tech",
    summary: "Basic tools.",
  },
  [technologies.tech.basicCircuits]: {
    id: technologies.tech.basicCircuits,
    parentId: technologies.tech.branch,
    name: "Basic Circuits",
    vector: "tech",
    summary: "Tiny brains.",
  },
  [technologies.tech.precisionFabrication]: {
    id: technologies.tech.precisionFabrication,
    parentId: technologies.tech.basicCircuits,
    name: "Precision Fabrication",
    vector: "tech",
    summary: "Unlock high-tech component production and refined machine parts.",
  },
  [technologies.tech.automationI]: {
    id: technologies.tech.automationI,
    parentId: technologies.tech.branch,
    name: "Automation I",
    vector: "tech",
    summary: "First tier automation.",
    alsoRequires: [technologies.tech.copperTools, technologies.tech.basicCircuits],
  },
};

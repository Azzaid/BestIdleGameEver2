import {buildings, technologies} from "../../identificators/index.ts";
import {unlocks} from "../progression.ts";
import type {ProgressionRule} from "../types.ts";

export const NATURE_PROGRESSION_RULES: ProgressionRule[] = [
  unlocks("research", technologies.nature.seedGathering).requires({
    research: [technologies.medieval.foraging],
    structures: [buildings.medieval.stalkerHut],
    biodiversity: 1,
  }),
  unlocks("building", buildings.nature.wildGarden).requires({
    research: [technologies.nature.seedGathering],
    biodiversity: 1.25,
  }),
  unlocks("structure", buildings.nature.herbalistHut).requires({
    buildings: [buildings.nature.wildGarden],
    structures: [buildings.medieval.stalkerHut],
    biodiversity: 1.5,
  }),
  unlocks("research", technologies.nature.plantCultivation).requires({
    research: [technologies.nature.seedGathering],
    structures: [buildings.nature.herbalistHut],
    biodiversity: 2,
  }),
  unlocks("building", buildings.nature.field).requires({
    research: [technologies.nature.plantCultivation],
    biodiversity: 2.25,
  }),
];

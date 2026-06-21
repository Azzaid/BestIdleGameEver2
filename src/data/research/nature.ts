import type {ResearchDB} from "../../models/research/researchDB.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";
import {createTechnologyFactory} from "./technologyFactory.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../homogeneousValues";

const {technology} = createTechnologyFactory({
  defaultKeywords: ["nature"],
});

export const natureResearch: ResearchDB = {
  [technologies.nature.seedGathering]: technology(
    technologies.nature.seedGathering,
    technologies.medieval.foraging,
    "Seed Gathering",
    "Stalker hut routes begin preserving useful wild seeds for the future bio branch.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.stalkerHut),
      ],
    },
  ),
  [technologies.nature.plantCultivation]: technology(
    technologies.nature.plantCultivation,
    technologies.nature.seedGathering,
    "Plant Cultivation",
    "The settlement learns to deliberately grow and use plants.",
    {
      requirements: [
        requires.buildingExists(buildings.nature.herbalistHut),
      ],
    },
  ),
    [technologies.nature.mushrooms]: technology(
        technologies.nature.mushrooms,
        technologies.nature.seedGathering,
        "Mushrooms",
        "After the fall mushrooms became much more aggressive and sinister",
        {
            requirements: [
                requires.buildingExists(buildings.nature.herbalistHut),
            ],
        },
    ),
    [technologies.nature.threes]: technology(
        technologies.nature.threes,
        technologies.nature.seedGathering,
        "Threes",
        "Some threes are no longer what they seem to be. Some of them even bleed.",
        {
            requirements: [
                requires.buildingExists(buildings.nature.herbalistHut),
            ],
        },
    ),
    [technologies.nature.animals]: technology(
        technologies.nature.animals,
        technologies.nature.seedGathering,
        "Animals",
        "Most of them where turned into monsters. But some can still be domesticated.",
        {
            requirements: [
                requires.buildingExists(buildings.nature.herbalistHut),
            ],
        },
    ),
    [technologies.nature.spores]: technology(
        technologies.nature.spores,
        technologies.nature.mushrooms,
        "Spores",
        "Certain mushrooms can emit clouds of spores and wind carry them for a great distances",
        {
            requirements: [
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceFungi, 2),
            ],
        },
    ),
    [technologies.nature.livingWood]: technology(
        technologies.nature.livingWood,
        technologies.nature.threes,
        "Living wood",
        "Certain sorts of trees grow incredibly fast and it feels like they follow commands.",
        {
            requirements: [
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourcePlants, 2),
            ],
        },
    ),
    [technologies.nature.tentacles]: technology(
        technologies.nature.tentacles,
        technologies.nature.animals,
        "Tentacles",
        "Some animals are malformed beyond recognition and use tentacles to attack everything they see. But they still can be used if you place them on the wall why they a still young.",
        {
            requirements: [
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceAnimals, 2),
            ],
        },
    ),
};

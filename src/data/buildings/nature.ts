import type { Building } from "../../models/city/Building.ts";
import { DEVELOPMENT_VECTORS } from "../../models/DevlopmentVector.ts";
import { UPKEEP_TYPES } from "../../models/Upkeep.ts";
import { buildings, technologies } from "../identificators/index.ts";
import { requires } from "../requirements.ts";
import { createBuildingFactory } from "./buildingFactory.ts";
import {citySignatureToHomogeneousValueEffect, upkeepAmountToHomogeneousValueEffects} from "../../models/homogeneousValueAdapters.ts";
const { building: bioBuilding, superstructure: bioSuperstructure, } = createBuildingFactory({
    vector: DEVELOPMENT_VECTORS.nature,
    defaultKeywords: ["nature"],
});
const natureBuildingsRaw: {
    [key: string]: Building;
} = {
    [buildings.nature.wildGarden]: {
        ...bioBuilding(buildings.nature.wildGarden, "Wild Garden", "A small garden with wild inedible and strange plants.", ["plants"], {
            requirements: [
                requires.technologyUnlocked(technologies.nature.seedGathering),
            ],
            values: [
                ...citySignatureToHomogeneousValueEffect(2)
            ]
        }),
    },
    [buildings.nature.herbalistHut]: bioSuperstructure(buildings.nature.herbalistHut, "Herbalist Hut", "A stalker hut and wild garden combined into a place study gathered plants.", ["production", "plants"], {
        requiredBuildingIds: [
            buildings.nature.wildGarden,
            buildings.medieval.stalkerHut,
        ],
        requirements: [
            requires.buildingExists(buildings.nature.wildGarden),
            requires.buildingExists(buildings.medieval.stalkerHut),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 3 }, "production"),
            ...citySignatureToHomogeneousValueEffect(5)
        ]
    }),
    [buildings.nature.field]: {
        ...bioBuilding(buildings.nature.field, "Field", "A planned growing field for deliberate plant cultivation.", ["farm", "boost"], {
            requirements: [
                requires.technologyUnlocked(technologies.nature.plantCultivation),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 1 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(4)
            ]
        }),
        effects: [
            {
                radius: 1,
                requiredBuildingKeywords: [],
                requiredValueKeywords: ["resource", "people"],
                multiplier: 1.25,
            },
        ],
        adjacencyDescription: "Neighboring buildings can sustain 25% more people.",
    },
    [buildings.nature.mycelium]: {
        ...bioBuilding(buildings.nature.mycelium, "Mycelium", "Part of wild mycelium. Interesting what it can grow into.", ["fungi", "boost"], {
            requirements: [
                requires.technologyUnlocked(technologies.nature.mushrooms),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.fungi]: 1 }, "production"),
                ...citySignatureToHomogeneousValueEffect(4)
            ]
        }),
        effects: [
            {
                radius: 1,
                requiredBuildingKeywords: ["fungi"],
                requiredValueKeywords: ["fungi"],
                multiplier: 1.25,
            },
        ],
        adjacencyDescription: "Neighboring fungi get stronger",
    },
    [buildings.nature.saplings]: {
        ...bioBuilding(buildings.nature.saplings, "Saplings", "Field of saplings growing in the wild. They are not very tall, but they are very strong.", ["plants", "boost"], {
            requirements: [
                requires.technologyUnlocked(technologies.nature.threes),
            ],
            values: [
                ...citySignatureToHomogeneousValueEffect(4)
            ]
        }),
        effects: [
            {
                radius: 1,
                requiredBuildingKeywords: ["plants"],
                requiredValueKeywords: ["plants"],
                multiplier: 1.25,
            },
        ],
        adjacencyDescription: "Neighboring plants get stronger",
    },
    [buildings.nature.meadow]: {
        ...bioBuilding(buildings.nature.meadow, "Meadow", "A small meadow full of small wild animals.", ["animals", "boost"], {
            requirements: [
                requires.technologyUnlocked(technologies.nature.animals),
            ],
            values: [
                ...citySignatureToHomogeneousValueEffect(4)
            ]
        }),
        effects: [
            {
                radius: 1,
                requiredBuildingKeywords: ["animals"],
                requiredValueKeywords: ["animals"],
                multiplier: 1.25,
            },
        ],
        adjacencyDescription: "Neighboring animals get stronger",
    },
};
export const natureBuildings: {
    [key: string]: Building;
} = Object.fromEntries(Object.values(natureBuildingsRaw).map(building => [building.id, building]));

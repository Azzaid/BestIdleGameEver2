import type { Building } from "../../models/city/Building.ts";
import { DEVELOPMENT_VECTORS } from "../../models/DevlopmentVector.ts";
import { UPKEEP_TYPES } from "../../models/Upkeep.ts";
import { buildings, technologies } from "../identificators/index.ts";
import { requires } from "../requirements.ts";
import { createBuildingFactory } from "./buildingFactory.ts";
import {citySignatureToHomogeneousValueEffect, upkeepAmountToHomogeneousValueEffects} from "../../models/homogeneousValueAdapters.ts";
const { building, superstructure } = createBuildingFactory({
    vector: DEVELOPMENT_VECTORS.medieval,
    defaultKeywords: ["medieval"],
});
const medievalBuildingsRaw: {
    [key: string]: Building;
} = {
    [buildings.medieval.shelter]: {
        ...building(buildings.medieval.shelter, "Shelter", "A rough first home that makes organized foraging possible.", ["production", "people", "housing"], {
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 3 }, "production"),
                ...citySignatureToHomogeneousValueEffect(4)
            ]
        }),
    },
    [buildings.medieval.scrapCollectionPoint]: {
        ...building(buildings.medieval.scrapCollectionPoint, "Scrap Collection Point", "A sorting yard for salvaged tools, hollow trunks, fittings, and other early supplies.", ["production", "gold", "scavenger"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.foraging),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 1 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 2 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(2)
            ]
        }),
    },
    [buildings.medieval.stalkerHut]: superstructure(buildings.medieval.stalkerHut, "Stalker Hut", "Hut of an experienced stalker that can go further and bring more than just scraps.", ["production", "people", "gold", "scavenger"], {
        hint: "Basically a shelter and some place to drop scavenged supplies.",
        requiredBuildingIds: [
            buildings.medieval.shelter,
            buildings.medieval.scrapCollectionPoint,
        ],
        requirements: [
            requires.buildingExists(buildings.medieval.shelter),
            requires.buildingExists(buildings.medieval.scrapCollectionPoint),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 5, [UPKEEP_TYPES.gold]: 3 }, "production"),
            ...citySignatureToHomogeneousValueEffect(5)
        ]
    }),
    [buildings.medieval.toolShed]: {
        ...building(buildings.medieval.toolShed, "Tool Shed", "A cramped rack of repaired scrap tools sturdy enough for repeat work.", ["production", "gold", "tools"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.scrapTools),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 1 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(3)
            ]
        }),
    },
    [buildings.medieval.lumberjackHouse]: superstructure(buildings.medieval.lumberjackHouse, "Lumberjack House", "A stalker hut and tool shed combined for reliable timber work.", ["production", "people", "gold", "wood", "timberwork"], {
        hint: "Stalker could gather some quality wood with good tools.",
        requiredBuildingIds: [
            buildings.medieval.toolShed,
            buildings.medieval.stalkerHut,
        ],
        requirements: [
            requires.buildingExists(buildings.medieval.toolShed),
            requires.buildingExists(buildings.medieval.stalkerHut),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 5 }, "production"),
            ...citySignatureToHomogeneousValueEffect(10)
        ]
    }),
    [buildings.medieval.farm]: superstructure(buildings.medieval.farm, "Farm", "A house with a fields around. Peacefull and happy.", ["production", "people", "plants", "gold", "farm"], {
        hint: "What if we add some space to grow plants?",
        requiredBuildingIds: [
            buildings.medieval.woodenHouse,
            buildings.nature.field,
        ],
        requirements: [
            requires.buildingExists(buildings.nature.field),
            requires.buildingExists(buildings.medieval.woodenHouse),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 10, [UPKEEP_TYPES.gold]: 3 }, "production"),
            ...citySignatureToHomogeneousValueEffect(7)
        ]
    }),
    [buildings.medieval.woodenHouse]: {
        ...building(buildings.medieval.woodenHouse, "Wooden House", "Real walls, a dry roof, and enough stability to grow the population.", ["production", "people", "wood", "housing"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.timberProcessing),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 7 }, "production"),
                ...citySignatureToHomogeneousValueEffect(10)
            ]
        }),
    },
    [buildings.medieval.craftsmansHouse]: superstructure(buildings.medieval.craftsmansHouse, "Craftsman's House", "A wooden house and tool shed that support woodworking and stoneworking.", ["production", "people", "gold", "craft", "woodWorking", "stoneWorking"], {
        hint: "What if we add some tools to work with?",
        requiredBuildingIds: [
            buildings.medieval.woodenHouse,
            buildings.medieval.toolShed,
        ],
        requirements: [
            requires.buildingExists(buildings.medieval.woodenHouse),
            requires.buildingExists(buildings.medieval.toolShed),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 5, [UPKEEP_TYPES.gold]: 2 }, "production"),
            ...citySignatureToHomogeneousValueEffect(10)
        ]
    }),
    [buildings.medieval.market]: building(buildings.medieval.market, "Market", "A trading and social center where merchants, labor, favors, salvage, and coin become one economy.", ["production", "gold", "market"], {
        requirements: [
            requires.buildingExists(buildings.medieval.farm),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 25 }, "production"),
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 10 }, "upkeep"),
            ...citySignatureToHomogeneousValueEffect(16)
        ]
    }),
    [buildings.medieval.stoneHouse]: {
        ...building(buildings.medieval.stoneHouse, "Stone House", "Durable housing that supports people and gold while keeping city signature lower than wood.", ["production", "people", "gold", "housing"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.stoneworking),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 10, }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 1 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(7)
            ]
        }),
    },
    [buildings.medieval.university]: superstructure(buildings.medieval.university, "University", "A civic center for science", ["science", "naturalSciences"], {
        hint: "What if we gather rich people with good housing together?",
        requiredBuildingIds: [
            buildings.medieval.stoneHouse,
            buildings.medieval.stoneHouse,
            buildings.medieval.stoneHouse,
        ],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.stoneworking),
            requires.buildingExists(buildings.medieval.stoneHouse),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 15, [UPKEEP_TYPES.gold]: 50 }, "upkeep"),
            ...citySignatureToHomogeneousValueEffect(26)
        ]
    }),
    //After this line buildings are not yet refined and mostly are placeholders
    [buildings.medieval.workshop]: {
        ...building(buildings.medieval.workshop, "Workshop", "A focused craft building that improves nearby production but disrupts Aether work.", ["production", "gold", "craft"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.engineering),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 7 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.gold]: 3 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(22)
            ]
        }),
        adjacencyDescription: "+25% production in adjacent buildings; -25% Aether production in adjacent buildings.",
    },
    [buildings.medieval.engineersHouse]: superstructure(buildings.medieval.engineersHouse, "Engineer's House", "A workshop and stone house combined into an engineering household.", ["production", "people", "gold", "craft"], {
        requiredBuildingIds: [
            buildings.medieval.stoneHouse,
            buildings.medieval.workshop,
        ],
        requirements: [
            requires.buildingExists(buildings.medieval.workshop),
            requires.buildingExists(buildings.medieval.stoneHouse),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.gold]: 10 }, "production"),
            ...citySignatureToHomogeneousValueEffect(24)
        ]
    }),
    [buildings.medieval.barracks]: building(buildings.medieval.barracks, "Barracks", "Consumes gold to send patrols outside the city and reduce city signature.", ["defense", "visibility"], {
        requirements: [
            requires.technologyUnlocked(technologies.medieval.fortification),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 4 }, "upkeep"),
            ...citySignatureToHomogeneousValueEffect(20)
        ]
    }),
    [buildings.medieval.barn]: {
        ...building(buildings.medieval.barn, "Barn", "Reduces people requirements of adjacent buildings.", ["support", "farm"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.animalHusbandry),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 1 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(12)
            ]
        }),
        adjacencyDescription: "Adjacent buildings require fewer People.",
    },
    [buildings.medieval.tradeStation]: {
        ...building(buildings.medieval.tradeStation, "Trade Station", "Extends the reach of adjacency bonuses and opens the way to organized trade.", ["support", "market"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.horses),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.gold]: 3 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(18)
            ]
        }),
        adjacencyDescription: "Adjacency bonuses affect buildings at +1 range.",
    },
    [buildings.medieval.stable]: superstructure(buildings.medieval.stable, "Stable", "A barn and farm organized around horses.", ["support", "farm"], {
        requiredBuildingIds: [
            buildings.medieval.barn,
            buildings.medieval.farm,
        ],
        requirements: [
            requires.buildingExists(buildings.medieval.barn),
            requires.buildingExists(buildings.medieval.farm),
        ],
        values: [
            ...citySignatureToHomogeneousValueEffect(18)
        ]
    }),
    [buildings.medieval.shop]: {
        ...building(buildings.medieval.shop, "Shop", "A dedicated commercial building that produces gold.", ["production", "gold", "market"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.trade),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 6 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 3 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(16)
            ]
        }),
    },
    [buildings.medieval.tradingStation]: superstructure(buildings.medieval.tradingStation, "Trading Station", "A shop and trade station combined into caravan infrastructure.", ["production", "gold", "market"], {
        requiredBuildingIds: [
            buildings.medieval.tradeStation,
            buildings.medieval.shop,
        ],
        requirements: [
            requires.buildingExists(buildings.medieval.shop),
            requires.buildingExists(buildings.medieval.tradeStation),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 8 }, "production"),
            ...citySignatureToHomogeneousValueEffect(24)
        ]
    }),
    [buildings.medieval.chemicalStorage]: {
        ...building(buildings.medieval.chemicalStorage, "Chemical Storage", "A careful stockpile for reactive ingredients needed by alchemy.", ["infrastructure", "laboratory"], {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.naturalPhilosophy),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 4 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(24)
            ]
        }),
    },
    [buildings.medieval.alchemicalLaboratory]: superstructure(buildings.medieval.alchemicalLaboratory, "Alchemical Laboratory", "Chemical storage and stone housing arranged for gunpowder work.", ["infrastructure", "laboratory"], {
        requiredBuildingIds: [
            buildings.medieval.stoneHouse,
            buildings.medieval.chemicalStorage,
        ],
        requirements: [
            requires.buildingExists(buildings.medieval.chemicalStorage),
            requires.buildingExists(buildings.medieval.stoneHouse),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 4, [UPKEEP_TYPES.gold]: 5 }, "upkeep"),
            ...citySignatureToHomogeneousValueEffect(28)
        ]
    }),
};
export const medievalBuildings: {
    [key: string]: Building;
} = Object.fromEntries(Object.values(medievalBuildingsRaw).map(building => [building.id, building]));

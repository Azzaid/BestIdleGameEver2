import type {ResearchDB} from "../../models/research/researchDB.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";

export const medievalResearch: ResearchDB = {
  [technologies.medieval.root]: {
    id: technologies.medieval.root,
    parentId: null,
    name: "Shelter",
    vector: "medieval",
    summary: "A first foothold inside the walls.",
  },
  [technologies.medieval.foraging]: {
    id: technologies.medieval.foraging,
    parentId: technologies.medieval.root,
    name: "Foraging",
    vector: "medieval",
    summary: "Organize safe trips outside the shelter to find food, salvage, and useful hollow wood.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.root),
      requires.buildingExists(buildings.medieval.shelter),
    ],
  },
  [technologies.medieval.scrapTools]: {
    id: technologies.medieval.scrapTools,
    parentId: technologies.medieval.foraging,
    name: "Scrap Tools",
    vector: "medieval",
    summary: "Turn scavenged metal, lashings, wedges, and handles into repeatable tools.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.foraging),
      requires.buildingExists(buildings.medieval.stalkerHut),
    ],
  },
  [technologies.medieval.timberProcessing]: {
    id: technologies.medieval.timberProcessing,
    parentId: technologies.medieval.scrapTools,
    name: "Timber Processing",
    vector: "medieval",
    summary: "Shape reliable wood for houses and early wooden launchers.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.scrapTools),
      requires.buildingExists(buildings.medieval.lumberjackHouse),
    ],
  },
  [technologies.medieval.money]: {
    id: technologies.medieval.money,
    parentId: technologies.nature.plantCultivation,
    alsoRequires: [technologies.medieval.timberProcessing],
    name: "Money",
    vector: "medieval",
    summary: "Exchange value, payment, and early economic specialization grow from the first farm economy.",
    requirements: [
      requires.technologyUnlocked(technologies.nature.plantCultivation),
      requires.technologyUnlocked(technologies.medieval.timberProcessing),
      requires.buildingExists(buildings.medieval.farm),
    ],
  },
  [technologies.medieval.woodworking]: {
    id: technologies.medieval.woodworking,
    parentId: technologies.medieval.timberProcessing,
    name: "Woodworking",
    vector: "medieval",
    summary: "Workshop practice for crossbows, wheeled platforms, and palisades.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.timberProcessing),
      requires.buildingExists(buildings.medieval.craftsmansHouse),
    ],
  },
  [technologies.medieval.stoneworking]: {
    id: technologies.medieval.stoneworking,
    parentId: technologies.medieval.timberProcessing,
    name: "Stoneworking",
    vector: "medieval",
    summary: "Repeatable stone cutting, fitting, housing, and wall repair.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.timberProcessing),
      requires.buildingExists(buildings.medieval.craftsmansHouse),
    ],
  },
  [technologies.medieval.naturalPhilosophy]: {
    id: technologies.medieval.naturalPhilosophy,
    parentId: technologies.medieval.stoneworking,
    name: "Natural Philosophy",
    vector: "medieval",
    summary: "University study opens engineering, animal husbandry, and alchemy.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.stoneworking),
      requires.buildingExists(buildings.medieval.university),
    ],
  },
  [technologies.medieval.engineering]: {
    id: technologies.medieval.engineering,
    parentId: technologies.medieval.naturalPhilosophy,
    name: "Engineering",
    vector: "medieval",
    summary: "Practical building knowledge focused through the workshop.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.naturalPhilosophy),
    ],
  },
  [technologies.medieval.fortification]: {
    id: technologies.medieval.fortification,
    parentId: technologies.medieval.engineering,
    name: "Fortification",
    vector: "medieval",
    summary: "Bastions, fortress walls, and patrol infrastructure.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.engineering),
      requires.buildingExists(buildings.medieval.engineersHouse),
    ],
  },
  [technologies.medieval.ballistics]: {
    id: technologies.medieval.ballistics,
    parentId: technologies.medieval.engineering,
    name: "Ballistics",
    vector: "medieval",
    summary: "A future branch for advanced launchers and siege weapons.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.engineering),
      requires.buildingExists(buildings.medieval.engineersHouse),
    ],
  },
  [technologies.medieval.animalHusbandry]: {
    id: technologies.medieval.animalHusbandry,
    parentId: technologies.medieval.naturalPhilosophy,
    name: "Animal Husbandry",
    vector: "medieval",
    summary: "Barns, stables, horses, and the support economy around them.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.naturalPhilosophy),
    ],
  },
  [technologies.medieval.horses]: {
    id: technologies.medieval.horses,
    parentId: technologies.medieval.animalHusbandry,
    name: "Horses",
    vector: "medieval",
    summary: "Horse drives and trade stations improve movement and logistics.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.animalHusbandry),
      requires.buildingExists(buildings.medieval.stable),
    ],
  },
  [technologies.medieval.trade]: {
    id: technologies.medieval.trade,
    parentId: technologies.medieval.horses,
    name: "Trade",
    vector: "medieval",
    summary: "Shops and dedicated loaders emerge from organized trade.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.horses),
      requires.buildingExists(buildings.medieval.tradeStation),
    ],
  },
  [technologies.medieval.caravans]: {
    id: technologies.medieval.caravans,
    parentId: technologies.medieval.trade,
    name: "Caravans",
    vector: "medieval",
    summary: "Migration transfers part of free support.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.trade),
      requires.buildingExists(buildings.medieval.tradingStation),
    ],
  },
  [technologies.medieval.alchemy]: {
    id: technologies.medieval.alchemy,
    parentId: technologies.medieval.naturalPhilosophy,
    name: "Alchemy",
    vector: "medieval",
    summary: "Chemical storage and laboratory practice prepare the way for gunpowder.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.naturalPhilosophy),
    ],
  },
  [technologies.medieval.gunpowder]: {
    id: technologies.medieval.gunpowder,
    parentId: technologies.medieval.alchemy,
    name: "Gunpowder",
    vector: "medieval",
    summary: "Explosive chambers and bombs enter the tower arsenal when matching art exists.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.alchemy),
      requires.buildingExists(buildings.medieval.alchemicalLaboratory),
    ],
  },
};

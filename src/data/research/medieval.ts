import type {ResearchDB} from "../../models/research/researchDB.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";
import {createTechnologyFactory} from "./technologyFactory.ts";

const {technology} = createTechnologyFactory({
  defaultKeywords: ["medieval"],
});

export const medievalResearch: ResearchDB = {
  [technologies.medieval.root]: technology(
    technologies.medieval.root,
    null,
    "Shelter",
    "A first foothold inside the walls.",
  ),
  [technologies.medieval.foraging]: technology(
    technologies.medieval.foraging,
    technologies.medieval.root,
    "Foraging",
    "Organize safe trips outside the shelter to find food, salvage, and useful hollow wood.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.shelter),
      ],
    },
  ),
  [technologies.medieval.scrapTools]: technology(
    technologies.medieval.scrapTools,
    technologies.medieval.foraging,
    "Scrap Tools",
    "Turn scavenged metal, lashings, wedges, and handles into repeatable tools.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.stalkerHut),
      ],
    },
  ),
  [technologies.medieval.timberProcessing]: technology(
    technologies.medieval.timberProcessing,
    technologies.medieval.scrapTools,
    "Timber Processing",
    "Shape reliable wood for houses and early wooden launchers.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.lumberjackHouse),
      ],
    },
  ),
  [technologies.medieval.money]: technology(
    technologies.medieval.money,
    technologies.nature.plantCultivation,
    "Money",
    "Exchange value, payment, and early economic specialization grow from the first farm economy.",
    {
      alsoRequires: [technologies.medieval.timberProcessing],
      requirements: [
        requires.buildingExists(buildings.medieval.farm),
      ],
    },
  ),
  [technologies.medieval.craftsmanship]: technology(
    technologies.medieval.craftsmanship,
    technologies.medieval.scrapTools,
    "Craftsmanship",
    "We ara no longer need to stare in ave at things from the old world. We can now craft.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.craftsmansHouse),
      ],
    },
  ),
  [technologies.medieval.woodworking]: technology(
    technologies.medieval.woodworking,
    technologies.medieval.craftsmanship,
    "Woodworking",
    "Workshop practice for crossbows, wheeled platforms, and palisades.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.craftsmansHouse),
      ],
    },
  ),
  [technologies.medieval.stoneworking]: technology(
    technologies.medieval.stoneworking,
    technologies.medieval.craftsmanship,
    "Stoneworking",
    "Repeatable stone cutting, fitting, housing, and wall repair.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.craftsmansHouse),
      ],
    },
  ),
  [technologies.medieval.naturalPhilosophy]: technology(
    technologies.medieval.naturalPhilosophy,
    technologies.medieval.craftsmanship,
    "Natural Philosophy",
    "University study opens engineering, animal husbandry, and alchemy.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.university),
      ],
    },
  ),
  [technologies.medieval.engineering]: technology(
    technologies.medieval.engineering,
    technologies.medieval.naturalPhilosophy,
    "Engineering",
    "Practical building knowledge focused through the workshop.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.university),
      ],
    },
  ),
  [technologies.medieval.fortification]: technology(
    technologies.medieval.fortification,
    technologies.medieval.engineering,
    "Fortification",
    "Bastions, fortress walls, and patrol infrastructure.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.engineersHouse),
      ],
    },
  ),
  [technologies.medieval.ballistics]: technology(
    technologies.medieval.ballistics,
    technologies.medieval.engineering,
    "Ballistics",
    "A future branch for advanced launchers and siege weapons.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.engineersHouse),
      ],
    },
  ),
  [technologies.medieval.animalHusbandry]: technology(
    technologies.medieval.animalHusbandry,
    technologies.medieval.naturalPhilosophy,
    "Animal Husbandry",
    "Barns, stables, horses, and the support economy around them.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.university),
      ],
    },
  ),
  [technologies.medieval.horses]: technology(
    technologies.medieval.horses,
    technologies.medieval.animalHusbandry,
    "Horses",
    "Horse drives and trade stations improve movement and logistics.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.stable),
      ],
    },
  ),
  [technologies.medieval.trade]: technology(
    technologies.medieval.trade,
    technologies.medieval.horses,
    "Trade",
    "Shops and dedicated loaders emerge from organized trade.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.tradeStation),
      ],
    },
  ),
  [technologies.medieval.caravans]: technology(
    technologies.medieval.caravans,
    technologies.medieval.trade,
    "Caravans",
    "Migration transfers part of free support.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.tradingStation),
      ],
    },
  ),
  [technologies.medieval.alchemy]: technology(
    technologies.medieval.alchemy,
    technologies.medieval.naturalPhilosophy,
    "Alchemy",
    "Chemical storage and laboratory practice prepare the way for gunpowder.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.university),
      ],
    },
  ),
  [technologies.medieval.gunpowder]: technology(
    technologies.medieval.gunpowder,
    technologies.medieval.alchemy,
    "Gunpowder",
    "Explosive chambers and bombs enter the tower arsenal when matching art exists.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.alchemicalLaboratory),
      ],
    },
  ),
};

import {buildings, gunparts, technologies} from "../../identificators/index.ts";
import {unlocks} from "../progression.ts";
import type {ProgressionRule} from "../types.ts";

export const MEDIEVAL_PROGRESSION_RULES: ProgressionRule[] = [
  unlocks("research", technologies.medieval.root).fromStart(),
  unlocks("building", buildings.medieval.shelter).fromStart(),

  unlocks("towerPart", gunparts.ammo.medieval.stoneBasket).fromStart(),
  unlocks("towerPart", gunparts.launchSystems.medieval.crudeSling).fromStart(),

    unlocks("towerPart", gunparts.barrels.medieval.hollowedTrunk).requires({
        research: [technologies.medieval.foraging],
        buildings: [buildings.medieval.scrapCollectionPoint],
    }),

  unlocks("research", technologies.medieval.foraging).requires({
    research: [technologies.medieval.root],
    buildings: [buildings.medieval.shelter],
  }),
  unlocks("building", buildings.medieval.scrapCollectionPoint).requires({
    research: [technologies.medieval.foraging],
  }),
  unlocks("structure", buildings.medieval.stalkerHut).requires({
    buildings: [buildings.medieval.shelter, buildings.medieval.scrapCollectionPoint],
  }),
  unlocks("research", technologies.medieval.scrapTools).requires({
    research: [technologies.medieval.foraging],
    structures: [buildings.medieval.stalkerHut],
  }),
  unlocks("building", buildings.medieval.toolShed).requires({
    research: [technologies.medieval.scrapTools],
  }),

  unlocks("research", technologies.medieval.timberProcessing).requires({
    research: [technologies.medieval.scrapTools],
    structures: [buildings.medieval.lumberjackHouse],
  }),
  unlocks("structure", buildings.medieval.lumberjackHouse).requires({
    buildings: [buildings.medieval.toolShed],
    structures: [buildings.medieval.stalkerHut],
  }),
  unlocks("building", buildings.medieval.woodenHouse).requires({
    research: [technologies.medieval.timberProcessing],
  }),
  unlocks("structure", buildings.medieval.farm).requires({
    buildings: [buildings.nature.field, buildings.medieval.woodenHouse],
  }),
  unlocks("research", technologies.medieval.money).requires({
    research: [technologies.nature.plantCultivation, technologies.medieval.timberProcessing],
    structures: [buildings.medieval.farm],
  }),
  unlocks("building", buildings.medieval.market).requires({
    structures: [buildings.medieval.farm],
  }),
  unlocks("structure", buildings.medieval.craftsmansHouse).requires({
    buildings: [buildings.medieval.woodenHouse, buildings.medieval.toolShed],
  }),
  unlocks("research", technologies.medieval.woodworking).requires({
    research: [technologies.medieval.timberProcessing],
    structures: [buildings.medieval.craftsmansHouse],
  }),
  unlocks("research", technologies.medieval.stoneworking).requires({
    research: [technologies.medieval.timberProcessing],
    structures: [buildings.medieval.craftsmansHouse],
  }),
  unlocks("building", buildings.medieval.stoneHouse).requires({
    research: [technologies.medieval.stoneworking],
  }),
  unlocks("building", buildings.medieval.university).requires({
    research: [technologies.medieval.stoneworking],
    buildings: [buildings.medieval.stoneHouse, buildings.medieval.stoneHouse, buildings.medieval.stoneHouse],
  }),

  unlocks("research", technologies.medieval.naturalPhilosophy).requires({
    research: [technologies.medieval.stoneworking],
    buildings: [buildings.medieval.university],
  }),
  unlocks("research", technologies.medieval.engineering).requires({
    research: [technologies.medieval.naturalPhilosophy],
  }),
  unlocks("building", buildings.medieval.workshop).requires({
    research: [technologies.medieval.engineering],
  }),
  unlocks("structure", buildings.medieval.engineersHouse).requires({
    buildings: [buildings.medieval.workshop, buildings.medieval.stoneHouse],
  }),
  unlocks("research", technologies.medieval.fortification).requires({
    research: [technologies.medieval.engineering],
    structures: [buildings.medieval.engineersHouse],
  }),
  unlocks("building", buildings.medieval.barracks).requires({
    research: [technologies.medieval.fortification],
  }),
  unlocks("research", technologies.medieval.ballistics).requires({
    research: [technologies.medieval.engineering],
    structures: [buildings.medieval.engineersHouse],
  }),

  unlocks("research", technologies.medieval.animalHusbandry).requires({
    research: [technologies.medieval.naturalPhilosophy],
  }),
  unlocks("building", buildings.medieval.barn).requires({
    research: [technologies.medieval.animalHusbandry],
  }),
  unlocks("structure", buildings.medieval.stable).requires({
    buildings: [buildings.medieval.barn],
    structures: [buildings.medieval.farm],
  }),
  unlocks("research", technologies.medieval.horses).requires({
    research: [technologies.medieval.animalHusbandry],
    structures: [buildings.medieval.stable],
  }),
  unlocks("building", buildings.medieval.tradeStation).requires({
    research: [technologies.medieval.horses],
  }),
  unlocks("research", technologies.medieval.trade).requires({
    research: [technologies.medieval.horses],
    buildings: [buildings.medieval.tradeStation],
  }),
  unlocks("building", buildings.medieval.shop).requires({
    research: [technologies.medieval.trade],
  }),
  unlocks("structure", buildings.medieval.tradingStation).requires({
    buildings: [buildings.medieval.shop, buildings.medieval.tradeStation],
  }),
  unlocks("research", technologies.medieval.caravans).requires({
    research: [technologies.medieval.trade],
    structures: [buildings.medieval.tradingStation],
  }),

  unlocks("research", technologies.medieval.alchemy).requires({
    research: [technologies.medieval.naturalPhilosophy],
  }),
  unlocks("building", buildings.medieval.chemicalStorage).requires({
    research: [technologies.medieval.naturalPhilosophy],
  }),
  unlocks("structure", buildings.medieval.alchemicalLaboratory).requires({
    buildings: [buildings.medieval.chemicalStorage, buildings.medieval.stoneHouse],
  }),
  unlocks("research", technologies.medieval.gunpowder).requires({
    research: [technologies.medieval.alchemy],
    structures: [buildings.medieval.alchemicalLaboratory],
  }),
];

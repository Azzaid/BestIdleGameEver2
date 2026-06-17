import {buildings, gunparts, technologies} from "../identificators/index.ts";
import {defineProgression, unlocks} from "./progression.ts";

export const PROGRESSION_RULES = defineProgression([
  unlocks("research", technologies.medieval.root).fromStart(),
  unlocks("building", buildings.medieval.shelter).fromStart(),
  unlocks("towerPart", gunparts.bases.medieval.crudeWoodFrame).fromStart(),
  unlocks("towerPart", gunparts.ammo.medieval.stoneBasket).fromStart(),
  unlocks("towerPart", gunparts.launchSystems.medieval.crudeSling).fromStart(),

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
  unlocks("research", technologies.medieval.scrapTools).requires({
    research: [technologies.medieval.foraging],
    structures: [buildings.medieval.stalkerHut],
  }),
  unlocks("research", technologies.aether.wickedItems).requires({
    research: [technologies.medieval.foraging],
    structures: [buildings.medieval.stalkerHut],
    aetherAtmosphere: {veil: 1},
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

  unlocks("research", technologies.aether.mysticism).requires({
    structures: [buildings.aether.shamanHut],
    aetherAtmosphere: {veil: 2},
  }),
  unlocks("building", buildings.aether.dolmen).requires({
    research: [technologies.aether.wickedItems],
    aetherAtmosphere: {veil: 1},
  }),
  unlocks("structure", buildings.aether.shamanHut).requires({
    buildings: [buildings.aether.dolmen],
    structures: [buildings.medieval.stalkerHut],
    aetherAtmosphere: {veil: 2},
  }),
  unlocks("research", technologies.aether.magicStones).requires({
    research: [technologies.aether.mysticism],
    aetherAtmosphere: {veil: 2},
  }),
  unlocks("building", buildings.aether.wardedHome).requires({
    research: [technologies.aether.magicStones],
    aetherAtmosphere: {veil: 2},
  }),
  unlocks("structure", buildings.aether.runedHouse).requires({
    buildings: [buildings.aether.wardedHome, buildings.aether.dolmen],
    aetherAtmosphere: {veil: 2, manaFlows: 1},
  }),
  unlocks("structure", buildings.aether.coven).requires({
    structures: [buildings.aether.runedHouse, buildings.aether.runedHouse],
    aetherAtmosphere: {veil: 3, manaFlows: 2},
  }),
  unlocks("research", technologies.aether.mysticalCommand).requires({
    research: [technologies.aether.mysticism],
    structures: [buildings.aether.coven],
    aetherAtmosphere: {manaFlows: 2},
  }),
  unlocks("building", buildings.aether.obelisk).requires({
    research: [technologies.aether.mysticalCommand],
    aetherAtmosphere: {manaFlows: 2},
  }),
  unlocks("research", technologies.aether.mysticalFriendship).requires({
    research: [technologies.aether.mysticism],
    structures: [buildings.aether.coven],
    aetherAtmosphere: {veil: 3},
  }),
  unlocks("building", buildings.aether.spiritHut).requires({
    research: [technologies.aether.mysticalFriendship],
    aetherAtmosphere: {veil: 3},
  }),
  unlocks("research", technologies.aether.ancestorSpirits).requires({
    research: [technologies.aether.mysticalFriendship],
    structures: [buildings.aether.houseOfSpirits],
    aetherAtmosphere: {veil: 4, death: 1},
  }),
  unlocks("building", buildings.aether.veilThinning).requires({
    research: [technologies.aether.ancestorSpirits],
    aetherAtmosphere: {veil: 4},
  }),
  unlocks("structure", buildings.aether.houseOfSpirits).requires({
    buildings: [buildings.aether.spiritHut, buildings.aether.spiritHut, buildings.aether.spiritHut],
    aetherAtmosphere: {veil: 4},
  }),
  unlocks("structure", buildings.aether.embodimentStone).requires({
    buildings: [buildings.aether.obelisk, buildings.aether.spiritHut],
    aetherAtmosphere: {veil: 4, manaFlows: 3},
  }),
  unlocks("research", technologies.aether.livingClay).requires({
    research: [technologies.aether.ancestorSpirits],
    structures: [buildings.aether.embodimentStone],
    aetherAtmosphere: {veil: 4, manaFlows: 3},
  }),
  unlocks("building", buildings.aether.golemBuilder).requires({
    research: [technologies.aether.livingClay],
    aetherAtmosphere: {manaFlows: 3},
  }),
  unlocks("research", technologies.aether.mysticalHostility).requires({
    research: [technologies.aether.mysticism],
    structures: [buildings.aether.coven],
    aetherAtmosphere: {death: 2},
  }),
  unlocks("building", buildings.aether.suppressionTotem).requires({
    research: [technologies.aether.mysticalHostility],
    aetherAtmosphere: {death: 2, manaFlows: 1},
  }),
  unlocks("structure", buildings.aether.spiritTrap).requires({
    buildings: [buildings.aether.spiritHut, buildings.aether.suppressionTotem],
    aetherAtmosphere: {death: 3},
  }),
  unlocks("research", technologies.aether.deathEnergy).requires({
    research: [technologies.aether.mysticalHostility],
    structures: [buildings.aether.spiritTrap],
    aetherAtmosphere: {death: 3, manaFlows: 2},
  }),
]);

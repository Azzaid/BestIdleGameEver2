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
  }),
  unlocks("research", technologies.medieval.scrapTools).requires({
    research: [technologies.medieval.foraging],
    structures: [buildings.medieval.stalkerHut],
  }),
  unlocks("building", buildings.medieval.toolShed).requires({
    research: [technologies.medieval.scrapTools],
  }),
  unlocks("building", buildings.medieval.farm).requires({
    research: [technologies.nature.seedGathering],
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
    buildings: [buildings.medieval.stoneHouse],
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
    buildings: [buildings.medieval.barn, buildings.medieval.farm],
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
  unlocks("structure", buildings.medieval.tradingPost).requires({
    buildings: [buildings.medieval.shop, buildings.medieval.tradeStation],
  }),
  unlocks("research", technologies.medieval.caravans).requires({
    research: [technologies.medieval.trade],
    structures: [buildings.medieval.tradingPost],
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
    research: [technologies.medieval.naturalPhilosophy],
  }),
  unlocks("building", buildings.aether.dolmen).requires({
    research: [technologies.aether.mysticism],
  }),
  unlocks("structure", buildings.aether.shrine).requires({
    buildings: [buildings.medieval.stoneHouse, buildings.aether.dolmen],
  }),
  unlocks("structure", buildings.aether.monastery).requires({
    buildings: [buildings.medieval.stoneHouse, buildings.medieval.stoneHouse],
    structures: [buildings.aether.shrine],
  }),
  unlocks("research", technologies.aether.mysticalCommand).requires({
    research: [technologies.aether.mysticism],
    structures: [buildings.aether.monastery],
  }),
  unlocks("building", buildings.aether.obelisk).requires({
    research: [technologies.aether.mysticalCommand],
  }),
  unlocks("research", technologies.aether.mysticalFriendship).requires({
    research: [technologies.aether.mysticism],
    structures: [buildings.aether.monastery],
  }),
  unlocks("building", buildings.aether.spiritHut).requires({
    research: [technologies.aether.mysticalFriendship],
  }),
  unlocks("research", technologies.aether.ancestorSpirits).requires({
    research: [technologies.aether.mysticalFriendship],
    structures: [buildings.aether.houseOfSpirits],
  }),
  unlocks("building", buildings.aether.veilThinning).requires({
    research: [technologies.aether.ancestorSpirits],
  }),
  unlocks("structure", buildings.aether.houseOfSpirits).requires({
    buildings: [buildings.aether.spiritHut, buildings.aether.spiritHut, buildings.aether.spiritHut],
  }),
  unlocks("structure", buildings.aether.bindingStone).requires({
    buildings: [buildings.aether.obelisk, buildings.aether.spiritHut],
  }),
  unlocks("research", technologies.aether.livingClay).requires({
    research: [technologies.aether.ancestorSpirits],
    structures: [buildings.aether.bindingStone],
  }),
  unlocks("building", buildings.aether.golemWorkshop).requires({
    research: [technologies.aether.livingClay],
  }),
  unlocks("research", technologies.aether.mysticalHostility).requires({
    research: [technologies.aether.mysticism],
    structures: [buildings.aether.monastery],
  }),
  unlocks("building", buildings.aether.suppressionTotem).requires({
    research: [technologies.aether.mysticalHostility],
  }),
  unlocks("structure", buildings.aether.spiritTrap).requires({
    buildings: [buildings.aether.spiritHut, buildings.aether.suppressionTotem],
  }),
  unlocks("research", technologies.aether.deathEnergy).requires({
    research: [technologies.aether.mysticalHostility],
    structures: [buildings.aether.spiritTrap],
  }),
]);

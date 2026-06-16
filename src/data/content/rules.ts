import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {buildings, gunparts, technologies} from "../identificators/index.ts";
import {defineProgression, unlocks} from "./progression.ts";

export const PROGRESSION_RULES = defineProgression([
  unlocks("research", technologies.medieval.root).fromStart(),

  unlocks("building", buildings.tech.fossilFuelPowerPlant).fromStart(),
  unlocks("building", buildings.nature.compostGrove).fromStart(),
  unlocks("building", buildings.medieval.homesteadRow).fromStart(),
  unlocks("building", buildings.medieval.marketSquare).fromStart(),
  unlocks("building", buildings.aether.leylineWell).fromStart(),

  unlocks("towerPart", gunparts.bases.medieval.fixedMount).fromStart(),
  unlocks("towerPart", gunparts.barrels.medieval.crudeWood).fromStart(),
  unlocks("towerPart", gunparts.ammo.medieval.standardShells).fromStart(),
  unlocks("towerPart", gunparts.aimSystems.medieval.wallWatch).fromStart(),
  unlocks("towerPart", gunparts.aimSystems.medieval.splashSpotter).fromStart(),
  unlocks("towerPart", gunparts.barrelAttachments.tech.muzzleBrake).fromStart(),
  unlocks("towerPart", gunparts.loadingSystems.medieval.manualCrew).fromStart(),
  unlocks("towerPart", gunparts.launchSystems.medieval.gunpowderCharge).fromStart(),

  unlocks("research", technologies.aether.branch).requires({research: [technologies.medieval.root]}),
  unlocks("research", technologies.tech.branch).requires({research: [technologies.medieval.root]}),
  unlocks("research", technologies.nature.branch).requires({research: [technologies.medieval.root]}),
  unlocks("research", technologies.medieval.branch).requires({research: [technologies.medieval.root]}),

  unlocks("research", technologies.tech.copperTools).requires({
    research: [technologies.tech.branch],
    buildings: [buildings.tech.fossilFuelPowerPlant],
    freeUpkeep: {[UPKEEP_TYPES.electricity]: 2},
  }),
  unlocks("research", technologies.tech.basicCircuits).requires({
    research: [technologies.tech.branch],
    buildings: [buildings.tech.fossilFuelPowerPlant],
    freeUpkeep: {[UPKEEP_TYPES.electricity]: 3},
  }),
  unlocks("building", buildings.tech.machineShop).requires({research: [technologies.tech.basicCircuits]}),
  unlocks("structure", "tech-research-campus").requires({
    research: [technologies.tech.basicCircuits],
    buildings: [buildings.tech.fossilFuelPowerPlant, buildings.tech.machineShop],
  }),
  unlocks("research", technologies.tech.precisionFabrication).requires({
    research: [technologies.tech.basicCircuits],
    buildings: [buildings.tech.fossilFuelPowerPlant, buildings.tech.machineShop],
    structures: ["tech-research-campus"],
    freeUpkeep: {
      [UPKEEP_TYPES.electricity]: 4,
      [UPKEEP_TYPES.highTechComponents]: 1,
    },
  }),
  unlocks("research", technologies.tech.automationI).requires({
    research: [technologies.tech.branch, technologies.tech.copperTools, technologies.tech.basicCircuits],
    buildings: [buildings.tech.fossilFuelPowerPlant],
    freeUpkeep: {[UPKEEP_TYPES.electricity]: 6},
  }),
  unlocks("towerPart", gunparts.bases.tech.servoRing).requires({research: [technologies.tech.precisionFabrication]}),
  unlocks("towerPart", gunparts.barrels.tech.longRail).requires({research: [technologies.tech.precisionFabrication]}),
  unlocks("towerPart", gunparts.ammo.tech.explosive).requires({research: [technologies.tech.precisionFabrication]}),
  unlocks("towerPart", gunparts.loadingSystems.tech.fastLoader).requires({research: [technologies.tech.precisionFabrication]}),
  unlocks("towerPart", gunparts.launchSystems.tech.electromagneticDriver).requires({research: [technologies.tech.precisionFabrication]}),

  unlocks("research", technologies.nature.seedCult).requires({
    research: [technologies.nature.branch],
    buildings: [buildings.nature.compostGrove],
    freeUpkeep: {[UPKEEP_TYPES.biomass]: 2},
  }),
  unlocks("building", buildings.nature.mutationVat).requires({research: [technologies.nature.seedCult]}),
  unlocks("structure", "nature-cultivation-complex").requires({
    research: [technologies.nature.selection],
    buildings: [buildings.nature.compostGrove, buildings.nature.mutationVat],
  }),
  unlocks("research", technologies.nature.selection).requires({
    research: [technologies.nature.seedCult],
    buildings: [buildings.nature.compostGrove, buildings.nature.mutationVat],
    freeUpkeep: {[UPKEEP_TYPES.biomass]: 4},
  }),
  unlocks("research", technologies.nature.weaponcraft).requires({
    research: [technologies.nature.selection],
    buildings: [buildings.nature.mutationVat],
    structures: ["nature-cultivation-complex"],
    freeUpkeep: {
      [UPKEEP_TYPES.biomass]: 4,
      [UPKEEP_TYPES.mutagen]: 2,
    },
  }),
  unlocks("research", technologies.nature.herbalLore).requires({research: [technologies.nature.branch]}),
  unlocks("towerPart", gunparts.ammo.nature.sporeCapsules).requires({research: [technologies.nature.weaponcraft]}),
  unlocks("towerPart", gunparts.bases.nature.rootCluster).requires({research: [technologies.nature.weaponcraft]}),
  unlocks("towerPart", gunparts.barrels.nature.thornBore).requires({research: [technologies.nature.weaponcraft]}),
  unlocks("towerPart", gunparts.aimSystems.nature.predatorSense).requires({research: [technologies.nature.weaponcraft]}),
  unlocks("towerPart", gunparts.barrelAttachments.nature.sporeNozzle).requires({research: [technologies.nature.weaponcraft]}),
  unlocks("towerPart", gunparts.loadingSystems.nature.peristalticSac).requires({research: [technologies.nature.weaponcraft]}),
  unlocks("towerPart", gunparts.launchSystems.nature.muscleSling).requires({research: [technologies.nature.weaponcraft]}),

  unlocks("structure", "medieval-guild-district").requires({
    research: [technologies.medieval.guildCharter],
    buildings: [buildings.medieval.homesteadRow, buildings.medieval.marketSquare],
  }),
  unlocks("research", technologies.medieval.guildCharter).requires({
    research: [technologies.medieval.branch],
    buildings: [buildings.medieval.homesteadRow, buildings.medieval.marketSquare],
    freeUpkeep: {[UPKEEP_TYPES.people]: 2},
  }),
  unlocks("research", technologies.medieval.fortifications).requires({
    research: [technologies.medieval.branch],
    freeUpkeep: {
      [UPKEEP_TYPES.people]: 3,
      [UPKEEP_TYPES.gold]: 2,
    },
  }),
  unlocks("research", technologies.medieval.artillery).requires({
    research: [technologies.medieval.fortifications],
    buildings: [buildings.medieval.homesteadRow, buildings.medieval.marketSquare],
    structures: ["medieval-guild-district"],
    freeUpkeep: {
      [UPKEEP_TYPES.people]: 4,
      [UPKEEP_TYPES.gold]: 3,
    },
  }),
  unlocks("research", technologies.medieval.livingWood).requires({
    research: [technologies.medieval.fortifications, technologies.nature.selection],
    freeUpkeep: {
      [UPKEEP_TYPES.people]: 4,
      [UPKEEP_TYPES.gold]: 3,
    },
  }),
  unlocks("towerPart", gunparts.barrelAttachments.medieval.ironSightCollar).requires({research: [technologies.medieval.artillery]}),

  unlocks("research", technologies.aether.leylineTapping).requires({
    research: [technologies.aether.branch],
    buildings: [buildings.aether.leylineWell],
    freeUpkeep: {[UPKEEP_TYPES.mana]: 2},
  }),
  unlocks("building", buildings.aether.runeScriptorium).requires({research: [technologies.aether.leylineTapping]}),
  unlocks("structure", "aether-rune-complex").requires({
    research: [technologies.aether.runeSupplies],
    buildings: [buildings.aether.leylineWell, buildings.aether.runeScriptorium],
  }),
  unlocks("research", technologies.aether.runeSupplies).requires({
    research: [technologies.aether.leylineTapping],
    buildings: [buildings.aether.leylineWell, buildings.aether.runeScriptorium],
    freeUpkeep: {
      [UPKEEP_TYPES.mana]: 4,
      [UPKEEP_TYPES.arcaneSupplies]: 1,
    },
  }),
  unlocks("research", technologies.aether.artillery).requires({
    research: [technologies.aether.runeSupplies],
    buildings: [buildings.aether.runeScriptorium],
    structures: ["aether-rune-complex"],
    freeUpkeep: {
      [UPKEEP_TYPES.mana]: 5,
      [UPKEEP_TYPES.arcaneSupplies]: 2,
    },
  }),
  unlocks("towerPart", gunparts.aimSystems.aether.arcaneOmen).requires({research: [technologies.aether.artillery]}),
  unlocks("towerPart", gunparts.barrelAttachments.aether.prismaticFocus).requires({research: [technologies.aether.artillery]}),
  unlocks("towerPart", gunparts.bases.aether.levitationGimbal).requires({research: [technologies.aether.artillery]}),
  unlocks("towerPart", gunparts.barrels.aether.phaseChannel).requires({research: [technologies.aether.artillery]}),
  unlocks("towerPart", gunparts.ammo.aether.manaBolts).requires({research: [technologies.aether.artillery]}),
  unlocks("towerPart", gunparts.loadingSystems.aether.runeCarousel).requires({research: [technologies.aether.artillery]}),
  unlocks("towerPart", gunparts.launchSystems.aether.gravityPulse).requires({research: [technologies.aether.artillery]}),
]);

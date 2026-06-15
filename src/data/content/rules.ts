import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {defineProgression, unlocks} from "./progression.ts";

export const PROGRESSION_RULES = defineProgression([
  unlocks("research", "root").fromStart(),

  unlocks("building", "techProduce1").fromStart(),
  unlocks("building", "natureBiomass1").fromStart(),
  unlocks("building", "medievalPeople1").fromStart(),
  unlocks("building", "medievalGold1").fromStart(),
  unlocks("building", "aetherMana1").fromStart(),

  unlocks("towerPart", "base_fixed_mount").fromStart(),
  unlocks("towerPart", "medieval_barrel_sling-crude-base").fromStart(),
  unlocks("towerPart", "ammo_standard").fromStart(),
  unlocks("towerPart", "aim_wall_watch").fromStart(),
  unlocks("towerPart", "aim_splash_spotter").fromStart(),
  unlocks("towerPart", "attachment_muzzle_brake").fromStart(),
  unlocks("towerPart", "loader_manual_crew").fromStart(),
  unlocks("towerPart", "launch_gunpowder").fromStart(),

  unlocks("research", "aether").requires({research: ["root"]}),
  unlocks("research", "tech").requires({research: ["root"]}),
  unlocks("research", "nature").requires({research: ["root"]}),
  unlocks("research", "medieval").requires({research: ["root"]}),

  unlocks("research", "copper-tools").requires({
    research: ["tech"],
    buildings: ["techProduce1"],
    freeUpkeep: {[UPKEEP_TYPES.electricity]: 2},
  }),
  unlocks("research", "basic-circuits").requires({
    research: ["tech"],
    buildings: ["techProduce1"],
    freeUpkeep: {[UPKEEP_TYPES.electricity]: 3},
  }),
  unlocks("building", "techComponents1").requires({research: ["basic-circuits"]}),
  unlocks("structure", "tech-research-campus").requires({
    research: ["basic-circuits"],
    buildings: ["techProduce1", "techComponents1"],
  }),
  unlocks("research", "precision-fabrication").requires({
    research: ["basic-circuits"],
    buildings: ["techProduce1", "techComponents1"],
    structures: ["tech-research-campus"],
    freeUpkeep: {
      [UPKEEP_TYPES.electricity]: 4,
      [UPKEEP_TYPES.highTechComponents]: 1,
    },
  }),
  unlocks("research", "automation-i").requires({
    research: ["tech", "copper-tools", "basic-circuits"],
    buildings: ["techProduce1"],
    freeUpkeep: {[UPKEEP_TYPES.electricity]: 6},
  }),
  unlocks("towerPart", "base_servo_ring").requires({research: ["precision-fabrication"]}),
  unlocks("towerPart", "barrel_long_rail").requires({research: ["precision-fabrication"]}),
  unlocks("towerPart", "ammo_explosive").requires({research: ["precision-fabrication"]}),
  unlocks("towerPart", "loader_fast").requires({research: ["precision-fabrication"]}),
  unlocks("towerPart", "launch_electromagnetic").requires({research: ["precision-fabrication"]}),

  unlocks("research", "seed-cult").requires({
    research: ["nature"],
    buildings: ["natureBiomass1"],
    freeUpkeep: {[UPKEEP_TYPES.biomass]: 2},
  }),
  unlocks("building", "natureMutagen1").requires({research: ["seed-cult"]}),
  unlocks("structure", "nature-cultivation-complex").requires({
    research: ["selection"],
    buildings: ["natureBiomass1", "natureMutagen1"],
  }),
  unlocks("research", "selection").requires({
    research: ["seed-cult"],
    buildings: ["natureBiomass1", "natureMutagen1"],
    freeUpkeep: {[UPKEEP_TYPES.biomass]: 4},
  }),
  unlocks("research", "nature-weaponcraft").requires({
    research: ["selection"],
    buildings: ["natureMutagen1"],
    structures: ["nature-cultivation-complex"],
    freeUpkeep: {
      [UPKEEP_TYPES.biomass]: 4,
      [UPKEEP_TYPES.mutagen]: 2,
    },
  }),
  unlocks("research", "herbal-lore").requires({research: ["nature"]}),
  unlocks("towerPart", "ammo_spore_capsules").requires({research: ["nature-weaponcraft"]}),
  unlocks("towerPart", "base_root_cluster").requires({research: ["nature-weaponcraft"]}),
  unlocks("towerPart", "barrel_thorn_bore").requires({research: ["nature-weaponcraft"]}),
  unlocks("towerPart", "aim_predator_sense").requires({research: ["nature-weaponcraft"]}),
  unlocks("towerPart", "attachment_spore_nozzle").requires({research: ["nature-weaponcraft"]}),
  unlocks("towerPart", "loader_peristaltic_sac").requires({research: ["nature-weaponcraft"]}),
  unlocks("towerPart", "launch_muscle_sling").requires({research: ["nature-weaponcraft"]}),

  unlocks("structure", "medieval-guild-district").requires({
    research: ["guild-charter"],
    buildings: ["medievalPeople1", "medievalGold1"],
  }),
  unlocks("research", "guild-charter").requires({
    research: ["medieval"],
    buildings: ["medievalPeople1", "medievalGold1"],
    freeUpkeep: {[UPKEEP_TYPES.people]: 2},
  }),
  unlocks("research", "fortifications").requires({
    research: ["medieval"],
    freeUpkeep: {
      [UPKEEP_TYPES.people]: 3,
      [UPKEEP_TYPES.gold]: 2,
    },
  }),
  unlocks("research", "medieval-artillery").requires({
    research: ["fortifications"],
    buildings: ["medievalPeople1", "medievalGold1"],
    structures: ["medieval-guild-district"],
    freeUpkeep: {
      [UPKEEP_TYPES.people]: 4,
      [UPKEEP_TYPES.gold]: 3,
    },
  }),
  unlocks("research", "livingWood").requires({
    research: ["fortifications", "selection"],
    freeUpkeep: {
      [UPKEEP_TYPES.people]: 4,
      [UPKEEP_TYPES.gold]: 3,
    },
  }),
  unlocks("towerPart", "attachment_iron_sight_collar").requires({research: ["medieval-artillery"]}),

  unlocks("research", "leyline-tapping").requires({
    research: ["aether"],
    buildings: ["aetherMana1"],
    freeUpkeep: {[UPKEEP_TYPES.mana]: 2},
  }),
  unlocks("building", "aetherSupplies1").requires({research: ["leyline-tapping"]}),
  unlocks("structure", "aether-rune-complex").requires({
    research: ["rune-supplies"],
    buildings: ["aetherMana1", "aetherSupplies1"],
  }),
  unlocks("research", "rune-supplies").requires({
    research: ["leyline-tapping"],
    buildings: ["aetherMana1", "aetherSupplies1"],
    freeUpkeep: {
      [UPKEEP_TYPES.mana]: 4,
      [UPKEEP_TYPES.arcaneSupplies]: 1,
    },
  }),
  unlocks("research", "aether-artillery").requires({
    research: ["rune-supplies"],
    buildings: ["aetherSupplies1"],
    structures: ["aether-rune-complex"],
    freeUpkeep: {
      [UPKEEP_TYPES.mana]: 5,
      [UPKEEP_TYPES.arcaneSupplies]: 2,
    },
  }),
  unlocks("towerPart", "aim_arcane_omen").requires({research: ["aether-artillery"]}),
  unlocks("towerPart", "attachment_prismatic_focus").requires({research: ["aether-artillery"]}),
  unlocks("towerPart", "base_levitation_gimbal").requires({research: ["aether-artillery"]}),
  unlocks("towerPart", "barrel_phase_channel").requires({research: ["aether-artillery"]}),
  unlocks("towerPart", "ammo_mana_bolt").requires({research: ["aether-artillery"]}),
  unlocks("towerPart", "loader_rune_carousel").requires({research: ["aether-artillery"]}),
  unlocks("towerPart", "launch_gravity_pulse").requires({research: ["aether-artillery"]}),
]);

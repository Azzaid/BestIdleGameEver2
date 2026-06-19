import {buildings, technologies} from "../../identificators/index.ts";
import {unlocks} from "../progression.ts";
import type {ProgressionRule} from "../types.ts";

export const AETHER_PROGRESSION_RULES: ProgressionRule[] = [
  unlocks("research", technologies.aether.wickedItems).requires({
    research: [technologies.medieval.foraging],
    structures: [buildings.medieval.stalkerHut],
  }),
  unlocks("research", technologies.aether.mysticism).requires({
    research: [technologies.aether.wickedItems],
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
];

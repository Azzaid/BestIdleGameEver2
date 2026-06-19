import type {ResearchDB} from "../../models/research/researchDB.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../homogeneousValues/index.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";

export const aetherResearch: ResearchDB = {
  [technologies.aether.wickedItems]: {
    id: technologies.aether.wickedItems,
    parentId: technologies.medieval.foraging,
    name: "Wicked Items",
    vector: "aether",
    summary: "Strange scavenged objects make early ritual stonework possible.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.foraging),
      requires.buildingExists(buildings.medieval.stalkerHut),
    ],
  },
  [technologies.aether.mysticism]: {
    id: technologies.aether.mysticism,
    parentId: technologies.aether.wickedItems,
    name: "Mysticism",
    vector: "aether",
    summary: "Early omens and ritual specialists emerge from the first shaman hut.",
    requirements: [
      requires.technologyUnlocked(technologies.aether.wickedItems),
      requires.buildingExists(buildings.aether.shamanHut),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
    ],
  },
  [technologies.aether.magicStones]: {
    id: technologies.aether.magicStones,
    parentId: technologies.aether.mysticism,
    name: "Magic Stones",
    vector: "aether",
    summary: "A shaman hut turns early ritual stones into useful floating tower platforms.",
    requirements: [
      requires.technologyUnlocked(technologies.aether.mysticism),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
    ],
  },
  [technologies.aether.mysticalCommand]: {
    id: technologies.aether.mysticalCommand,
    parentId: technologies.aether.mysticism,
    name: "Mana Flow Command",
    vector: "aether",
    summary: "Guiding stones and obelisks shape mana flows into deliberate magical direction.",
    requirements: [
      requires.technologyUnlocked(technologies.aether.mysticism),
      requires.buildingExists(buildings.aether.coven),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 2),
    ],
  },
  [technologies.aether.mysticalFriendship]: {
    id: technologies.aether.mysticalFriendship,
    parentId: technologies.aether.mysticism,
    name: "Veil Communion",
    vector: "aether",
    summary: "Spirit huts and whispering spirits turn a thinning veil into cooperation with nearby spirits.",
    requirements: [
      requires.technologyUnlocked(technologies.aether.mysticism),
      requires.buildingExists(buildings.aether.coven),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 3),
    ],
  },
  [technologies.aether.ancestorSpirits]: {
    id: technologies.aether.ancestorSpirits,
    parentId: technologies.aether.mysticalFriendship,
    name: "Ancestor Spirits",
    vector: "aether",
    summary: "Poltergeists and veil thinning deepen the spirit economy.",
    requirements: [
      requires.technologyUnlocked(technologies.aether.mysticalFriendship),
      requires.buildingExists(buildings.aether.houseOfSpirits),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 1),
    ],
  },
  [technologies.aether.livingClay]: {
    id: technologies.aether.livingClay,
    parentId: technologies.aether.ancestorSpirits,
    name: "Living Clay",
    vector: "aether",
    summary: "Predatory clay, living platforms, and golem workshops animate magical matter.",
    requirements: [
      requires.technologyUnlocked(technologies.aether.ancestorSpirits),
      requires.buildingExists(buildings.aether.embodimentStone),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 3),
    ],
  },
  [technologies.aether.mysticalHostility]: {
    id: technologies.aether.mysticalHostility,
    parentId: technologies.aether.mysticism,
    name: "Mystical Hostility",
    vector: "aether",
    summary: "Totems suppress the city or punish monsters near the walls.",
    requirements: [
      requires.technologyUnlocked(technologies.aether.mysticism),
      requires.buildingExists(buildings.aether.coven),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 2),
    ],
  },
  [technologies.aether.deathEnergy]: {
    id: technologies.aether.deathEnergy,
    parentId: technologies.aether.mysticalHostility,
    name: "Death Energy",
    vector: "aether",
    summary: "Hostile spirit work culminates in death-triggered explosions.",
    requirements: [
      requires.technologyUnlocked(technologies.aether.mysticalHostility),
      requires.buildingExists(buildings.aether.spiritTrap),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 3),
      requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 2),
    ],
  },
};

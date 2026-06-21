import type {ResearchDB} from "../../models/research/researchDB.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../homogeneousValues/index.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";
import {createTechnologyFactory} from "./technologyFactory.ts";

const {technology} = createTechnologyFactory({
  defaultKeywords: ["aether"],
});

export const aetherResearch: ResearchDB = {
  [technologies.aether.wickedItems]: technology(
    technologies.aether.wickedItems,
    technologies.medieval.foraging,
    "Wicked Items",
    "Strange scavenged objects make early ritual stonework possible.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.stalkerHut),
      ],
    },
  ),
  [technologies.aether.mysticism]: technology(
    technologies.aether.mysticism,
    technologies.aether.wickedItems,
    "Mysticism",
    "Early omens and ritual specialists emerge from the first shaman hut.",
    {
      requirements: [
        requires.buildingExists(buildings.aether.shamanHut),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
      ],
    },
  ),
  [technologies.aether.magicStones]: technology(
    technologies.aether.magicStones,
    technologies.aether.mysticism,
    "Magic Stones",
    "A shaman hut turns early ritual stones into useful floating wall towers.",
    {
      requirements: [
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
      ],
    },
  ),
  [technologies.aether.mysticalCommand]: technology(
    technologies.aether.mysticalCommand,
    technologies.aether.mysticism,
    "Mana Flow Command",
    "Guiding stones and obelisks shape mana flows into deliberate magical direction.",
    {
      requirements: [
        requires.buildingExists(buildings.aether.coven),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 2),
      ],
    },
  ),
  [technologies.aether.mysticalFriendship]: technology(
    technologies.aether.mysticalFriendship,
    technologies.aether.mysticism,
    "Veil Communion",
    "Spirit huts and whispering spirits turn a thinning veil into cooperation with nearby spirits.",
    {
      requirements: [
        requires.buildingExists(buildings.aether.coven),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 3),
      ],
    },
  ),
  [technologies.aether.ancestorSpirits]: technology(
    technologies.aether.ancestorSpirits,
    technologies.aether.mysticalFriendship,
    "Ancestor Spirits",
    "Poltergeists and veil thinning deepen the spirit economy.",
    {
      requirements: [
        requires.buildingExists(buildings.aether.houseOfSpirits),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 1),
      ],
    },
  ),
  [technologies.aether.livingClay]: technology(
    technologies.aether.livingClay,
    technologies.aether.ancestorSpirits,
    "Living Clay",
    "Predatory clay, living platforms, and golem workshops animate magical matter.",
    {
      requirements: [
        requires.buildingExists(buildings.aether.embodimentStone),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 3),
      ],
    },
  ),
  [technologies.aether.mysticalHostility]: technology(
    technologies.aether.mysticalHostility,
    technologies.aether.mysticism,
    "Mystical Hostility",
    "Totems suppress the city or punish monsters near the walls.",
    {
      requirements: [
        requires.buildingExists(buildings.aether.coven),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 2),
      ],
    },
  ),
  [technologies.aether.deathEnergy]: technology(
    technologies.aether.deathEnergy,
    technologies.aether.mysticalHostility,
    "Death Energy",
    "Hostile spirit work culminates in death-triggered explosions.",
    {
      requirements: [
        requires.buildingExists(buildings.aether.spiritTrap),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 3),
        requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 2),
      ],
    },
  ),
};

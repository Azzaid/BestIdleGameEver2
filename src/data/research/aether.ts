import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const aetherResearch: ResearchDB = {
  [technologies.aether.wickedItems]: {
    id: technologies.aether.wickedItems,
    parentId: technologies.medieval.foraging,
    name: "Wicked Items",
    vector: "aether",
    summary: "Strange scavenged objects make early ritual stonework possible.",
  },
  [technologies.aether.mysticism]: {
    id: technologies.aether.mysticism,
    parentId: technologies.aether.wickedItems,
    name: "Mysticism",
    vector: "aether",
    summary: "Early omens and ritual specialists emerge from the first shaman hut.",
  },
  [technologies.aether.magicStones]: {
    id: technologies.aether.magicStones,
    parentId: technologies.aether.mysticism,
    name: "Magic Stones",
    vector: "aether",
    summary: "A shaman hut turns early ritual stones into useful floating tower platforms.",
  },
  [technologies.aether.mysticalCommand]: {
    id: technologies.aether.mysticalCommand,
    parentId: technologies.aether.mysticism,
    name: "Mana Flow Command",
    vector: "aether",
    summary: "Guiding stones and obelisks shape mana flows into deliberate magical direction.",
  },
  [technologies.aether.mysticalFriendship]: {
    id: technologies.aether.mysticalFriendship,
    parentId: technologies.aether.mysticism,
    name: "Veil Communion",
    vector: "aether",
    summary: "Spirit huts and whispering spirits turn a thinning veil into cooperation with nearby spirits.",
  },
  [technologies.aether.ancestorSpirits]: {
    id: technologies.aether.ancestorSpirits,
    parentId: technologies.aether.mysticalFriendship,
    name: "Ancestor Spirits",
    vector: "aether",
    summary: "Poltergeists and veil thinning deepen the spirit economy.",
  },
  [technologies.aether.livingClay]: {
    id: technologies.aether.livingClay,
    parentId: technologies.aether.ancestorSpirits,
    name: "Living Clay",
    vector: "aether",
    summary: "Predatory clay, living platforms, and golem workshops animate magical matter.",
  },
  [technologies.aether.mysticalHostility]: {
    id: technologies.aether.mysticalHostility,
    parentId: technologies.aether.mysticism,
    name: "Mystical Hostility",
    vector: "aether",
    summary: "Totems suppress the city or punish monsters near the walls.",
  },
  [technologies.aether.deathEnergy]: {
    id: technologies.aether.deathEnergy,
    parentId: technologies.aether.mysticalHostility,
    name: "Death Energy",
    vector: "aether",
    summary: "Hostile spirit work culminates in death-triggered explosions.",
  },
};

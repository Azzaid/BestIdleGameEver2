import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const aetherResearch: ResearchDB = {
  [technologies.aether.mysticism]: {
    id: technologies.aether.mysticism,
    parentId: technologies.medieval.naturalPhilosophy,
    name: "Mysticism",
    vector: "aether",
    summary: "Ritual practice around dolmens, shrines, and the first stable mana flows.",
  },
  [technologies.aether.mysticalCommand]: {
    id: technologies.aether.mysticalCommand,
    parentId: technologies.aether.mysticism,
    name: "Mystical Command",
    vector: "aether",
    summary: "Guiding stones and obelisks turn mana into more deliberate control.",
  },
  [technologies.aether.mysticalFriendship]: {
    id: technologies.aether.mysticalFriendship,
    parentId: technologies.aether.mysticism,
    name: "Mystical Friendship",
    vector: "aether",
    summary: "Spirit huts and whispering spirits make spirits useful instead of merely alarming.",
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

import type {ResearchDB} from "../../models/research/researchDB.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";

export const researchThree: ResearchDB = {
    'root': {
        id: 'root',
        parentId: null,
        name: 'Curiosity',
        vector: 'default',
        summary: 'First you need to ask. What if? Then stuff starts exploding.'
    },
    'aether': {
        id: 'aether',
        parentId: 'root',
        name: 'Aether Core',
        vector: 'aether',
        summary: 'Unlock the flow of arcane energy.'
    },
    'tech': {id: 'tech', parentId: 'root', name: 'Tech Branch', vector: 'tech', summary: 'Start of technology.'},

    'copper-tools': {
        id: 'copper-tools',
        parentId: 'tech',
        name: 'Copper Tools',
        vector: 'tech',
        summary: 'Basic tools.',
        unlocks: ['Pickaxe', 'Axe', 'Hammer'],
        requiredBuildings: ['techProduce1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.electricity]: 2}
    },
    'basic-circuits': {
        id: 'basic-circuits',
        parentId: 'tech',
        name: 'Basic Circuits',
        vector: 'tech',
        summary: 'Tiny brains.',
        requiredBuildings: ['techProduce1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.electricity]: 3}
    },
    'automation-i': {
        id: 'automation-i',
        parentId: 'tech',
        name: 'Automation I',
        vector: 'tech',
        summary: 'First tier automation.',
        alsoRequires: ['copper-tools', 'basic-circuits'],
        requiredBuildings: ['techProduce1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.electricity]: 6}
    },

    'nature': {id: 'nature', parentId: 'root', name: 'Nature Branch', vector: 'nature', summary: 'Growth & food.'},
    'seed-cult': {
        id: 'seed-cult',
        parentId: 'nature',
        name: 'Seed Cultivation',
        vector: 'nature',
        summary: 'Unlock farms.',
        requiredFreeUpkeep: {[UPKEEP_TYPES.biomass]: 2}
    },
    'selection': {
        id: 'selection',
        parentId: 'seed-cult',
        name: 'Selection',
        vector: 'nature',
        summary: 'Unlock bio research',
        requiredFreeUpkeep: {[UPKEEP_TYPES.biomass]: 4}
    },
    'herbal-lore': {
        id: 'herbal-lore',
        parentId: 'nature',
        name: 'Herbal Lore',
        vector: 'nature',
        summary: 'Simple elixirs.',
        unlocks: ['Healing Draught']
    },

    'medieval': {
        id: 'medieval',
        parentId: 'root',
        name: 'Medieval',
        vector: 'medieval',
        summary: 'Steel, guilds, taxes.'
    },
    'guild-charter': {
        id: 'guild-charter',
        parentId: 'medieval',
        name: 'Guild Charter',
        vector: 'medieval',
        summary: 'Trade & crafting bonuses.',
        requiredFreeUpkeep: {[UPKEEP_TYPES.people]: 2}
    },
    'fortifications': {
        id: 'fortifications',
        parentId: 'medieval',
        name: 'Fortifications',
        vector: 'medieval',
        summary: 'City walls & towers.',
        requiredFreeUpkeep: {[UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.gold]: 2}
    },
    'livingWood': {
        id: 'livingWood',
        parentId: 'fortifications',
        name: 'Living Wood',
        vector: 'medieval',
        summary: 'City walls & towers.',
        alsoRequires: ['selection'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.people]: 4, [UPKEEP_TYPES.gold]: 3}
    },
};

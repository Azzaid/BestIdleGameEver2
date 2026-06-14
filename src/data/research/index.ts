import type {ResearchAtlas, ResearchDB} from "../../models/research/researchDB.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";

export const researchThree: ResearchDB = {
    'root': {
        id: 'root',
        parentId: null,
        name: 'Curiosity',
        vector: 'medieval',
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
    'precision-fabrication': {
        id: 'precision-fabrication',
        parentId: 'basic-circuits',
        name: 'Precision Fabrication',
        vector: 'tech',
        summary: 'Unlock high-tech component production and refined machine parts.',
        unlocks: ['Machine Shop', 'Servo Weapons'],
        requiredBuildings: ['techProduce1', 'techComponents1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.electricity]: 4, [UPKEEP_TYPES.highTechComponents]: 1}
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
        unlocks: ['Compost Grove'],
        requiredBuildings: ['natureBiomass1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.biomass]: 2}
    },
    'selection': {
        id: 'selection',
        parentId: 'seed-cult',
        name: 'Selection',
        vector: 'nature',
        summary: 'Unlock bio research',
        unlocks: ['Mutation Vat'],
        requiredBuildings: ['natureBiomass1', 'natureMutagen1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.biomass]: 4}
    },
    'nature-weaponcraft': {
        id: 'nature-weaponcraft',
        parentId: 'selection',
        name: 'Living Weaponcraft',
        vector: 'nature',
        summary: 'Shape roots, spores, and sinew into tower components.',
        unlocks: ['Living tower parts'],
        requiredBuildings: ['natureMutagen1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.biomass]: 4, [UPKEEP_TYPES.mutagen]: 2}
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
        unlocks: ['Homestead Row', 'Market Square'],
        requiredBuildings: ['medievalPeople1', 'medievalGold1'],
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
    'medieval-artillery': {
        id: 'medieval-artillery',
        parentId: 'fortifications',
        name: 'Siege Artillery',
        vector: 'medieval',
        summary: 'Standardize crews, fittings, and rugged tower attachments.',
        unlocks: ['Iron Sight Collar'],
        requiredBuildings: ['medievalPeople1', 'medievalGold1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.people]: 4, [UPKEEP_TYPES.gold]: 3}
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
    'leyline-tapping': {
        id: 'leyline-tapping',
        parentId: 'aether',
        name: 'Leyline Tapping',
        vector: 'aether',
        summary: 'Draw stable mana into city infrastructure.',
        unlocks: ['Leyline Well'],
        requiredBuildings: ['aetherMana1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.mana]: 2}
    },
    'rune-supplies': {
        id: 'rune-supplies',
        parentId: 'leyline-tapping',
        name: 'Rune Supplies',
        vector: 'aether',
        summary: 'Prepare charged materials for repeatable arcane engineering.',
        unlocks: ['Rune Scriptorium'],
        requiredBuildings: ['aetherMana1', 'aetherSupplies1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.mana]: 4, [UPKEEP_TYPES.arcaneSupplies]: 1}
    },
    'aether-artillery': {
        id: 'aether-artillery',
        parentId: 'rune-supplies',
        name: 'Aether Artillery',
        vector: 'aether',
        summary: 'Bind omen, focus, and phase effects into tower components.',
        unlocks: ['Aether tower parts'],
        requiredBuildings: ['aetherSupplies1'],
        requiredFreeUpkeep: {[UPKEEP_TYPES.mana]: 5, [UPKEEP_TYPES.arcaneSupplies]: 2}
    },
};

const createEmptyResearchAtlas = (): ResearchAtlas => ({
    tech: {},
    nature: {},
    medieval: {},
    aether: {},
});

export const RESEARCH_ATLAS = Object.values(researchThree).reduce<ResearchAtlas>((atlas, node) => {
    atlas[node.vector][node.id] = node;
    return atlas;
}, createEmptyResearchAtlas());

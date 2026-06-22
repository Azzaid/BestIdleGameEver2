import type { Building } from "../../models/city/Building.ts";
import { DEVELOPMENT_VECTORS } from "../../models/DevlopmentVector.ts";
import { UPKEEP_TYPES } from "../../models/Upkeep.ts";
import { HOMOGENEOUS_VALUE_IDS } from "../homogeneousValues/index.ts";
import { buildings, technologies } from "../identificators/index.ts";
import { requires } from "../requirements.ts";
import { createBuildingFactory } from "./buildingFactory.ts";
import {citySignatureToHomogeneousValueEffect, upkeepAmountToHomogeneousValueEffects} from "../../models/homogeneousValueAdapters.ts";
const { building: magicBuilding, superstructure: magicSuperstructure, } = createBuildingFactory({
    vector: DEVELOPMENT_VECTORS.aether,
    defaultKeywords: ["aether"],
});
const aetherBuildingsRaw: {
    [key: string]: Building;
} = {
    [buildings.aether.dolmen]: {
        ...magicBuilding(buildings.aether.dolmen, "Dolmen", "A raised stone place where early mysticism becomes a city practice.", ["ritual"], {
            requirements: [
                requires.technologyUnlocked(technologies.aether.wickedItems),
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 1),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.veil]: 8 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 2 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(20)
            ]
        }),
    },
    [buildings.aether.shamanHut]: magicSuperstructure(buildings.aether.shamanHut, "Shaman Hut", "A dolmen and stalker hut combined into an early magical specialist dwelling.", ["production", "manaFlows", "ritual"], {
        requiredBuildingIds: [
            buildings.aether.dolmen,
            buildings.medieval.stalkerHut,
        ],
        requirements: [
            requires.buildingExists(buildings.aether.dolmen),
            requires.buildingExists(buildings.medieval.stalkerHut),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.veil]: 18, [UPKEEP_TYPES.manaFlows]: 10 }, "production"),
            ...citySignatureToHomogeneousValueEffect(26)
        ]
    }),
    [buildings.aether.wardedHome]: {
        ...magicBuilding(buildings.aether.wardedHome, "Warded Home", "A dwelling protected by charms, talismans, and simple magical rituals. The inhabitants often cannot explain why it feels safer and more comfortable, only that it does.", ["production", "people", "manaFlows", "housing", "ritual"], {
            requirements: [
                requires.technologyUnlocked(technologies.aether.magicStones),
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 12, [UPKEEP_TYPES.manaFlows]: 2, [UPKEEP_TYPES.veil]: 10 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 2 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(8)
            ]
        }),
    },
    [buildings.aether.runedHouse]: {
        ...magicSuperstructure(buildings.aether.runedHouse, "Runed House", "A warded home and dolmen combined into a house marked with protective runes.", ["production", "people", "manaFlows", "housing", "ritual"], {
            requiredBuildingIds: [
                buildings.aether.wardedHome,
                buildings.aether.dolmen,
            ],
            requirements: [
                requires.buildingExists(buildings.aether.wardedHome),
                requires.buildingExists(buildings.aether.dolmen),
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 1),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 14, [UPKEEP_TYPES.manaFlows]: 12, [UPKEEP_TYPES.veil]: 18 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 2 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(24)
            ]
        }),
    },
    [buildings.aether.coven]: magicSuperstructure(buildings.aether.coven, "Coven", "Two runed houses joined into a small organized magical community.", ["production", "manaFlows", "ritual"], {
        requiredBuildingIds: [
            buildings.aether.runedHouse,
            buildings.aether.runedHouse,
        ],
        requirements: [
            requires.buildingExists(buildings.aether.runedHouse),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 3),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 2),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 28, [UPKEEP_TYPES.veil]: 24, [UPKEEP_TYPES.death]: 4 }, "production"),
            ...citySignatureToHomogeneousValueEffect(38)
        ]
    }),
    [buildings.aether.obelisk]: {
        ...magicBuilding(buildings.aether.obelisk, "Obelisk", "A focused mana producer with lower signature than early ritual houses.", ["production", "manaFlows"], {
            requirements: [
                requires.technologyUnlocked(technologies.aether.mysticalCommand),
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 2),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 18 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.gold]: 3 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(18)
            ]
        }),
    },
    [buildings.aether.spiritHut]: {
        ...magicBuilding(buildings.aether.spiritHut, "Spirit Hut", "Converts part of nearby people requirements into mana requirements.", ["support", "ritual"], {
            requirements: [
                requires.technologyUnlocked(technologies.aether.mysticalFriendship),
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 3),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.veil]: 16 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.manaFlows]: 2 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(24)
            ]
        }),
    },
    [buildings.aether.houseOfSpirits]: magicSuperstructure(buildings.aether.houseOfSpirits, "House of Spirits", "Three spirit huts combined into a stronger mana-for-people conversion center.", ["support", "ritual"], {
        requiredBuildingIds: [
            buildings.aether.spiritHut,
            buildings.aether.spiritHut,
            buildings.aether.spiritHut,
        ],
        requirements: [
            requires.buildingExists(buildings.aether.spiritHut),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.veil]: 42, [UPKEEP_TYPES.death]: 8 }, "production"),
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 4 }, "upkeep"),
            ...citySignatureToHomogeneousValueEffect(52)
        ]
    }),
    [buildings.aether.veilThinning]: magicBuilding(buildings.aether.veilThinning, "Veil Thinning", "A weak point where the spirit world leaks into reality, producing large mana and a large signature.", ["production", "manaFlows", "visibility"], {
        requirements: [
            requires.technologyUnlocked(technologies.aether.ancestorSpirits),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 28, [UPKEEP_TYPES.veil]: 48, [UPKEEP_TYPES.death]: 6 }, "production"),
            ...citySignatureToHomogeneousValueEffect(42)
        ]
    }),
    [buildings.aether.embodimentStone]: magicSuperstructure(buildings.aether.embodimentStone, "Embodiment Stone", "An obelisk and spirit hut combined to bind spirits into matter.", ["support", "arcane"], {
        requiredBuildingIds: [
            buildings.aether.obelisk,
            buildings.aether.spiritHut,
        ],
        requirements: [
            requires.buildingExists(buildings.aether.obelisk),
            requires.buildingExists(buildings.aether.spiritHut),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 3),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.veil]: 18, [UPKEEP_TYPES.manaFlows]: 24, [UPKEEP_TYPES.death]: 8 }, "production"),
            ...citySignatureToHomogeneousValueEffect(34)
        ]
    }),
    [buildings.aether.golemBuilder]: magicBuilding(buildings.aether.golemBuilder, "Golem Builder", "Replaces all people requirements in radius with mana requirements.", ["support", "arcane"], {
        requirements: [
            requires.technologyUnlocked(technologies.aether.livingClay),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 3),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 26 }, "production"),
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 5, [UPKEEP_TYPES.gold]: 3 }, "upkeep"),
            ...citySignatureToHomogeneousValueEffect(32)
        ]
    }),
    [buildings.aether.suppressionTotem]: {
        ...magicBuilding(buildings.aether.suppressionTotem, "Suppression Totem", "Consumes mana to strongly reduce city signature while suppressing nearby production.", ["visibility", "ritual"], {
            requirements: [
                requires.technologyUnlocked(technologies.aether.mysticalHostility),
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 2),
                requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 1),
            ],
            values: [
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 8, [UPKEEP_TYPES.death]: 22 }, "production"),
                ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 5 }, "upkeep"),
                ...citySignatureToHomogeneousValueEffect(10)
            ]
        }),
    },
    [buildings.aether.spiritTrap]: magicSuperstructure(buildings.aether.spiritTrap, "Spirit Trap", "A spirit hut and suppression totem combined into a dangerous mana trap.", ["production", "manaFlows", "ritual"], {
        requiredBuildingIds: [
            buildings.aether.spiritHut,
            buildings.aether.suppressionTotem,
        ],
        requirements: [
            requires.buildingExists(buildings.aether.spiritHut),
            requires.buildingExists(buildings.aether.suppressionTotem),
            requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 3),
        ],
        values: [
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.manaFlows]: 30, [UPKEEP_TYPES.death]: 36 }, "production"),
            ...citySignatureToHomogeneousValueEffect(30)
        ]
    }),
};
export const aetherBuildings: {
    [key: string]: Building;
} = Object.fromEntries(Object.values(aetherBuildingsRaw).map(building => [building.id, building]));

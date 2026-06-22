import type { GunPart } from '../../../models/battle/towerParts.ts';
import { gunparts, technologies } from '../../identificators/index.ts';
import { requires } from "../../requirements.ts";
import { UPKEEP_TYPES } from "../../../models/Upkeep.ts";
import { createTowerPartFactory } from "./towerPartFactory.ts";
import { upkeepAmountToHomogeneousValueEffects } from "../../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../homogeneousValues/index.ts";
const { part } = createTowerPartFactory({
    vector: "medieval",
    defaultKeywords: ["medieval"],
});
const medievalTowerPartsRaw: Record<string, GunPart> = {
    [gunparts.launchSystems.medieval.crudeSling]: part(gunparts.launchSystems.medieval.crudeSling, "launchSystem", "Primitive Launcher", "Crude slingshot. It is a bit rough, but it works.", {
        keywords: ["rough", "wood"],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 5
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: 300
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerBurstCount,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 300
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: 0.7
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 3
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed,
                additionalKeywords: ["production"],
                additive: 1.5
            }
        ]
    }),
    [gunparts.barrels.medieval.hollowedTrunk]: part(gunparts.barrels.medieval.hollowedTrunk, "barrel", "Hollow trunk", "Old hollow trunk found near the city walls.", {
        spriteTextureKey: "",
        keywords: ["rough", "wood"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.foraging),
            requires.buildingKeywordExists("scavenger"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 2
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 2
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: 100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: -0.15
            },
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 1 }, "upkeep")
        ]
    }),
    [gunparts.ammo.medieval.stoneBasket]: part(gunparts.ammo.medieval.stoneBasket, "ammo", "Stone Basket", "A basket stones.", {
        keywords: ["stone"],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 5
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: -100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: -100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 2
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileRadius,
                additionalKeywords: ["production"],
                additive: 5
            }
        ]
    }),
    [gunparts.ammo.medieval.pickedStones]: part(gunparts.ammo.medieval.pickedStones, "ammo", "Hand picked stones", "A basket of carefully picked stones heavy stones with sharp edges", {
        spriteTextureKey: "",
        keywords: ["stone"],
        requirements: [
            requires.buildingKeywordExists("scavenger"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 8
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: -100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 2
            },
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 1 }, "upkeep")
        ]
    }),
    [gunparts.barrels.medieval.carvedLog]: part(gunparts.barrels.medieval.carvedLog, "barrel", "Carved out log", "Fresh log carefully hollowed by hands and crude tools.", {
        spriteTextureKey: "",
        keywords: ["rough", "wood"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.timberProcessing),
            requires.buildingKeywordExists("timberwork"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 3
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 3
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: 100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 200
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: -0.25
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 2,
                [UPKEEP_TYPES.gold]: 1,
            }, "upkeep")
        ]
    }),
    [gunparts.launchSystems.medieval.handTrebuchet]: part(gunparts.launchSystems.medieval.handTrebuchet, "launchSystem", "Hand drawn trebuchet", "Flexible planks and a bit of rope. Basically a big bow attached to a gun platform.", {
        spriteTextureKey: "",
        keywords: ["rough", "wood"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.timberProcessing),
            requires.buildingKeywordExists("timberwork"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 7
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: 400
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerBurstCount,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: 0.5
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 400
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 3
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed,
                additionalKeywords: ["production"],
                additive: 1.5
            },
            ...upkeepAmountToHomogeneousValueEffects({ [UPKEEP_TYPES.people]: 2 }, "upkeep")
        ]
    }),
    [gunparts.ammo.medieval.sharpenedStakes]: part(gunparts.ammo.medieval.sharpenedStakes, "ammo", "Sharpened stakes", "Bunch or thick sticks sharpened by axe", {
        spriteTextureKey: "",
        keywords: ["stone"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.timberProcessing),
            requires.buildingKeywordExists("timberwork"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 3
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: 100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: 0.1
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 2,
                [UPKEEP_TYPES.gold]: 1,
            }, "upkeep")
        ]
    }),
    [gunparts.barrels.medieval.boredTimberBarrel]: part(gunparts.barrels.medieval.boredTimberBarrel, "barrel", "Bored timber barrel", "Whole three bored and sanded from inside", {
        spriteTextureKey: "",
        keywords: ["wood"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.woodworking),
            requires.buildingKeywordExists("woodWorking"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 5
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 3
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: 200
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 300
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: -0.5
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 4,
                [UPKEEP_TYPES.gold]: 3,
            }, "upkeep")
        ]
    }),
    [gunparts.ammo.medieval.baseWoodArrow]: part(gunparts.ammo.medieval.baseWoodArrow, "ammo", "Wooden arrows", "Simple but carefully crafted", {
        spriteTextureKey: "",
        keywords: ["wood"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.woodworking),
            requires.buildingKeywordExists("woodWorking"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 5
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: 200
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond,
                additionalKeywords: ["production"],
                additive: 1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 200
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 3,
                [UPKEEP_TYPES.gold]: 2,
            }, "upkeep")
        ]
    }),
    [gunparts.bases.medieval.woodenRails]: part(gunparts.bases.medieval.woodenRails, "platform", "Wooden rails", "Set of rails to aid in tower rotation", {
        spriteTextureKey: "",
        keywords: ["wood"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.woodworking),
            requires.buildingKeywordExists("woodWorking"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed,
                additionalKeywords: ["production"],
                additive: 0.25
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 3,
                [UPKEEP_TYPES.gold]: 2,
            }, "upkeep")
        ]
    }),
    [gunparts.loadingSystems.medieval.leverLoader]: part(gunparts.loadingSystems.medieval.leverLoader, "loadingSystem", "Lever loader", "Clever lever loading mechanism allows to load ammo faster", {
        spriteTextureKey: "",
        keywords: ["wood"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.woodworking),
            requires.buildingKeywordExists("woodWorking"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond,
                additionalKeywords: ["production"],
                additive: 1
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 1,
                [UPKEEP_TYPES.gold]: 5,
            }, "upkeep")
        ]
    }),
    [gunparts.barrels.medieval.stoneRails]: part(gunparts.barrels.medieval.stoneRails, "barrel", "Stone rails", "Set of stone rails to guide projectile.", {
        spriteTextureKey: "",
        keywords: ["stone"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.stoneworking),
            requires.buildingKeywordExists("stoneWorking"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
                additionalKeywords: ["production"],
                additive: 7
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
                additionalKeywords: ["production"],
                additive: 5
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
                additionalKeywords: ["production"],
                additive: 100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: -0.3
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 2,
                [UPKEEP_TYPES.gold]: 3,
            }, "upkeep")
        ]
    }),
    [gunparts.aimSystems.medieval.makeshiftWoodenAim]: part(gunparts.aimSystems.medieval.makeshiftWoodenAim, "aimSystem", "Makeshift wooden aim", "Few planks with holes in them but it still helps to land a shot", {
        spriteTextureKey: "",
        keywords: ["stone"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.stoneworking),
            requires.buildingKeywordExists("stoneWorking"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
                additionalKeywords: ["production"],
                additive: 100
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: -0.1
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds,
                additionalKeywords: ["production"],
                additive: -0.5
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 2,
                [UPKEEP_TYPES.gold]: 3,
            }, "upkeep")
        ]
    }),
    [gunparts.bases.medieval.stoneRails]: part(gunparts.bases.medieval.stoneRails, "platform", "Stone rails", "Set of stone rails to aid in tower rotation", {
        spriteTextureKey: "",
        keywords: ["stone"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.stoneworking),
            requires.buildingKeywordExists("stoneWorking"),
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed,
                additionalKeywords: ["production"],
                additive: 0.45
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
                additionalKeywords: ["production"],
                additive: -0.1
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 2,
                [UPKEEP_TYPES.gold]: 3,
            }, "upkeep")
        ]
    }),
    [gunparts.loadingSystems.medieval.counterweightLoader]: part(gunparts.loadingSystems.medieval.counterweightLoader, "loadingSystem", "Counterweight loader", "Loader with a handy stone counterweight. Allows to handle bigger projectiles just as quick", {
        spriteTextureKey: "",
        keywords: ["stone"],
        requirements: [
            requires.technologyUnlocked(technologies.medieval.stoneworking),
            requires.buildingKeywordExists("stoneWorking"),
        ],
        effects: [
            {
                radius: 0,
                requiredValueKeywords: ["projectileDamage"],
                multiplier: 1.2,
            },
        ],
        values: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileRadius,
                additionalKeywords: ["production"],
                additive: 4
            },
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.people]: 1,
                [UPKEEP_TYPES.gold]: 5,
            }, "upkeep")
        ]
    }),
};
export const medievalTowerParts: GunPart[] = Object.values(medievalTowerPartsRaw);

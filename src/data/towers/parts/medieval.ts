import type {GunPart} from '../../../models/battle/towerParts.ts';
import {gunparts, technologies} from '../../identificators/index.ts';
import {requires} from "../../requirements.ts";
import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";
import {createTowerPartFactory} from "./towerPartFactory.ts";

const {part} = createTowerPartFactory({
  vector: "medieval",
  defaultKeywords: ["medieval"],
});

const medievalTowerPartsRaw: Record<string, GunPart> = {
  [gunparts.launchSystems.medieval.crudeSling]: part(
    gunparts.launchSystems.medieval.crudeSling,
    "launchSystem",
    "Primitive Launcher",
    "Crude slingshot. It is a bit rough, but it works.",
    {
      projectileDamage: 5,
      projectileSpeed: 300,
      shotsPerSecond: 1,
      targetingDistanceLimit: 300,
      projectileSpread: 0.5,
      weight: 3,
    },
    {keywords: ["rough", "wood"]},
  ),
  [gunparts.barrels.medieval.hollowedTrunk]: part(
    gunparts.barrels.medieval.hollowedTrunk,
    "barrel",
    "Hollow trunk",
    "Old hollow trunk found near the city walls.",
    {
      projectileDamage: 2,
      weight: 2,
      projectileSpeed: 100,
      targetingDistanceLimit: 100,
      projectileSpread: -0.15,
    },
    {
      spriteTextureKey: "",
      keywords: ["rough", "wood"],
      requirements: [
        requires.technologyUnlocked(technologies.medieval.foraging),
        requires.buildingKeywordExists("scavenger"),
      ],
      supportCost: {[UPKEEP_TYPES.people]: 1},
    },
  ),
  [gunparts.ammo.medieval.stoneBasket]: part(
    gunparts.ammo.medieval.stoneBasket,
    "ammo",
    "Stone Basket",
    "A basket stones.",
    {
      projectileDamage: 5,
      projectileSpeed: -100,
      targetingDistanceLimit: -100,
      weight: 2,
    },
    {keywords: ["stone"]},
  ),
  [gunparts.ammo.medieval.pickedStones]: part(
    gunparts.ammo.medieval.pickedStones,
    "ammo",
    "Hand picked stones",
    "A basket of carefully picked stones heavy stones with sharp edges",
    {
      projectileDamage: 8,
      targetingDistanceLimit: -100,
      weight: 2,
    },
    {
      spriteTextureKey: "",
      keywords: ["stone"],
      requirements: [
          requires.buildingKeywordExists("scavenger"),
      ],
      supportCost: {[UPKEEP_TYPES.people]: 1},
    },
  ),
  [gunparts.barrels.medieval.carvedLog]: part(
    gunparts.barrels.medieval.carvedLog,
    "barrel",
    "Carved out log",
    "Fresh log carefully hollowed by hands and crude tools.",
    {
      projectileDamage: 3,
      weight: 3,
      projectileSpeed: 100,
      targetingDistanceLimit: 200,
      projectileSpread: -0.25,
    },
    {
      spriteTextureKey: "",
      keywords: ["rough", "wood"],
      requirements: [
          requires.technologyUnlocked(technologies.medieval.timberProcessing),
          requires.buildingKeywordExists("timberwork"),
      ],
      supportCost: {
        [UPKEEP_TYPES.people]: 2,
        [UPKEEP_TYPES.gold]: 1,
      },
    },
  ),
  [gunparts.launchSystems.medieval.handTrebuchet]: part(
    gunparts.launchSystems.medieval.handTrebuchet,
    "launchSystem",
    "Hand drawn trebuchet",
    "Flexible planks and a bit of rope. Basically a big bow attached to a gun platform.",
    {
      projectileDamage: 7,
      projectileSpeed: 400,
      shotsPerSecond: 1,
      projectileSpread: 0.5,
      targetingDistanceLimit: 400,
      weight: 3,
    },
    {
      spriteTextureKey: "",
      keywords: ["rough","wood"],
      requirements: [
          requires.technologyUnlocked(technologies.medieval.timberProcessing),
          requires.buildingKeywordExists("timberwork"),
      ],
      supportCost: {[UPKEEP_TYPES.people]: 2},
    },
  ),
  [gunparts.ammo.medieval.sharpenedStakes]: part(
    gunparts.ammo.medieval.sharpenedStakes,
    "ammo",
    "Sharpened stakes",
    "Bunch or thick sticks sharpened by axe",
    {
      projectileDamage: 3,
      weight: 1,
      projectileSpeed: 100,
      shotsPerSecond: 1,
      targetingDistanceLimit: 100,
        projectileSpread: 0.1,
    },
    {
      spriteTextureKey: "",
      keywords: ["stone"],
      requirements: [
          requires.technologyUnlocked(technologies.medieval.timberProcessing),
          requires.buildingKeywordExists("timberwork"),
      ],
      supportCost: {
        [UPKEEP_TYPES.people]: 2,
        [UPKEEP_TYPES.gold]: 1,
      },
    },
  ),
    [gunparts.barrels.medieval.boredTimberBarrel]: part(
        gunparts.barrels.medieval.boredTimberBarrel,
        "barrel",
        "Bored timber barrel",
        "Whole three bored and sanded from inside",
        {
            projectileDamage: 5,
            weight: 3,
            projectileSpeed: 200,
            targetingDistanceLimit: 300,
            projectileSpread: -0.5,
        },
        {
            spriteTextureKey: "",
            keywords: ["wood"],
            requirements: [
                requires.technologyUnlocked(technologies.medieval.woodworking),
                requires.buildingKeywordExists("woodWorking"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 4,
                [UPKEEP_TYPES.gold]: 3,
            },
        },
    ),
    [gunparts.ammo.medieval.baseWoodArrow]: part(
        gunparts.ammo.medieval.baseWoodArrow,
        "ammo",
        "Wooden arrows",
        "Simple but carefully crafted",
        {
            projectileDamage: 5,
            weight: 1,
            projectileSpeed: 200,
            shotsPerSecond: 1,
            targetingDistanceLimit: 200,
        },
        {
            spriteTextureKey: "",
            keywords: ["wood"],
            requirements: [
                requires.technologyUnlocked(technologies.medieval.woodworking),
                requires.buildingKeywordExists("woodWorking"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 3,
                [UPKEEP_TYPES.gold]: 2,
            },
        },
    ),
    [gunparts.bases.medieval.woodenRails]: part(
        gunparts.bases.medieval.woodenRails,
        "platform",
        "Wooden rails",
        "Set of rails to aid in tower rotation",
        {rotationSpeed: 0.25},
        {
            spriteTextureKey: "",
            keywords: ["wood"],
            requirements: [
                requires.technologyUnlocked(technologies.medieval.woodworking),
                requires.buildingKeywordExists("woodWorking"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 3,
                [UPKEEP_TYPES.gold]: 2,
            },
        },
    ),
    [gunparts.loadingSystems.medieval.leverLoader]: part(
        gunparts.loadingSystems.medieval.leverLoader,
        "loadingSystem",
        "Lever loader",
        "Clever lever loading mechanism allows to load ammo faster",
        {shotsPerSecond: 1,},
        {
            spriteTextureKey: "",
            keywords: ["wood"],
            requirements: [
                requires.technologyUnlocked(technologies.medieval.woodworking),
                requires.buildingKeywordExists("woodWorking"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 1,
                [UPKEEP_TYPES.gold]: 5,
            },
        },
    ),
    [gunparts.barrels.medieval.boredTimberBarrel]: part(
        gunparts.barrels.medieval.boredTimberBarrel,
        "barrel",
        "Bored timber barrel",
        "Whole three bored and sanded from inside",
        {
            projectileDamage: 5,
            weight: 3,
            projectileSpeed: 200,
            targetingDistanceLimit: 300,
            projectileSpread: -0.5,
        },
        {
            spriteTextureKey: "",
            keywords: ["wood"],
            requirements: [
                requires.technologyUnlocked(technologies.medieval.woodworking),
                requires.buildingKeywordExists("woodWorking"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 4,
                [UPKEEP_TYPES.gold]: 3,
            },
        },
    ),
    [gunparts.ammo.medieval.baseWoodArrow]: part(
        gunparts.ammo.medieval.baseWoodArrow,
        "ammo",
        "Wooden arrows",
        "Simple but carefully crafted",
        {
            projectileDamage: 5,
            weight: 1,
            projectileSpeed: 200,
            shotsPerSecond: 1,
            targetingDistanceLimit: 200,
        },
        {
            spriteTextureKey: "",
            keywords: ["wood"],
            requirements: [
                requires.technologyUnlocked(technologies.medieval.woodworking),
                requires.buildingKeywordExists("woodWorking"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 3,
                [UPKEEP_TYPES.gold]: 2,
            },
        },
    ),
    [gunparts.bases.medieval.woodenRails]: part(
        gunparts.bases.medieval.woodenRails,
        "platform",
        "Wooden rails",
        "Set of rails to aid in tower rotation",
        {rotationSpeed: 0.25},
        {
            spriteTextureKey: "",
            keywords: ["wood"],
            requirements: [
                requires.technologyUnlocked(technologies.medieval.woodworking),
                requires.buildingKeywordExists("woodWorking"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 3,
                [UPKEEP_TYPES.gold]: 2,
            },
        },
    ),
    [gunparts.loadingSystems.medieval.leverLoader]: part(
        gunparts.loadingSystems.medieval.leverLoader,
        "loadingSystem",
        "Lever loader",
        "Clever lever loading mechanism allows to load ammo faster",
        {shotsPerSecond: 1,},
        {
            spriteTextureKey: "",
            keywords: ["wood"],
            requirements: [
                requires.technologyUnlocked(technologies.medieval.woodworking),
                requires.buildingKeywordExists("woodWorking"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 1,
                [UPKEEP_TYPES.gold]: 5,
            },
        },
    ),
};

export const medievalTowerParts: GunPart[] = Object.values(medievalTowerPartsRaw);

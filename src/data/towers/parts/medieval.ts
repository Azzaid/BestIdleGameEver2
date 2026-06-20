import type {GunPart} from '../../../models/battle/towerParts.ts';
import {buildings, gunparts, technologies} from '../../identificators/index.ts';
import {requires} from "../../requirements.ts";
import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";
import {createTowerPartFactory} from "./towerPartFactory.ts";

const {part} = createTowerPartFactory({
  vector: "medieval",
  defaultKeywords: ["medieval"],
});

const medievalTowerPartsRaw: Record<string, GunPart> = {
  [gunparts.bases.medieval.crudeWoodFrame]: part(
    gunparts.bases.medieval.crudeWoodFrame,
    "platform",
    "Crude Wood Frame",
    "A rough rotating scaffold lashed onto a wall tower platform.",
    {rotationSpeed: 0.25},
    {keywords: ["rough", "grounded", "turret"]},
  ),
  [gunparts.launchSystems.medieval.crudeSling]: part(
    gunparts.launchSystems.medieval.crudeSling,
    "launchSystem",
    "Primitive Launcher",
    "Crude slingshot. It is a bit rough, but it works.",
    {
      projectileDamage: 5,
      projectileSpeed: 300,
      shotsPerSecond: -1,
      targetingDistanceLimit: 300,
      projectileSpread: 0.5,
      weight: 3,
    },
    {keywords: ["mechanical", "rough"]},
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
      keywords: ["rough", "tower", "wooden"],
      requirements: [
        requires.technologyUnlocked(technologies.medieval.foraging),
        requires.buildingExists(buildings.medieval.scrapCollectionPoint),
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
    {keywords: ["projectile", "stone"]},
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
      keywords: ["projectile", "stone"],
      requirements: [
        requires.buildingExists(buildings.medieval.scrapCollectionPoint),
      ],
      supportCost: {[UPKEEP_TYPES.people]: 1},
    },
  ),
  [gunparts.barrels.medieval.carvedTrunk]: part(
    gunparts.barrels.medieval.carvedTrunk,
    "barrel",
    "Carved out trunk",
    "New trunk carefully hollowed by hands and crude tools.",
    {
      projectileDamage: 3,
      weight: 3,
      projectileSpeed: 100,
      targetingDistanceLimit: 200,
      projectileSpread: -0.25,
    },
    {
      spriteTextureKey: "",
      keywords: ["rough", "tower", "wooden"],
      requirements: [
        requires.technologyUnlocked(technologies.medieval.woodworking),
        requires.buildingExists(buildings.medieval.lumberjackHouse),
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
    "Flexible planks and a bit of rope. Basically a big bow attached to a tower base.",
    {
      projectileDamage: 7,
      projectileSpeed: 400,
      shotsPerSecond: -1,
      projectileSpread: 0.5,
      targetingDistanceLimit: 400,
      weight: 3,
    },
    {
      spriteTextureKey: "",
      keywords: ["mechanical", "rough", "tower", "wooden"],
      requirements: [
        requires.technologyUnlocked(technologies.medieval.woodworking),
        requires.buildingExists(buildings.medieval.lumberjackHouse),
      ],
      supportCost: {[UPKEEP_TYPES.people]: 2},
    },
  ),
  [gunparts.ammo.medieval.baseWoodArrow]: part(
    gunparts.ammo.medieval.baseWoodArrow,
    "ammo",
    "Wooden arrows",
    "Basically a sharpened sticks. Fly better but hit worse than a stone.",
    {
      projectileDamage: 3,
      weight: 1,
      projectileSpeed: 100,
      shotsPerSecond: 1,
      targetingDistanceLimit: 100,
    },
    {
      spriteTextureKey: "",
      keywords: ["projectile", "stone"],
      requirements: [
        requires.technologyUnlocked(technologies.medieval.woodworking),
        requires.buildingExists(buildings.medieval.lumberjackHouse),
      ],
      supportCost: {
        [UPKEEP_TYPES.people]: 2,
        [UPKEEP_TYPES.gold]: 1,
      },
    },
  ),
};

export const medievalTowerParts: GunPart[] = Object.values(medievalTowerPartsRaw);

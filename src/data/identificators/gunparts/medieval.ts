export const medievalGunparts = {
  bases: {
    crudeWoodFrame: "medieval_base_crude-wood",
  },
  barrels: {
      hollowedTrunk: "medieval_barrel_hollowed-trunk",
      carvedTrunk: "medieval_barrel_carved-trunk",
  },
  ammo: {
    stoneBasket: "medieval_ammo_crude-stone",
      pickedStones: "medieval_ammo_picked-stones",
      baseWoodArrow: "medieval_ammo_base-wood-arrow",
  },
  aimSystems: {},
  barrelAttachments: {},
  loadingSystems: {},
  launchSystems: {
    crudeSling: "medieval_launcher_crude-sling",
      handTrebuchet: "medieval_launcher_hand-trebuchet",
  },
} as const;

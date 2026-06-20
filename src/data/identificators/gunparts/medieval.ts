export const medievalGunparts = {
  bases: {
      woodenRails: "medieval_base_wooden_rails",
      stoneRails: "medieval_base_stone_rails",
  },
  barrels: {
      hollowedTrunk: "medieval_barrel_hollowed-trunk",
      carvedLog: "medieval_barrel_carved-log",
      boredTimberBarrel: "medieval_barrel_bored-timber-barrel",
      stoneRails: "medieval_barrel_stone_rails",
  },
  ammo: {
    stoneBasket: "medieval_ammo_crude-stone",
      pickedStones: "medieval_ammo_picked-stones",
      sharpenedStakes: "medieval_ammo_base-sharpened_stakes",
      baseWoodArrow: "medieval_ammo_base-wood-arrow",
  },
  aimSystems: {
      makeshiftWoodenAim: "medieval_aimSystems_makeshift_wooden_aim",
  },
  barrelAttachments: {},
  loadingSystems: {
      leverLoader: "medieval_loader_lever_loader",
      counterweightLoader: "medieval_loader_counterweight_loader",
  },
  launchSystems: {
    crudeSling: "medieval_launcher_crude-sling",
      handTrebuchet: "medieval_launcher_hand-trebuchet",
  },
} as const;

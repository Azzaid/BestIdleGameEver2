import type { TowerPartSlot } from "../../models/battle/towerParts.ts";

export const DEFAULT_TOWER_PART_Z_INDEX: Record<TowerPartSlot, number> = {
  platform: 1,
  ammo: 2,
  loadingSystem: 3,
  barrel: 4,
  launchSystem: 5,
  aimSystem: 6,
  barrelAttachment: 6,
};

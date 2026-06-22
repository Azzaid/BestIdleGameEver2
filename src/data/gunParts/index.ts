import type {DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {GunPart, TowerPartsAtlas, TowerPartSlot, TowerSynergyRule} from "../../models/battle/towerParts.ts";
import {aetherTowerParts} from "./parts/aether.ts";
import {medievalTowerParts} from "./parts/medieval.ts";
import {natureTowerParts} from "./parts/nature.ts";
import {techTowerParts} from "./parts/tech.ts";

export const TOWER_PART_SLOT_ORDER: { key: TowerPartSlot; label: string }[] = [
  { key: 'launchSystem', label: 'Launch System' },
  { key: 'platform', label: 'Platform / Turret' },
  { key: 'barrel', label: 'Barrel' },
  { key: 'ammo', label: 'Ammunition' },
  { key: 'aimSystem', label: 'Aiming System' },
  { key: 'barrelAttachment', label: 'Barrel Attachment' },
  { key: 'loadingSystem', label: 'Loading System' },
];

export const REQUIRED_TOWER_PART_SLOTS: TowerPartSlot[] = [
  'ammo',
  'launchSystem',
];

export const TOWER_PART_DEFINITIONS: GunPart[] = [
  ...techTowerParts,
  ...natureTowerParts,
  ...medievalTowerParts,
  ...aetherTowerParts,
];

export const TOWER_SYNERGY_RULES: TowerSynergyRule[] = [
];

const createEmptyTowerPartsAtlas = (): TowerPartsAtlas => ({
  tech: {},
  nature: {},
  medieval: {},
  aether: {},
});

export const TOWER_PARTS_ATLAS = TOWER_PART_DEFINITIONS.reduce<TowerPartsAtlas>((atlas, part) => {
  const vector: DevelopmentVectorKey = part.vector ?? "medieval";
  atlas[vector][part.id] = part;
  return atlas;
}, createEmptyTowerPartsAtlas());

export const TOWER_PARTS: GunPart[] = Object.values(TOWER_PARTS_ATLAS).flatMap(partsById => Object.values(partsById));

export const TOWER_PARTS_BY_ID = Object.values(TOWER_PARTS_ATLAS).reduce<Record<string, GunPart>>(
  (allParts, partsById) => ({...allParts, ...partsById}),
  {},
);

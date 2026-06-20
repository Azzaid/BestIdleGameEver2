import type {GunPart, TowerPartSlot, TowerSynergyRule} from '../../../models/battle/towerParts.ts';
import {aetherTowerParts} from './aether.ts';
import {medievalTowerParts} from './medieval.ts';
import {natureTowerParts} from './nature.ts';
import {techTowerParts} from './tech.ts';

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

export const TOWER_PARTS = TOWER_PART_DEFINITIONS;

export const TOWER_PARTS_BY_ID = Object.fromEntries(
  TOWER_PART_DEFINITIONS.map((part) => [part.id, part])
) as Record<string, GunPart>;

export const TOWER_SYNERGY_RULES: TowerSynergyRule[] = [
];

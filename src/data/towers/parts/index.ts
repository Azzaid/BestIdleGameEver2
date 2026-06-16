import type {GunPart, TowerPartSlot, TowerSynergyRule} from '../../../models/battle/towerParts.ts';
import {aetherTowerParts} from './aether.ts';
import {medievalTowerParts} from './medieval.ts';
import {natureTowerParts} from './nature.ts';
import {techTowerParts} from './tech.ts';

export const TOWER_PART_SLOT_ORDER: { key: TowerPartSlot; label: string }[] = [
  { key: 'platform', label: 'Platform / Turret' },
  { key: 'barrel', label: 'Barrel' },
  { key: 'ammo', label: 'Ammunition' },
  { key: 'aimSystem', label: 'Aiming System' },
  { key: 'barrelAttachment', label: 'Barrel Attachment' },
  { key: 'loadingSystem', label: 'Loading System' },
  { key: 'launchSystem', label: 'Launch System' },
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
  {
    id: 'piercing-explosive',
    name: 'Shaped Fragmentation',
    description: 'Piercing delivery spreads explosive force through clustered enemies.',
    requiredKeywords: ['piercing', 'explosive'],
    modifiers: { aoeRadius: 12, projectileDamage: -1 },
    addKeywords: ['fragmenting'],
    addAimKeywords: ['hitMoreEnemiesWithPiercingProjectile'],
  },
  {
    id: 'precision-powered',
    name: 'Rail Alignment',
    description: 'Powered precision parts align into a faster, longer-ranged shot.',
    requiredKeywords: ['precision', 'powered'],
    modifiers: { projectileSpeed: 120, targetingDistanceLimit: 60 },
  },
  {
    id: 'rapid-stable',
    name: 'Controlled Cycling',
    description: 'Stable hardware keeps rapid loading from shaking the tower off target.',
    requiredKeywords: ['rapid', 'stable'],
    modifiers: { reloadSpeed: 0.2, retargetCooldownSeconds: -0.06 },
  },
  {
    id: 'arcane-amplifier',
    name: 'Resonant Focus',
    description: 'Arcane focusing turns each shot into a slower but heavier impact.',
    requiredKeywords: ['arcane', 'amplifier'],
    modifiers: { projectileDamage: 6, reloadSpeed: -0.1 },
    addKeywords: ['resonant'],
  },
  {
    id: 'poison-control',
    name: 'Predatory Suppression',
    description: 'Biological control payloads are tuned to keep pressure under control.',
    requiredKeywords: ['poison', 'control'],
    modifiers: { retargetCooldownSeconds: -0.05 },
    addAimKeywords: ['leastHP'],
  },
  {
    id: 'biological-amplifier',
    name: 'Blooming Payload',
    description: 'Living payloads blossom wider when pushed through compatible growths.',
    requiredKeywords: ['biological', 'amplifier'],
    modifiers: { aoeRadius: 10, projectileDamage: 2 },
    addKeywords: ['blooming'],
  },
  {
    id: 'arcane-piercing',
    name: 'Phase Lance',
    description: 'Arcane piercing components keep a shot coherent across longer lanes.',
    requiredKeywords: ['arcane', 'piercing'],
    modifiers: { targetingDistanceLimit: 80, projectileSpeed: 80 },
    addAimKeywords: ['hitMoreEnemiesWithPiercingProjectile'],
  },
];

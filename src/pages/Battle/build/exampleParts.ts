import type { GunPart } from '../../../models/battle/towerParts.ts';

export const PARTS: Record<string, GunPart> = {
  barrel_basic: {
    id: 'barrel_basic',
    name: 'Basic Barrel',
    sprite: { textureKey: 'barrel_basic' },
    attachmentOffset: { x: 16, y: 0 },
    keywords: new Set(['projectile']),
    modifiers: { projectileSpeed: 100 },
  },
  loader_fast: {
    id: 'loader_fast',
    name: 'Fast Loader',
    sprite: { textureKey: 'loader_fast' },
    attachmentOffset: { x: 0, y: -8 },
    keywords: new Set(),
    modifiers: { reloadSpeed: 0.5 },
  },
  ammo_explosive: {
    id: 'ammo_explosive',
    name: 'Explosive Ammo',
    sprite: { textureKey: 'ammo_explosive' },
    attachmentOffset: { x: 0, y: 0 },
    keywords: new Set(['aoe']),
    modifiers: { aoeRadius: 32, projectileDamage: 5 },
  },
};

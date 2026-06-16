import type { GunPart } from '../../../models/battle/towerParts.ts';
import {gunparts} from '../../../data/identificators/index.ts';

export const PARTS: Record<string, GunPart> = {
  [gunparts.barrels.medieval.crudeWood]: {
    id: gunparts.barrels.medieval.crudeWood,
    name: 'Crude Barrel',
    sprite: { textureKey: 'medieval_barrel_crude-wood' },
    attachmentOffset: { x: 16, y: 0 },
    keywords: new Set(['projectile']),
    modifiers: { projectileSpeed: 100 },
  },
  [gunparts.loadingSystems.tech.fastLoader]: {
    id: gunparts.loadingSystems.tech.fastLoader,
    name: 'Fast Loader',
    sprite: { textureKey: 'loader_fast' },
    attachmentOffset: { x: 0, y: -8 },
    keywords: new Set(),
    modifiers: { reloadSpeed: 0.5 },
  },
  [gunparts.ammo.medieval.stoneBasket]: {
    id: gunparts.ammo.medieval.stoneBasket,
    name: 'Stone Basket',
    sprite: { textureKey: 'medieval_ammo_crude-stone' },
    attachmentOffset: { x: 0, y: 0 },
    keywords: new Set(['aoe']),
    modifiers: { aoeRadius: 32, projectileDamage: 5 },
  },
};

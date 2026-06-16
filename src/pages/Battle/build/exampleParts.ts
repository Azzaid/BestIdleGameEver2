import type { GunPart } from '../../../models/battle/towerParts.ts';
import {gunparts} from '../../../data/identificators/index.ts';

export const PARTS: Record<string, GunPart> = {
  [gunparts.bases.medieval.crudeWoodFrame]: {
    id: gunparts.bases.medieval.crudeWoodFrame,
    name: 'Crude Wood Frame',
    sprite: { textureKey: 'medieval_base_crude-wood' },
    attachmentOffset: { x: 0, y: 0 },
    keywords: new Set(['rough']),
    modifiers: { rotationSpeed: 0.25 },
  },
  [gunparts.ammo.medieval.stoneBasket]: {
    id: gunparts.ammo.medieval.stoneBasket,
    name: 'Stone Basket',
    sprite: { textureKey: 'medieval_ammo_crude-stone' },
    attachmentOffset: { x: 0, y: 0 },
    keywords: new Set(['projectile', 'stone']),
    modifiers: { projectileDamage: 2 },
  },
  [gunparts.launchSystems.medieval.crudeSling]: {
    id: gunparts.launchSystems.medieval.crudeSling,
    name: 'Crude Hollow Trunk',
    sprite: { textureKey: 'medieval_launcher_crude-sling' },
    attachmentOffset: { x: 0, y: 0 },
    keywords: new Set(['mechanical', 'rough']),
    modifiers: { projectileSpeed: 50 },
  },
};

import type { GunPart } from '../../../models/battle/towerParts.ts';
import {gunparts} from '../../../data/identificators/index.ts';

export const PARTS: Record<string, GunPart> = {
  [gunparts.bases.medieval.crudeWoodFrame]: {
    id: gunparts.bases.medieval.crudeWoodFrame,
    name: 'Crude Wood Frame',
    sprite: { textureKey: gunparts.bases.medieval.crudeWoodFrame },
    attachmentOffset: { x: 0, y: 0 },
    keywords: new Set(['rough']),
    modifiers: { rotationSpeed: 0.25 },
  },
  [gunparts.ammo.medieval.stoneBasket]: {
    id: gunparts.ammo.medieval.stoneBasket,
    name: 'Stone Basket',
    sprite: { textureKey: gunparts.ammo.medieval.stoneBasket },
    attachmentOffset: { x: 0, y: 0 },
    keywords: new Set(['projectile', 'stone']),
    modifiers: { projectileDamage: 2 },
  },
  [gunparts.launchSystems.medieval.crudeSling]: {
    id: gunparts.launchSystems.medieval.crudeSling,
    name: 'Primitive Launcher',
    sprite: { textureKey: gunparts.launchSystems.medieval.crudeSling },
    attachmentOffset: { x: 0, y: 0 },
    keywords: new Set(['mechanical', 'rough']),
    modifiers: { projectileSpeed: 50 },
  },
};

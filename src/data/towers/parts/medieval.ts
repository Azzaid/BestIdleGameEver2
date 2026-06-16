import type {GunPart} from '../../../models/battle/towerParts.ts';
import {gunparts} from '../../identificators/index.ts';

export const medievalTowerParts: GunPart[] = [
  {
    id: gunparts.bases.medieval.crudeWoodFrame,
    slot: 'platform',
    name: 'Crude Wood Frame',
    description: 'A rough rotating scaffold lashed onto a wall tower platform.',
    vector: 'medieval',
    sprite: {textureKey: 'medieval_base_crude-wood'},
    attachmentOffset: {x: 0, y: 0},
    keywords: new Set(['rough', 'grounded', 'turret']),
    modifiers: {rotationSpeed: 0.25, projectileDamage: 1, retargetCooldownSeconds: 0.04},
    weight: 1,
    supportCost: {},
  },
  {
    id: gunparts.ammo.medieval.stoneBasket,
    slot: 'ammo',
    name: 'Stone Basket',
    description: 'A basket of hand-picked stones for the first city defensive towers.',
    vector: 'medieval',
    sprite: {textureKey: 'medieval_ammo_crude-stone'},
    attachmentOffset: {x: 0, y: 0},
    keywords: new Set(['projectile', 'stone']),
    modifiers: {projectileDamage: 2, projectileSpeed: -20},
    weight: 2,
    supportCost: {},
  },
  {
    id: gunparts.launchSystems.medieval.crudeSling,
    slot: 'launchSystem',
    name: 'Crude Hollow Trunk',
    description: 'A hollowed trunk and rope launcher unlocked by early foraging.',
    vector: 'medieval',
    sprite: {textureKey: 'medieval_launcher_crude-sling'},
    attachmentOffset: {x: 0, y: 0},
    keywords: new Set(['mechanical', 'rough']),
    modifiers: {projectileDamage: 2, projectileSpeed: 50, reloadSpeed: -0.05},
    weight: 3,
    supportCost: {},
  },
];

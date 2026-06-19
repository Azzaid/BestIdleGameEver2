import type {GunPart} from '../../../models/battle/towerParts.ts';
import {HOMOGENEOUS_VALUE_IDS} from '../../homogeneousValues/index.ts';
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
    homogeneousValueEffects: [
      {valueId: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed, additionalKeywords: ['production'], additive: 0.25},
      {valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage, additionalKeywords: ['production'], additive: 1},
      {valueId: HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds, additionalKeywords: ['production'], additive: 0.04},
      {valueId: HOMOGENEOUS_VALUE_IDS.towerWeight, additionalKeywords: ['production'], additive: 1},
    ],
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
    homogeneousValueEffects: [
      {valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage, additionalKeywords: ['production'], additive: 2},
      {valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed, additionalKeywords: ['production'], additive: -20},
      {valueId: HOMOGENEOUS_VALUE_IDS.towerWeight, additionalKeywords: ['production'], additive: 2},
    ],
  },
  {
    id: gunparts.launchSystems.medieval.crudeSling,
    slot: 'launchSystem',
    name: 'Primitive Launcher',
    description: 'The starting launcher component for the first tower.',
    vector: 'medieval',
    sprite: {textureKey: 'medieval_launcher_crude-sling'},
    attachmentOffset: {x: 0, y: 0},
    keywords: new Set(['mechanical', 'rough']),
    homogeneousValueEffects: [
      {valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage, additionalKeywords: ['production'], additive: 2},
      {valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed, additionalKeywords: ['production'], additive: 50},
      {valueId: HOMOGENEOUS_VALUE_IDS.towerReloadSpeed, additionalKeywords: ['production'], additive: -0.05},
      {valueId: HOMOGENEOUS_VALUE_IDS.towerWeight, additionalKeywords: ['production'], additive: 3},
    ],
  },
    {
        id: gunparts.barrels.medieval.hollowedTrunk,
        slot: 'barrel',
        name: 'Hollowed trunk',
        description: 'Old hollowed trunk found near the city walls.',
        vector: 'medieval',
        sprite: {textureKey: ''},
        attachmentOffset: {x: 0, y: 0},
        keywords: new Set(['rough', 'barrel', 'tower', 'wooden', 'medieval']),
        homogeneousValueEffects: [
            {valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage, additionalKeywords: ['production'], additive: 1},
            {valueId: HOMOGENEOUS_VALUE_IDS.towerWeight, additionalKeywords: ['production'], additive: 2},
            {valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed, additionalKeywords: ['production'], additive: 1},
            {valueId: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread, additionalKeywords: ['production'], additive: -0.5},
        ],
    },
];

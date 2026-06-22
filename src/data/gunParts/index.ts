import type {DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {
  GunPart,
  TowerPartsAtlas,
  TowerPartSlot,
  TowerSynergyRule,
} from "../../models/battle/towerParts.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import aetherTowerPartDefinitions from "./aether.json";
import medievalTowerPartDefinitions from "./medieval.json";
import natureTowerPartDefinitions from "./nature.json";
import techTowerPartDefinitions from "./tech.json";
import {createTowerPartFactory} from "./towerPartFactory.ts";

type GunPartDefinition = {
  id: string;
  slot: TowerPartSlot;
  name: string;
  description?: string;
  keywords?: string[];
  requirements?: Requirement[];
  buildRequirements?: Requirement[];
  spriteTextureKey?: string;
  aimKeywords?: string[];
  conflictsWithKeywords?: string[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
};

const definitionsByVector: Record<DevelopmentVectorKey, readonly GunPartDefinition[]> = {
  tech: techTowerPartDefinitions as readonly GunPartDefinition[],
  nature: natureTowerPartDefinitions as readonly GunPartDefinition[],
  medieval: medievalTowerPartDefinitions as readonly GunPartDefinition[],
  aether: aetherTowerPartDefinitions as readonly GunPartDefinition[],
};

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
  ...buildTowerParts("tech"),
  ...buildTowerParts("nature"),
  ...buildTowerParts("medieval"),
  ...buildTowerParts("aether"),
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

function buildTowerParts(vector: DevelopmentVectorKey): GunPart[] {
  const {part} = createTowerPartFactory({
    vector,
    defaultKeywords: [vector],
  });

  return definitionsByVector[vector].map(definition => part(
    definition.id,
    definition.slot,
    definition.name,
    definition.description ?? "",
    {
      keywords: definition.keywords,
      requirements: definition.requirements,
      buildRequirements: definition.buildRequirements,
      spriteTextureKey: definition.spriteTextureKey,
      aimKeywords: definition.aimKeywords,
      conflictsWithKeywords: definition.conflictsWithKeywords,
      values: definition.values,
      effects: definition.effects,
    },
  ));
}

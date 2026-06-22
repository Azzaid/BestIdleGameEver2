import type {DevelopmentVectorKey} from "../../../models/DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../../models/homogeneousValues.ts";
import type {Requirement} from "../../../models/progression/requirements.ts";
import type {GunPart, TowerPartSlot} from "../../../models/battle/towerParts.ts";

type TowerPartFactoryOptions = {
  vector: DevelopmentVectorKey;
  defaultKeywords?: string[];
};

type TowerPartOptions = {
  keywords?: string[];
  requirements?: Requirement[];
  buildRequirements?: Requirement[];
  spriteTextureKey?: string;
  aimKeywords?: string[];
  conflictsWithKeywords?: string[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  children?: GunPart[];
};

export function createTowerPartFactory({vector, defaultKeywords = []}: TowerPartFactoryOptions) {
  function part(
    id: string,
    slot: TowerPartSlot,
    name: string,
    description: string,
    options: TowerPartOptions = {},
  ): GunPart {
    return {
      id,
      slot,
      name,
      description,
      vector,
      sprite: {textureKey: options.spriteTextureKey ?? id},
      keywords: new Set([...defaultKeywords, slot, ...(options.keywords ?? [])]),
      requirements: options.requirements,
      buildRequirements: options.buildRequirements,
      aimKeywords: options.aimKeywords,
      conflictsWithKeywords: options.conflictsWithKeywords,
      children: options.children,
      values: options.values,
      effects: options.effects,
    };
  }

  return {
    part,
  };
}

import type {GunPart} from '../../../models/battle/towerParts.ts';
import {createTowerPartFactory} from "./towerPartFactory.ts";

const {part: naturePart} = createTowerPartFactory({
  vector: "nature",
  defaultKeywords: ["nature"],
});

const natureTowerPartsRaw: Record<string, GunPart> = {
};

void naturePart;

export const natureTowerParts: GunPart[] = Object.values(natureTowerPartsRaw);

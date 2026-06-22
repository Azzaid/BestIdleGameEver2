import type {GunPart} from '../../../models/battle/towerParts.ts';
import {createTowerPartFactory} from "./towerPartFactory.ts";

const {part: techPart} = createTowerPartFactory({
  vector: "tech",
  defaultKeywords: ["tech"],
});

const techTowerPartsRaw: Record<string, GunPart> = {
};

void techPart;

export const techTowerParts: GunPart[] = Object.values(techTowerPartsRaw);

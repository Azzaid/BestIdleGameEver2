import type {GunPart} from '../../../models/battle/towerParts.ts';
import {createTowerPartFactory} from "./towerPartFactory.ts";

const {part: aetherPart} = createTowerPartFactory({
  vector: "aether",
  defaultKeywords: ["aether"],
});

const aetherTowerPartsRaw: Record<string, GunPart> = {
};

void aetherPart;

export const aetherTowerParts: GunPart[] = Object.values(aetherTowerPartsRaw);

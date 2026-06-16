import type {SpriteList} from "../SpriteAtlas.ts";
import {buildings} from "../../../data/identificators/index.ts";

import tech_farm_1 from "../../../assets/city/tech/farm_1.png";
import tech_farm_2 from "../../../assets/city/tech/farm_2.png";
import tech_farm_3 from "../../../assets/city/tech/farm_3.png";
import tech_farm_4 from "../../../assets/city/tech/farm_4.png";
import tech_farm_5 from "../../../assets/city/tech/farm_5.png";

export const techBuildingsSprites: SpriteList = {
    tech_farm_1: tech_farm_1,
    tech_farm_2: tech_farm_2,
    [buildings.tech.fossilFuelPowerPlant]: tech_farm_3,
    tech_farm_4: tech_farm_4,
    tech_farm_5: tech_farm_5,
};

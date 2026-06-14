import type {UpkeepAmount, UpkeepDescription} from "../Upkeep.ts";
import type {BuildingTypesValue} from "./BuildingTypes.ts";
import type {BuildingKeyword} from "./Keywords.ts";
import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type WallEffectKeyword = Extract<BuildingKeyword, "slow" | "harm" | "push" | "visibility">;

export type WallSpecialEffect = {
    keyword: WallEffectKeyword;
    value: number;
    description: string;
};

export interface WallBuilding {
    id: string;
    name: string;
    type: BuildingTypesValue;
    requiredUpkeep: UpkeepAmount;
    requiredUpkeepDescription: UpkeepDescription;
    resilience: number;
    camoLevel: number;
    ignoredThreat: number;
    specialEffects: WallSpecialEffect[];
    description: string;
}

export type WallBuildingAtlas = { [k in DevelopmentVectorValue]: Record<string, WallBuilding> };

export type WallResolution = {
    requiredUpkeep: UpkeepAmount;
    resilience: number;
    camoLevel: number;
    ignoredThreat: number;
    specialEffects: WallBuilding["specialEffects"];
};

import type {UpkeepAmount} from "../Upkeep.ts";
import type {BuildingTypesValue} from "./BuildingTypes.ts";
import type {BuildingKeyword} from "./Keywords.ts";
import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../homogeneousValues.ts";
import type {HomogeneousResolvedValueMap} from "../homogeneousValues.ts";

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
    keywords?: BuildingKeyword[];
    homogeneousValueEffects?: HomogeneousValueEffect[];
    homogeneousAdjacency?: HomogeneousAdjacencyRule[];
    specialEffects: WallSpecialEffect[];
    description: string;
}

export type WallBuildingAtlas = { [k in DevelopmentVectorValue]: Record<string, WallBuilding> };

export type WallResolution = {
    requiredUpkeep: UpkeepAmount;
    resilience: number;
    camoLevel: number;
    ignoredThreat: number;
    homogeneousValues: Record<string, number>;
    homogeneousResolvedValues: HomogeneousResolvedValueMap;
    specialEffects: WallBuilding["specialEffects"];
};

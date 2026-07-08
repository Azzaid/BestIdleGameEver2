import type {UpkeepAmount} from "../Upkeep.ts";
import type {BuildingTypesValue} from "./BuildingTypes.ts";
import type {BuildingKeyword} from "./Keywords.ts";
import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousDerivedValueEffect, HomogeneousValueEffect} from "../homogeneousValues.ts";
import type {HomogeneousResolvedValueMap} from "../homogeneousValues.ts";
import type {RequirementGate} from "../progression/requirements.ts";

export interface WallBuilding extends RequirementGate {
    id: string;
    name: string;
    type: BuildingTypesValue;
    vector?: DevelopmentVectorValue;
    keywords?: BuildingKeyword[];
    values?: HomogeneousValueEffect[];
    derivedValues?: HomogeneousDerivedValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
    visualAssetId?: string;
    description: string;
}

export type WallBuildingAtlas = { [k in DevelopmentVectorValue]: Record<string, WallBuilding> };

export type WallResolution = {
    requiredUpkeep: UpkeepAmount;
    resilience: number;
    camoLevel: number;
    ignoredThreat: number;
    pushBackDistance: number;
    pushBacksPerSecond: number;
    pushBackEffectZoneSize: number;
    zoneDotDamage: number;
    zoneDotTicksPerSecond: number;
    zoneDotZoneSize: number;
    zoneDotKeywords: string[];
    homogeneousValues: Record<string, number>;
    homogeneousResolvedValues: HomogeneousResolvedValueMap;
};

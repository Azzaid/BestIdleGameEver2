import type {BuildingTypesValue} from "./BuildingTypes.ts";
import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type {UpkeepAmount} from "../Upkeep.ts";
import type {BuildingKeyword} from "./Keywords.ts";
import type {PlacedBuilding} from "./Building.ts";

export type EffectScope = "self" | "neighbors";

// What an effect can modify
export interface EffectDelta {
    requiredUpkeepAdd?: UpkeepAmount;
    providedUpkeepAdd?: UpkeepAmount;
    traceAdd?: number;
    requiredUpkeepMul?: UpkeepAmount;
    providedUpkeepMul?: UpkeepAmount;
    traceMul?: number;
}

// Simple data-driven filter (extend as needed)
export interface TargetFilter {
    buildingTypes?: BuildingTypesValue[];
    developmentVectors?: DevelopmentVectorValue[];
    keywords?: BuildingKeyword[];   // matches PlacedBuilding.tags
    includeEmptyHexes?: boolean; // allow targeting empty hexes if true
}

// One adjacency rule defined by the *source* building
export interface AdjacencyRule {
    scope: EffectScope;
    radiusInHexes: number;
    targetFilter?: TargetFilter;
    effect: EffectDelta;
}

export interface HexResolvedStats extends EffectDelta {
    effectiveRequiredUpkeep: UpkeepAmount;
    effectiveProvidedUpkeep: UpkeepAmount;
    effectiveTrace: number;
}

export type PlacedCityMap = Map<string, PlacedBuilding>;

export interface CityResolution {
    requiredUpkeep: UpkeepAmount;
    providedUpkeep: UpkeepAmount;
    effectiveUpkeep: UpkeepAmount,
    territoryTrace: number;
    buildingsTrace: number;
    effectiveTrace: number;
}
import type {BuildingTypesValue} from "./BuildingTypes.ts";
import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type {ResourceKeyword, UpkeepAmount} from "../Upkeep.ts";
import type {BuildingKeyword} from "./Keywords.ts";
import type {PlacedBuilding} from "./Building.ts";
import type {HomogeneousValueEffect} from "../homogeneousValues.ts";
import type {HomogeneousResolvedValueMap} from "../homogeneousValues.ts";
import type {HomogeneousResolvedEntity} from "../homogeneousValueResolution.ts";

export type EffectScope = "self" | "neighbors";

export type HexDirection =
    | "top-left"
    | "top-right"
    | "left"
    | "right"
    | "bottom-left"
    | "bottom-right";

// What an effect can modify
export interface EffectDelta {
    requiredUpkeepAdd?: UpkeepAmount;
    providedUpkeepAdd?: UpkeepAmount;
    signatureAdd?: number;
    requiredUpkeepMul?: UpkeepAmount;
    providedUpkeepMul?: UpkeepAmount;
    outputMul?: ResourceOutputModifier | ResourceOutputModifier[];
    signatureMul?: number;
    homogeneousValueEffects?: HomogeneousValueEffect[];
}

export type ResourceOutputModifier = {
    requiredKeywords: ResourceKeyword[];
    multiplier?: number;
    additive?: number;
};

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

export type ExpandRule = {
    requiredBuildings: Partial<Record<HexDirection, string>>;
    resultingBuildings: Partial<Record<HexDirection, string>>;
}

export interface HexResolvedStats extends EffectDelta {
    effectiveRequiredUpkeep: UpkeepAmount;
    effectiveProvidedUpkeep: UpkeepAmount;
    effectiveSignature: number;
    effectiveHomogeneousValueEffects: HomogeneousValueEffect[];
}

export type PlacedCityMap = Map<string, PlacedBuilding>;

export interface CityResolution {
    buildingIds: Set<string>;
    buildingKeywords: Set<string>;
    requiredUpkeep: UpkeepAmount;
    providedUpkeep: UpkeepAmount;
    effectiveUpkeep: UpkeepAmount,
    values: Record<string, number>;
    resolvedHexes: readonly HomogeneousResolvedEntity[];
    resolvedTowers: readonly HomogeneousResolvedEntity[];
    resolvedWallSegments: readonly HomogeneousResolvedEntity[];
    resolvedTechnologies: readonly HomogeneousResolvedEntity[];
    homogeneousValues: Record<string, number>;
    homogeneousResolvedValues: HomogeneousResolvedValueMap;
    producedHomogeneousValues: Record<string, number>;
    upkeepHomogeneousValues: Record<string, number>;
    territorySignature: number;
    buildingsSignature: number;
    cityFootprint: number;
    effectiveSignature: number;
}

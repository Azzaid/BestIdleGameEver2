import type {UpkeepAmount} from "../Upkeep.ts";
import type {PlacedBuilding} from "./Building.ts";
import type {HomogeneousValueEffect} from "../homogeneousValues.ts";
import type {HomogeneousResolvedValueMap} from "../homogeneousValues.ts";
import type {HomogeneousResolvedEntity} from "../homogeneousValueResolution.ts";

export type HexDirection =
    | "top-left"
    | "top-right"
    | "left"
    | "right"
    | "bottom-left"
    | "bottom-right";

export type ExpandRule = {
    requiredBuildings: Partial<Record<HexDirection, string>>;
    resultingBuildings: Partial<Record<HexDirection, string>>;
}

export interface HexResolvedStats {
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

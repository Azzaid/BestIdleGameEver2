import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type { UpkeepAmount, UpkeepDescription } from "../Upkeep.ts";
import type {BuildingTypesValue} from "./BuildingTypes.ts";
import type {BuildingKeyword} from "./Keywords.ts";
import type {AdjacencyRule, HexResolvedStats} from "./Adjancency.ts";
import type {AxialCoordinate} from "./HexGrid.ts";
import type {MultiHexStructureRule} from "./MultiHexStructure.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../homogeneousValues.ts";

/** Building data model (extend later with structured effects if needed) */
export interface Building {
    id: string;
    name: string;
    type: BuildingTypesValue;
    level:number,
    size:number,
    isMultiHex: boolean;
    isMultistructure: boolean;
    vector: DevelopmentVectorValue;
    requiredUpkeep: UpkeepAmount
    requiredUpkeepDescription: UpkeepDescription;
    trace: number;
    providedUpkeep: UpkeepAmount;
    providedUpkeepDescription: UpkeepDescription;
    homogeneousValueEffects?: HomogeneousValueEffect[];
    homogeneousAdjacency?: HomogeneousAdjacencyRule[];
    adjacency: AdjacencyRule[];
    adjacencyDescription: string;
    keywords: BuildingKeyword[];
    description: string;
    multiHexStructure?: MultiHexStructureRule[]
}

export interface PlacedBuilding extends Building, HexResolvedStats, AxialCoordinate {}

export type BuildingAtlas = { [k in DevelopmentVectorValue]: {[key: string]: Building} }

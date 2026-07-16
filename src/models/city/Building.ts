import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type {BuildingTypesValue} from "./BuildingTypes.ts";
import type {BuildingKeyword} from "./Keywords.ts";
import type {HexResolvedStats} from "./Adjancency.ts";
import type {AxialCoordinate} from "./HexGrid.ts";
import type {MultiHexStructureRule} from "./MultiHexStructure.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../homogeneousValues.ts";
import type {RequirementGate} from "../progression/requirements.ts";
import type {ProgressionMetadata} from "../progression/metadata.ts";

/** Building data model (extend later with structured effects if needed) */
export interface Building extends RequirementGate, ProgressionMetadata {
    id: string;
    name: string;
    type: BuildingTypesValue;
    level:number,
    isMultiHex: boolean;
    isMultistructure: boolean;
    vector: DevelopmentVectorValue;
    values?: HomogeneousValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
    adjacencyDescription: string;
    keywords: BuildingKeyword[];
    description: string;
    visualAssetId?: string;
    multiHexStructure?: MultiHexStructureRule[]
}

export interface PlacedBuilding extends Building, HexResolvedStats, AxialCoordinate {}

export type BuildingAtlas = { [k in DevelopmentVectorValue]: {[key: string]: Building} }

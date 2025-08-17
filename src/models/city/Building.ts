import type {BuildingTypesValue, DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type { UpkeepAmount, UpkeepDescription } from "../Upkeep.ts";

export interface TextEffect {
    text: string;
}

/** Building data model (extend later with structured effects if needed) */
export interface Building {
    id: string;
    name: string;
    type: BuildingTypesValue;
    level:number,
    size:number,
    vector: DevelopmentVectorValue;
    requiredUpkeep: UpkeepAmount
    requiredUpkeepDescription: UpkeepDescription;
    providedUpkeep: UpkeepAmount;
    providedUpkeepDescription: UpkeepDescription;
    adjacency:unknown;
    adjacencyDescription: unknown;    // adjacency rules will be added later
    description: string;
}
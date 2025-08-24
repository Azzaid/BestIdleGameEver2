import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export interface MultiHexStructureRule {
    requiredBuildingIds: string[];
    resultingBuildingId: string;
    replacementMap: {[key: string]: string};
    developerVector: DevelopmentVectorValue;
}
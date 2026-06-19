export interface UpkeepState {
    controlledTerritory: number,
}

export type CityStage = "stable" | "besieged";

export interface CitySignatureStatus {
    effectiveSignature: number;
    cityFootprint: number;
    controlledTerritory: number;
    fillRatio: number;
    footprintFillRatio: number;
    activeFillRatio: number;
    displayedSignature: number;
    stage: CityStage;
    isBesieged: boolean;
}

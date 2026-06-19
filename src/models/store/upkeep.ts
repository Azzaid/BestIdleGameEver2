export interface UpkeepState {
    controlledTerritory: number,
    lastSiegeSignature: number,
}

export type CityStage = "stable" | "besieged";

export interface CitySignatureStatus {
    effectiveSignature: number;
    cityFootprint: number;
    controlledTerritory: number;
    lastSiegeSignature: number;
    fillRatio: number;
    displayedSignature: number;
    stage: CityStage;
    isBesieged: boolean;
}

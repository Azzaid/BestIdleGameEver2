export interface UpkeepState {
    resilience: number,
}

export type CityStage = "stable" | "besieged";

export interface CityTraceStatus {
    effectiveTrace: number;
    resilience: number;
    fillRatio: number;
    displayedTrace: number;
    stage: CityStage;
    isBesieged: boolean;
}

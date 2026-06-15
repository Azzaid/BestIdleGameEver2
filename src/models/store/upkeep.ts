export interface UpkeepState {
    resilience: number,
}

export type CityStage = "stable" | "besieged";

export interface CityTraceStatus {
    effectiveTrace: number;
    scarTrace: number;
    resilience: number;
    fillRatio: number;
    scarFillRatio: number;
    activeFillRatio: number;
    displayedTrace: number;
    stage: CityStage;
    isBesieged: boolean;
}

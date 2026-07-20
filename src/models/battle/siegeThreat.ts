export function getNextSiegeWaveThreat({
    currentThreat,
    initialThreat,
    targetThreat,
    threatStepPercent,
}: {
    currentThreat: number;
    initialThreat: number;
    targetThreat: number;
    threatStepPercent: number;
}) {
    if (targetThreat <= initialThreat) return targetThreat;

    const stepSize = getSiegeThreatStepSize({initialThreat, targetThreat, threatStepPercent});
    return Math.min(targetThreat, currentThreat + stepSize);
}

export function getSiegeTotalStrengthBudget({
    initialThreat,
    targetThreat,
    threatStepPercent,
    waveThreatToCityThreatRatio,
}: {
    initialThreat: number;
    targetThreat: number;
    threatStepPercent: number;
    waveThreatToCityThreatRatio: number;
}) {
    if (targetThreat <= 0 || waveThreatToCityThreatRatio <= 0) return 0;
    if (targetThreat <= initialThreat) {
        return Math.max(1, targetThreat * waveThreatToCityThreatRatio);
    }

    let totalStrength = 0;
    let currentThreat = initialThreat;
    let guard = 0;

    while (currentThreat < targetThreat && guard < 10000) {
        currentThreat = getNextSiegeWaveThreat({
            currentThreat,
            initialThreat,
            targetThreat,
            threatStepPercent,
        });
        totalStrength += Math.max(1, currentThreat * waveThreatToCityThreatRatio);
        guard += 1;
    }

    return totalStrength;
}

function getSiegeThreatStepSize({
    initialThreat,
    targetThreat,
    threatStepPercent,
}: {
    initialThreat: number;
    targetThreat: number;
    threatStepPercent: number;
}) {
    const percent = Math.max(0.0001, threatStepPercent);
    return (targetThreat - initialThreat) * percent / 100;
}

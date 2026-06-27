import {BattleStage} from "./ui/BattleStage.tsx";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { useTypedDispatch, useTypedSelector } from "../../store/hooks.ts";
import { selectHasAnyTowerBuild } from "../../store/towers/selectors.ts";
import * as styles from './BattlePage.css.ts';
import { selectCityBattlefield, selectCityHexes, selectCitySideHexes } from "../../store/city/selectors.ts";
import { BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX } from "../../data/constants.ts";
import { Link } from "react-router-dom";
import { recordControlledTerritoryReached, recordLastSiegeSignature } from "../../store/upkeep/slice.ts";
import {
    selectCitySignatureStatus,
    selectEffectiveWallResolution,
    selectResolvedEffectiveAvailableTowers,
    selectTowerAwareCityResolution,
} from "../../store/upkeep/selectors.ts";
import { recordSurvivedSiege, retreatCityRadius } from "../../store/city/slice.ts";
import { selectIsDebugModeEnabled } from "../../store/debug/selectors.ts";
import {enqueueGlobalSignal} from "../../store/globalEvents/slice.ts";
import type { BattleMetrics, BattleResult } from "../../models/battle/world.ts";
import type { BattleWallSegment } from "../../models/battle/wallSegment.ts";
import {
    BATTLEFIELD_RANGE_MULTIPLIER,
    BATTLE_WALL_APRON_HEIGHT,
    BATTLE_WAVE_THREAT_TO_CITY_THREAT_RATIO,
    BASE_SIMULTANEOUS_MONSTERS_LIMIT,
    PRESSURE_WAVE_INTERVAL_SECONDS,
    SIEGE_DURATION_SECONDS,
    SIEGE_THREAT_START_RATIO,
    SIEGE_WAVE_INTERVAL_SECONDS,
} from "../../data/constants.ts";
import {
    selectControlledTerritoryGrowthStep,
    selectMonsterModifierValues,
    selectSiegeModifierValues,
} from "../../store/homogeneousValues/selectors.ts";
import type { TowerAssemblyResolved } from "../../models/battle/towerParts.ts";

type BattleMode = "siege" | "pressure";

function toPercent(value: number, max: number) {
    if (max <= 0) return 0;
    return Math.floor(Math.max(0, Math.min(100, (value / max) * 100)));
}

function getResolvedTowerBattleKey(tower: TowerAssemblyResolved) {
    const selectedPartKey = Object.entries(tower.selectedParts)
        .map(([slot, part]) => `${slot}:${part?.id ?? ""}`)
        .sort()
        .join(",");
    const statsKey = Object.entries(tower.stats)
        .map(([stat, value]) => `${stat}:${value instanceof Set ? [...value].sort().join(",") : value}`)
        .sort()
        .join(",");

    return [
        selectedPartKey,
        statsKey,
        [...tower.keywords].sort().join(","),
        tower.aimKeywords.join(","),
        tower.selectedParts.ammo?.projectileSprite?.textureKey ?? "",
    ].join("|");
}

function getResolvedTowersBattleKey(towers: TowerAssemblyResolved[]) {
    return towers.map(getResolvedTowerBattleKey).join("::");
}

function useStableResolvedBattleTowers(towers: TowerAssemblyResolved[]) {
    const stableRef = useRef({
        key: getResolvedTowersBattleKey(towers),
        towers,
    });
    const nextKey = getResolvedTowersBattleKey(towers);

    if (stableRef.current.key !== nextKey) {
        stableRef.current = {
            key: nextKey,
            towers,
        };
    }

    return stableRef.current.towers;
}

const BattlePage = () => {
    const dispatch = useTypedDispatch();
    const resolvedAvailableTowers = useTypedSelector(selectResolvedEffectiveAvailableTowers);
    const resolvedBattleTowersUnstable = useMemo(
        () => resolvedAvailableTowers
            .map(({resolved}) => resolved)
            .filter((resolved) => resolved.warnings.length === 0),
        [resolvedAvailableTowers]
    );
    const resolvedBattleTowers = useStableResolvedBattleTowers(resolvedBattleTowersUnstable);
    const hasAnyTowerBuild = useTypedSelector(selectHasAnyTowerBuild);
    const citySideHexes = useTypedSelector(selectCitySideHexes);
    const cityHexes = useTypedSelector(selectCityHexes);
    const cityBattlefield = useTypedSelector(selectCityBattlefield);
    const cityResolution = useTypedSelector(selectTowerAwareCityResolution);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
    const wallResolution = useTypedSelector(selectEffectiveWallResolution);
    const controlledTerritoryGrowthStep = useTypedSelector(selectControlledTerritoryGrowthStep);
    const monsterModifierValues = useTypedSelector(selectMonsterModifierValues);
    const siegeModifierValues = useTypedSelector(selectSiegeModifierValues);
    const wallZoneEffects = useMemo(() => ({
        pushBackDistance: wallResolution.pushBackDistance,
        pushBacksPerSecond: wallResolution.pushBacksPerSecond,
        pushBackEffectZoneSize: wallResolution.pushBackEffectZoneSize,
        zoneDotDamage: wallResolution.zoneDotDamage,
        zoneDotTicksPerSecond: wallResolution.zoneDotTicksPerSecond,
        zoneDotZoneSize: wallResolution.zoneDotZoneSize,
    }), [
        wallResolution.pushBackDistance,
        wallResolution.pushBacksPerSecond,
        wallResolution.pushBackEffectZoneSize,
        wallResolution.zoneDotDamage,
        wallResolution.zoneDotTicksPerSecond,
        wallResolution.zoneDotZoneSize,
    ]);
    const monsterMovementModifiers = useMemo(() => ({
        speedFlat: monsterModifierValues.speedFlat,
        speedMultiplier: monsterModifierValues.speedMultiplier,
        swayFlat: monsterModifierValues.swayFlat,
        swayMultiplier: monsterModifierValues.swayMultiplier,
    }), [
        monsterModifierValues.speedFlat,
        monsterModifierValues.speedMultiplier,
        monsterModifierValues.swayFlat,
        monsterModifierValues.swayMultiplier,
    ]);
    const battleWallSegments = useMemo<BattleWallSegment[]>(() => {
        return cityHexes
            .filter(hex => hex.kind === "wall")
            .sort((left, right) => left.column - right.column)
            .map(hex => ({
                cellKey: hex.cellKey,
                wallKey: hex.wallKey ?? null,
                wallDevelopmentVector: hex.wallDevelopmentVector ?? null,
                wallTopKey: hex.wallTopKey ?? null,
                wallTopDevelopmentVector: hex.wallTopDevelopmentVector ?? null,
            }));
    }, [cityHexes]);
    const [battleMode, setBattleMode] = useState<BattleMode>(() => signatureStatus.isBesieged ? "siege" : "pressure");
    const isSiege = battleMode === "siege" && signatureStatus.isBesieged;
    const cityThreat = Math.max(0, cityResolution.effectiveSignature);
    const targetThreat = isSiege
        ? cityThreat * controlledTerritoryGrowthStep
        : cityThreat;
    const initialThreat = isSiege ? cityThreat * SIEGE_THREAT_START_RATIO : targetThreat;
    const siegeDurationSeconds = Math.max(1, (
        SIEGE_DURATION_SECONDS + siegeModifierValues.lengthFlat
    ) * siegeModifierValues.lengthMultiplier);
    const threatGrowthPerSecond = isSiege && targetThreat > initialThreat
        ? (targetThreat - initialThreat) / siegeDurationSeconds
        : 0;
    const timeBetweenWavesSeconds = isSiege
        ? SIEGE_WAVE_INTERVAL_SECONDS
        : PRESSURE_WAVE_INTERVAL_SECONDS;
    const simultaneousMonstersLimit = Math.max(0, Math.floor(
        (BASE_SIMULTANEOUS_MONSTERS_LIMIT + siegeModifierValues.simultaneousMonstersLimitFlat)
        * siegeModifierValues.simultaneousMonstersLimitMultiplier
    ));
    const [metrics, setMetrics] = useState<BattleMetrics>(() => ({
        threat: initialThreat,
        targetThreat,
        siegeElapsedSeconds: 0,
        siegePressure: 0,
        wallResilience: wallResolution.resilience,
    }));
    const lastRenderedMetricsSecondRef = useRef(-1);
    const hasAnnouncedSiegeStartedRef = useRef(false);
    const [battleMessage, setBattleMessage] = useState<string | null>(null);
    const siegeProgressPercent = isSiege
        ? toPercent(metrics.siegeElapsedSeconds, siegeDurationSeconds)
        : 0;
    const pressureProgressPercent = toPercent(metrics.siegePressure, metrics.wallResilience);
    const wallLogicalWidth = citySideHexes * BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX;
    const longestTowerRange = Math.max(360, ...resolvedBattleTowers.map((tower) => tower.stats.targetingDistanceLimit));
    const battlefieldLength = longestTowerRange * BATTLEFIELD_RANGE_MULTIPLIER;
    const battlefieldHeight = battlefieldLength + BATTLE_WALL_APRON_HEIGHT;
    const battleKey = useMemo(() => [
        wallLogicalWidth,
        battlefieldHeight,
        battleWallSegments
            .map(segment => [
                segment.cellKey,
                segment.wallKey ?? "",
                segment.wallDevelopmentVector ?? "",
                segment.wallTopKey ?? "",
                segment.wallTopDevelopmentVector ?? "",
            ].join(":"))
            .join("|"),
    ].join(":"), [
        wallLogicalWidth,
        battlefieldHeight,
        battleWallSegments,
    ]);
    useEffect(() => {
        lastRenderedMetricsSecondRef.current = -1;
        setMetrics({
            threat: initialThreat,
            targetThreat,
            siegeElapsedSeconds: 0,
            siegePressure: 0,
            wallResilience: wallResolution.resilience,
        });
    }, [battleKey, initialThreat, targetThreat, wallResolution.resilience]);
    useEffect(() => {
        if (!isSiege) {
            hasAnnouncedSiegeStartedRef.current = false;
            return;
        }

        if (hasAnnouncedSiegeStartedRef.current) return;

        hasAnnouncedSiegeStartedRef.current = true;
        dispatch(enqueueGlobalSignal({type: "siegeStarted"}));
    }, [dispatch, isSiege]);
    const handleBattleEnded = useCallback((result: BattleResult) => {
        setMetrics(result);
        dispatch(recordControlledTerritoryReached(result.threat));

        if (result.outcome === "held") {
            dispatch(recordLastSiegeSignature(cityThreat));
            dispatch(recordSurvivedSiege());
            dispatch(enqueueGlobalSignal({type: "siegeSucceeded"}));
            dispatch(enqueueGlobalSignal({type: "siegeEnded"}));
            setBattleMessage("Siege is over. The wall shifts back into pressure watch.");
            setBattleMode("pressure");
            return;
        }

        if (result.threat < result.targetThreat) {
            if (isSiege) {
                dispatch(enqueueGlobalSignal({type: "siegeFailed"}));
                dispatch(enqueueGlobalSignal({type: "siegeEnded"}));
            }

            if (isDebugModeEnabled) {
                setBattleMessage("The wall was overwhelmed. Debug mode ignored the city retreat.");
                setBattleMode("pressure");
                return;
            }

            dispatch(retreatCityRadius());
            setBattleMessage("The wall was overwhelmed. The city retreated and pressure watch resumed.");
            setBattleMode("pressure");
            return;
        }

        setBattleMessage("Pressure exceeded wall resilience. Improve the wall or tower build.");
        setBattleMode("pressure");
    }, [cityThreat, dispatch, isDebugModeEnabled, isSiege]);
    const handleBattleMetrics = useCallback((nextMetrics: BattleMetrics) => {
        const nextSecond = Math.floor(nextMetrics.siegeElapsedSeconds);
        if (nextSecond === lastRenderedMetricsSecondRef.current) return;

        lastRenderedMetricsSecondRef.current = nextSecond;
        setMetrics(nextMetrics);
    }, []);

    return (
        <div className={styles.battlePage}>
            {hasAnyTowerBuild ? (
                <div className={`${styles.battleShell} ${isSiege ? styles.battleShellSiege : ''}`}>
                    {isSiege && (
                        <div className={`${styles.battleProgress} ${styles.siegeProgress}`} aria-label="Siege duration">
                            <span className={styles.progressLabel}>Siege</span>
                            <div className={styles.progressTrack}>
                                <div
                                    className={styles.siegeProgressFill}
                                    style={{width: `${siegeProgressPercent}%`}}
                                />
                            </div>
                        </div>
                    )}
                    {isDebugModeEnabled && (
                        <div className={styles.battleHud} aria-live="polite">
                            <div className={styles.battleMetric}>
                                <span className={styles.battleMetricLabel}>Mode</span>
                                <span className={styles.battleMetricValue}>
                                    {isSiege ? "Siege" : "Pressure"}
                                </span>
                            </div>
                            <div className={styles.battleMetric}>
                                <span className={styles.battleMetricLabel}>Threat</span>
                                <span className={styles.battleMetricValue}>
                                    {Math.round(metrics.threat)}/{Math.round(metrics.targetThreat)}
                                </span>
                            </div>
                            <div className={styles.battleMetric}>
                                <span className={styles.battleMetricLabel}>Siege pressure</span>
                                <span className={styles.battleMetricValue}>
                                    {Math.round(metrics.siegePressure)}/{Math.round(metrics.wallResilience)}
                                </span>
                            </div>
                        </div>
                    )}
                    {battleMessage && (
                        <div className={styles.battleNotice} role="status">
                            {battleMessage}
                        </div>
                    )}
                    <BattleStage
                        key={battleKey}
                        wallLogicalWidth={wallLogicalWidth}
                        wallSegments={battleWallSegments}
                        battlefieldWidth={wallLogicalWidth}
                        battlefieldHeight={battlefieldHeight}
                        wallY={battlefieldLength}
                        backgroundId={cityBattlefield.backgroundId}
                        resolvedTowers={resolvedBattleTowers}
                        initialThreat={initialThreat}
                        targetThreat={targetThreat}
                        threatGrowthPerSecond={threatGrowthPerSecond}
                        waveThreatToCityThreatRatio={BATTLE_WAVE_THREAT_TO_CITY_THREAT_RATIO}
                        simultaneousMonstersLimit={simultaneousMonstersLimit}
                        timeBetweenWavesSeconds={timeBetweenWavesSeconds}
                        fastForwardWavesWhenCleared={isSiege}
                        completesWhenThreatTargetReached={isSiege}
                        wallResilience={wallResolution.resilience}
                        wallIgnoredThreat={wallResolution.ignoredThreat}
                        monsterMovementModifiers={monsterMovementModifiers}
                        wallZoneEffects={wallZoneEffects}
                        showDebugOutlines={isDebugModeEnabled}
                        showSiegeOutline={isSiege}
                        onBattleMetrics={handleBattleMetrics}
                        onBattleEnded={handleBattleEnded}
                    />
                    <div className={`${styles.battleProgress} ${styles.pressureProgress}`} aria-label="Siege pressure">
                        <span className={styles.progressLabel}>Siege pressure</span>
                        <div className={styles.progressTrack}>
                            <div
                                className={styles.pressureProgressFill}
                                style={{width: `${pressureProgressPercent}%`}}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <section className={styles.battleLocked}>
                    <h1 className={styles.battleLockedTitle}>Battle Locked</h1>
                    <p className={styles.battleLockedText}>
                        Assemble the first tower and rebuild it before sending defenders to the wall.
                    </p>
                    <Link className={styles.battleLockedLink} to="/build">Build First Tower</Link>
                </section>
            )}
        </div>
    );
};

export default BattlePage;

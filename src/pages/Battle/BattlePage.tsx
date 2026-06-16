import {BattleStage} from "./ui/BattleStage.tsx";
import {useCallback, useMemo, useState} from "react";
import { useTypedDispatch, useTypedSelector } from "../../store/hooks.ts";
import { selectHasAnyTowerBuild, selectResolvedAvailableTowers } from "../../store/towers/selectors.ts";
import * as styles from './BattlePage.css.ts';
import { selectCityBattlefield, selectCityHexes, selectCitySideHexes } from "../../store/city/selectors.ts";
import { BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX } from "../../data/constants.ts";
import { Link } from "react-router-dom";
import { recordThreatReached } from "../../store/upkeep/slice.ts";
import { selectCityTraceStatus, selectTowerAwareCityResolution } from "../../store/upkeep/selectors.ts";
import { selectWallResolution } from "../../store/wall/selectors.ts";
import { recordSurvivedSiege, retreatCityRadius } from "../../store/city/slice.ts";
import type { BattleMetrics, BattleResult } from "../../models/battle/world.ts";
import type { BattleWallSegment } from "../../models/battle/wallSegment.ts";
import {
    BATTLEFIELD_RANGE_MULTIPLIER,
    BATTLE_WALL_APRON_HEIGHT,
    BATTLE_WAVE_THREAT_TO_CITY_THREAT_RATIO,
    PRESSURE_WAVE_INTERVAL_SECONDS,
    SIEGE_DURATION_SECONDS,
    SIEGE_THREAT_START_RATIO,
    SIEGE_VICTORY_CITY_THREAT_RATIO,
    SIEGE_WAVE_INTERVAL_SECONDS,
} from "../../data/constants.ts";

type BattleMode = "siege" | "pressure";

const BattlePage = () => {
    const dispatch = useTypedDispatch();
    const resolvedAvailableTowers = useTypedSelector(selectResolvedAvailableTowers);
    const resolvedBattleTowers = useMemo(
        () => resolvedAvailableTowers
            .map(({resolved}) => resolved)
            .filter((resolved) => resolved.warnings.length === 0),
        [resolvedAvailableTowers]
    );
    const hasAnyTowerBuild = useTypedSelector(selectHasAnyTowerBuild);
    const citySideHexes = useTypedSelector(selectCitySideHexes);
    const cityHexes = useTypedSelector(selectCityHexes);
    const cityBattlefield = useTypedSelector(selectCityBattlefield);
    const cityResolution = useTypedSelector(selectTowerAwareCityResolution);
    const traceStatus = useTypedSelector(selectCityTraceStatus);
    const wallResolution = useTypedSelector(selectWallResolution);
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
    const [battleMode, setBattleMode] = useState<BattleMode>(() => traceStatus.isBesieged ? "siege" : "pressure");
    const isSiege = battleMode === "siege" && traceStatus.isBesieged;
    const cityThreat = Math.max(0, cityResolution.effectiveTrace);
    const targetThreat = isSiege
        ? cityThreat * SIEGE_VICTORY_CITY_THREAT_RATIO
        : cityThreat;
    const initialThreat = isSiege ? cityThreat * SIEGE_THREAT_START_RATIO : targetThreat;
    const threatGrowthPerSecond = isSiege && targetThreat > initialThreat
        ? (targetThreat - initialThreat) / SIEGE_DURATION_SECONDS
        : 0;
    const timeBetweenWavesSeconds = isSiege
        ? SIEGE_WAVE_INTERVAL_SECONDS
        : PRESSURE_WAVE_INTERVAL_SECONDS;
    const [metrics, setMetrics] = useState<BattleMetrics>(() => ({
        threat: initialThreat,
        targetThreat,
        siegePressure: 0,
        wallResilience: wallResolution.resilience,
    }));
    const [battleMessage, setBattleMessage] = useState<string | null>(null);
    const wallLogicalWidth = citySideHexes * BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX;
    const longestTowerRange = Math.max(360, ...resolvedBattleTowers.map((tower) => tower.stats.targetingDistanceLimit));
    const battlefieldLength = longestTowerRange * BATTLEFIELD_RANGE_MULTIPLIER;
    const battlefieldHeight = battlefieldLength + BATTLE_WALL_APRON_HEIGHT;
    const battleKey = useMemo(() => [
        targetThreat,
        initialThreat,
        threatGrowthPerSecond,
        timeBetweenWavesSeconds,
        isSiege,
        wallResolution.resilience,
        wallResolution.ignoredThreat,
        wallLogicalWidth,
        battlefieldHeight,
        battleWallSegments
            .map(segment => [
                segment.cellKey,
                segment.wallKey ?? "",
                segment.wallDevelopmentVector?.description ?? "",
                segment.wallTopKey ?? "",
                segment.wallTopDevelopmentVector?.description ?? "",
            ].join(":"))
            .join("|"),
    ].join(":"), [
        targetThreat,
        initialThreat,
        threatGrowthPerSecond,
        timeBetweenWavesSeconds,
        isSiege,
        wallResolution.resilience,
        wallResolution.ignoredThreat,
        wallLogicalWidth,
        battlefieldHeight,
        battleWallSegments,
    ]);
    const handleBattleEnded = useCallback((result: BattleResult) => {
        dispatch(recordThreatReached(result.threat));

        if (result.outcome === "held") {
            dispatch(recordSurvivedSiege());
            setBattleMessage("Siege is over. The wall shifts back into pressure watch.");
            setBattleMode("pressure");
            return;
        }

        if (result.threat < result.targetThreat) {
            dispatch(retreatCityRadius());
            setBattleMessage("The wall was overwhelmed. The city retreated and pressure watch resumed.");
            setBattleMode("pressure");
            return;
        }

        setBattleMessage("Pressure exceeded wall resilience. Improve the wall or tower build.");
        setBattleMode("pressure");
    }, [dispatch]);

    return (
        <div className={styles.battlePage}>
            {hasAnyTowerBuild ? (
                <div className={`${styles.battleShell} ${isSiege ? styles.battleShellSiege : ''}`}>
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
                        timeBetweenWavesSeconds={timeBetweenWavesSeconds}
                        fastForwardWavesWhenCleared={isSiege}
                        completesWhenThreatTargetReached={isSiege}
                        wallResilience={wallResolution.resilience}
                        wallIgnoredThreat={wallResolution.ignoredThreat}
                        onBattleMetrics={setMetrics}
                        onBattleEnded={handleBattleEnded}
                    />
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

import {BattleStage} from "./ui/BattleStage.tsx";
import {useCallback, useMemo, useState} from "react";
import { useTypedDispatch, useTypedSelector } from "../../store/hooks.ts";
import { selectHasActiveTowerBuild, selectResolvedActiveTower } from "../../store/towers/selectors.ts";
import * as styles from './BattlePage.css.ts';
import { selectCityBattlefield, selectCitySideHexes } from "../../store/city/selectors.ts";
import { BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX } from "../../data/constants.ts";
import { Link } from "react-router-dom";
import { recordThreatReached } from "../../store/upkeep/slice.ts";
import { selectCityTraceStatus, selectTowerAwareCityResolution } from "../../store/upkeep/selectors.ts";
import { selectWallResolution } from "../../store/wall/selectors.ts";
import { retreatCityRadius } from "../../store/city/slice.ts";
import type { BattleMetrics, BattleResult } from "../../models/battle/world.ts";
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
    const resolvedTower = useTypedSelector(selectResolvedActiveTower);
    const hasActiveTowerBuild = useTypedSelector(selectHasActiveTowerBuild);
    const citySideHexes = useTypedSelector(selectCitySideHexes);
    const cityBattlefield = useTypedSelector(selectCityBattlefield);
    const cityResolution = useTypedSelector(selectTowerAwareCityResolution);
    const traceStatus = useTypedSelector(selectCityTraceStatus);
    const wallResolution = useTypedSelector(selectWallResolution);
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
    const battlefieldLength = resolvedTower.stats.targetingDistanceLimit * BATTLEFIELD_RANGE_MULTIPLIER;
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
    ]);
    const handleBattleEnded = useCallback((result: BattleResult) => {
        dispatch(recordThreatReached(result.threat));

        if (result.outcome === "held") {
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
            {hasActiveTowerBuild ? (
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
                        battlefieldWidth={wallLogicalWidth}
                        battlefieldHeight={battlefieldHeight}
                        wallY={battlefieldLength}
                        backgroundId={cityBattlefield.backgroundId}
                        resolvedTower={resolvedTower}
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

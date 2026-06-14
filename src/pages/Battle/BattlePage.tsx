import {BattleStage} from "./ui/BattleStage.tsx";
import {useCallback, useMemo, useState} from "react";
import { useTypedDispatch, useTypedSelector } from "../../store/hooks.ts";
import { selectHasActiveTowerBuild, selectResolvedActiveTower } from "../../store/towers/selectors.ts";
import * as styles from './BattlePage.css.ts';
import { selectCitySideHexes } from "../../store/city/selectors.ts";
import { BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX } from "../../data/constants.ts";
import { Link } from "react-router-dom";
import { recordThreatReached } from "../../store/upkeep/slice.ts";
import { selectCityTraceStatus, selectTowerAwareCityResolution } from "../../store/upkeep/selectors.ts";
import { selectWallResolution } from "../../store/wall/selectors.ts";
import { retreatCityRadius } from "../../store/city/slice.ts";
import type { BattleMetrics, BattleResult } from "../../models/battle/world.ts";

const BATTLEFIELD_RANGE_MULTIPLIER = 1.2;
const WALL_APRON_HEIGHT = 80;
const THREAT_START_RATIO = 0.8;
const SIEGE_DURATION_SECONDS = 60;

const BattlePage = () => {
    const dispatch = useTypedDispatch();
    const resolvedTower = useTypedSelector(selectResolvedActiveTower);
    const hasActiveTowerBuild = useTypedSelector(selectHasActiveTowerBuild);
    const citySideHexes = useTypedSelector(selectCitySideHexes);
    const cityResolution = useTypedSelector(selectTowerAwareCityResolution);
    const traceStatus = useTypedSelector(selectCityTraceStatus);
    const wallResolution = useTypedSelector(selectWallResolution);
    const isSiege = traceStatus.isBesieged;
    const targetThreat = Math.max(0, cityResolution.effectiveTrace);
    const initialThreat = isSiege ? targetThreat * THREAT_START_RATIO : targetThreat;
    const threatGrowthPerSecond = isSiege && targetThreat > initialThreat
        ? (targetThreat - initialThreat) / SIEGE_DURATION_SECONDS
        : 0;
    const [metrics, setMetrics] = useState<BattleMetrics>(() => ({
        threat: initialThreat,
        targetThreat,
        siegePressure: 0,
        wallResilience: wallResolution.resilience,
    }));
    const [battleMessage, setBattleMessage] = useState<string | null>(null);
    const wallLogicalWidth = citySideHexes * BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX;
    const battlefieldLength = resolvedTower.stats.targetingDistanceLimit * BATTLEFIELD_RANGE_MULTIPLIER;
    const battlefieldHeight = battlefieldLength + WALL_APRON_HEIGHT;
    const battleKey = useMemo(() => [
        targetThreat,
        initialThreat,
        threatGrowthPerSecond,
        isSiege,
        wallResolution.resilience,
        wallResolution.ignoredThreat,
        wallLogicalWidth,
        battlefieldHeight,
    ].join(":"), [
        targetThreat,
        initialThreat,
        threatGrowthPerSecond,
        isSiege,
        wallResolution.resilience,
        wallResolution.ignoredThreat,
        wallLogicalWidth,
        battlefieldHeight,
    ]);
    const handleBattleEnded = useCallback((result: BattleResult) => {
        dispatch(recordThreatReached(result.threat));

        if (result.outcome === "held") {
            setBattleMessage("Siege is over. City grows stronger and can withstand more.");
            return;
        }

        if (result.threat < result.targetThreat) {
            dispatch(retreatCityRadius());
            setBattleMessage("City wall where owerwhelmed and we had to retreat and loose part of a captured territory.");
            return;
        }

        setBattleMessage("Siege is over. City grows stronger and can withstand more.");
    }, [dispatch]);

    return (
        <div className={styles.battlePage}>
            {hasActiveTowerBuild ? (
                <div className={styles.battleShell}>
                    <div className={styles.battleHud} aria-live="polite">
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
                    {!battleMessage && (
                        <BattleStage
                            key={battleKey}
                            wallLogicalWidth={wallLogicalWidth}
                            battlefieldWidth={wallLogicalWidth}
                            battlefieldHeight={battlefieldHeight}
                            wallY={battlefieldLength}
                            resolvedTower={resolvedTower}
                            initialThreat={initialThreat}
                            targetThreat={targetThreat}
                            threatGrowthPerSecond={threatGrowthPerSecond}
                            completesWhenThreatTargetReached={isSiege}
                            wallResilience={wallResolution.resilience}
                            wallIgnoredThreat={wallResolution.ignoredThreat}
                            onBattleMetrics={setMetrics}
                            onBattleEnded={handleBattleEnded}
                        />
                    )}
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

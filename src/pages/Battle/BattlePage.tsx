import {BattleStage} from "./ui/BattleStage.tsx";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { useTypedDispatch, useTypedSelector } from "../../store/hooks.ts";
import * as styles from './BattlePage.css.ts';
import { selectAllCityHexes, selectCityBiome, selectCityHexes } from "../../store/city/selectors.ts";
import { CITY_HEX_WIDTH, toPixels } from "../../data/constants.ts";
import { Link } from "react-router-dom";
import { recordControlledTerritoryReached, recordLastSiegeSignature } from "../../store/upkeep/slice.ts";
import {
    selectCitySignatureStatus,
    selectControlledTerritory,
    selectEffectiveWallResolution,
    selectResolvedEffectiveAvailableTowers,
    selectTowerAwareCityResolution,
} from "../../store/upkeep/selectors.ts";
import { loseUnprotectedCityTerritory, recordSurvivedSiege } from "../../store/city/slice.ts";
import { selectIsDebugModeEnabled } from "../../store/debug/selectors.ts";
import {addNotificationHistoryEntry, enqueueGlobalSignal} from "../../store/globalEvents/slice.ts";
import {sendNotification} from "../../lib/notifications/eventBus.ts";
import type { BattleMetrics, BattleResult } from "../../models/battle/world.ts";
import type { BattleWallSegment } from "../../models/battle/wallSegment.ts";
import type { StandaloneTowerDefense } from "../../models/battle/tower.ts";
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
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import {getAxialDistance} from "../../models/city/expansion.ts";
import {
    selectControlledTerritoryGrowthStep,
    selectMonsterModifierValues,
    selectSiegeModifierValues,
} from "../../store/homogeneousValues/selectors.ts";
import type { TowerAssemblyResolved, TowerStatsResolved } from "../../models/battle/towerParts.ts";
import {createTowerDamageProfiles, resolveTowerAssemblyStatsAndSupport} from "../../models/battle/resolveTowerAssembly.ts";
import {towerStatsToPixels} from "../../models/battle/towerStatsPixels.ts";
import type { HomogeneousResolvedEntity } from "../../models/homogeneousValueResolution.ts";
import {
    resolveEntityContributionsWithDerivedValues,
    resolveEntityValuesWithDerivedValues,
} from "../../models/homogeneousValueResolution.ts";
import type {CityResolution} from "../../models/city/Adjancency.ts";
import type {TowerDamageProfiles} from "../../models/battle/damage.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS, isWallTopTower} from "../../data/wallSuperstructures/index.ts";
import {createBattlefieldTerrainHexes} from "./battlefieldTerrain.ts";
import type { HexCell } from "../../models/city/HexGrid.ts";
import type { SiegeOverwhelmedDecision } from "../../models/battle/world.ts";

type BattleMode = "siege" | "pressure";

const SIEGE_REPELLED_MESSAGE = "Siege repelled. City now controls more territory.";
const SIEGE_TERRITORY_LOST_MESSAGE = "Siege overwhelmed city defense and we had to fall back to protected hexes behind the wall";
const SIEGE_NOT_LIFTED_MESSAGE = "City where not able to lift the siege. There are still monster waiting behind the wall.";
const BATTLEFIELD_UNTARGETABLE_ENTRY_HEXES = 3;

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
        getTowerDamageProfilesBattleKey(tower.damageProfiles),
        [...tower.keywords].sort().join(","),
        tower.aimKeywords.join(","),
        tower.selectedParts.ammo?.projectileSprite?.textureKey ?? "",
    ].join("|");
}

function getResolvedTowersBattleKey(towers: TowerAssemblyResolved[]) {
    return towers.map(getResolvedTowerBattleKey).join("::");
}

function getStandaloneTowerDefenseBattleKey(defense: StandaloneTowerDefense) {
    const statsKey = Object.entries(defense.stats)
        .map(([stat, value]) => `${stat}:${value instanceof Set ? [...value].sort().join(",") : value}`)
        .sort()
        .join(",");

    return [
        defense.id,
        defense.wallCellKey ?? "",
        defense.wallColumn ?? "",
        statsKey,
        getTowerDamageProfilesBattleKey(defense.damageProfiles),
        [...defense.keywords].sort().join(","),
        defense.aimKeywords.join(","),
    ].join("|");
}

function getTowerDamageProfilesBattleKey(damageProfiles: TowerDamageProfiles) {
    return Object.entries(damageProfiles)
        .map(([profileName, profile]) => `${profileName}:${profile.amount}:${[...profile.keywords].sort().join(",")}`)
        .sort()
        .join(";");
}

function createStandaloneTowerDefenses(
    wallEntities: readonly HomogeneousResolvedEntity[],
    cityValues: Record<string, number>,
): StandaloneTowerDefense[] {
    return wallEntities.flatMap((entity) => {
        const wallSuperstructureId = getWallSuperstructureContentId(entity.id);
        const wallSuperstructure = wallSuperstructureId
            ? WALL_SUPERSTRUCTURE_BUILDINGS[wallSuperstructureId]
            : undefined;
        if (
            entity.entityType !== "wallSuperstructure"
            || !wallSuperstructure
            || isWallTopTower(wallSuperstructure)
            || !hasStandaloneWallSuperstructureBattleContribution(entity)
        ) return [];

        const keywords = new Set(entity.effectiveKeywords);
        const contributions = resolveEntityContributionsWithDerivedValues(entity, cityValues);
        const {stats} = resolveTowerAssemblyStatsAndSupport(
            resolveEntityValuesWithDerivedValues(entity, cityValues),
            keywords,
        );
        const damageProfiles = createTowerDamageProfiles(stats, keywords, contributions);

        return [{
            id: entity.id,
            wallCellKey: entity.cellKey,
            wallColumn: entity.column,
            stats: towerStatsToPixels(stats),
            damageProfiles,
            keywords,
            aimKeywords: ["closestToWall"],
        }];
    });
}

function getDerivedSourceValues(cityResolution: CityResolution, controlledTerritory: number): Record<string, number> {
    return {
        ...cityResolution.homogeneousValues,
        [HOMOGENEOUS_VALUE_IDS.citySignature]: cityResolution.effectiveSignature,
        [HOMOGENEOUS_VALUE_IDS.cityFootprint]: cityResolution.cityFootprint,
        [HOMOGENEOUS_VALUE_IDS.cityControlledTerritory]: controlledTerritory,
    };
}

function getWallSuperstructureContentId(resolvedEntityId: string) {
    return resolvedEntityId.split(":").at(-1);
}

function hasStandaloneWallSuperstructureBattleContribution(entity: HomogeneousResolvedEntity) {
    return (
        entity.resolvedContributions.some((contribution) => isStandaloneWallSuperstructureBattleValue(contribution.valueId))
        || (entity.derivedValues ?? []).some((contribution) => isStandaloneWallSuperstructureBattleValue(contribution.valueId))
    );
}

function isStandaloneWallSuperstructureBattleValue(valueId: string) {
    return (
        valueId.startsWith("tower.zone")
        || valueId.startsWith("tower.singleTarget")
        || valueId === HOMOGENEOUS_VALUE_IDS.towerProjectileDamage
    );
}

function getEffectiveTowerTargetingRange(stats: TowerStatsResolved) {
    return Number.isFinite(stats.maximumRange)
        ? Math.min(stats.targetingDistanceLimit, stats.maximumRange)
        : stats.targetingDistanceLimit;
}

function getTowerBattlefieldRange(stats: TowerStatsResolved) {
    return Math.max(
        getEffectiveTowerTargetingRange(stats),
        stats.zonePushBackZoneSize,
        stats.zoneFleeZoneSize,
        stats.zoneCircleZoneSize,
        stats.zoneDotZoneSize,
        stats.zoneStunZoneSize,
        stats.singleTargetPushBackRange,
        stats.singleTargetFleeRange,
        stats.singleTargetCircleRange,
        stats.singleTargetDotRange,
        stats.singleTargetStunRange,
    );
}

function countHexesLostToFailedSiege(hexes: readonly HexCell[]) {
    const activeWallHexes = hexes.filter(hex => !hex.isUnclaimed && !hex.isLost && hex.kind === "wall");
    const wallLength = activeWallHexes.length;
    const wallCoordinateRadius = activeWallHexes.reduce((radius, hex) => (
        Math.max(radius, getAxialDistance(hex, {column: 0, row: 0}))
    ), 1);
    const protectedRadius = Math.max(1, wallLength - 1, wallCoordinateRadius);

    return hexes.filter(hex => (
        !hex.isUnclaimed
        && !hex.isLost
        && hex.kind !== "wall"
        && getAxialDistance(hex, {column: 0, row: 0}) > protectedRadius
    )).length;
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

function useStableValueByKey<T>(value: T, key: string): T {
    const stableRef = useRef({key, value});

    if (stableRef.current.key !== key) {
        stableRef.current = {key, value};
    }

    return stableRef.current.value;
}

const BattlePage = () => {
    const dispatch = useTypedDispatch();
    const resolvedAvailableTowers = useTypedSelector(selectResolvedEffectiveAvailableTowers);
    const resolvedBattleTowersUnstable = useMemo(
        () => resolvedAvailableTowers
            .map(({resolved}) => ({
                ...resolved,
                stats: towerStatsToPixels(resolved.stats),
            }))
            .filter((resolved) => resolved.warnings.length === 0),
        [resolvedAvailableTowers]
    );
    const resolvedBattleTowers = useStableResolvedBattleTowers(resolvedBattleTowersUnstable);
    const allCityHexes = useTypedSelector(selectAllCityHexes);
    const cityHexes = useTypedSelector(selectCityHexes);
    const cityBiome = useTypedSelector(selectCityBiome);
    const cityTerrainVectorMap = useTypedSelector(state => state.city.terrainVectorMap);
    const cityResolution = useTypedSelector(selectTowerAwareCityResolution);
    const controlledTerritory = useTypedSelector(selectControlledTerritory);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
    const wallResolution = useTypedSelector(selectEffectiveWallResolution);
    const derivedSourceValues = useMemo(
        () => getDerivedSourceValues(cityResolution, controlledTerritory),
        [cityResolution, controlledTerritory],
    );
    const standaloneTowerDefensesUnstable = useMemo(
        () => createStandaloneTowerDefenses(cityResolution.resolvedWallSegments, derivedSourceValues),
        [derivedSourceValues, cityResolution.resolvedWallSegments],
    );
    const standaloneTowerDefensesKey = standaloneTowerDefensesUnstable
        .map(getStandaloneTowerDefenseBattleKey)
        .join("::");
    const standaloneTowerDefenses = useStableValueByKey(standaloneTowerDefensesUnstable, standaloneTowerDefensesKey);
    const controlledTerritoryGrowthStep = useTypedSelector(selectControlledTerritoryGrowthStep);
    const monsterModifierValues = useTypedSelector(selectMonsterModifierValues);
    const siegeModifierValues = useTypedSelector(selectSiegeModifierValues);
    const wallZoneEffects = useMemo(() => ({
        pushBackDistance: wallResolution.pushBackDistance,
        pushBacksPerSecond: wallResolution.pushBacksPerSecond,
        pushBackEffectZoneSize: wallResolution.pushBackEffectZoneSize,
        zoneDotDamageProfile: {
            amount: wallResolution.zoneDotDamage,
            keywords: new Set(wallResolution.zoneDotKeywords),
        },
        zoneDotTicksPerSecond: wallResolution.zoneDotTicksPerSecond,
        zoneDotZoneSize: wallResolution.zoneDotZoneSize,
    }), [
        wallResolution.pushBackDistance,
        wallResolution.pushBacksPerSecond,
        wallResolution.pushBackEffectZoneSize,
        wallResolution.zoneDotDamage,
        wallResolution.zoneDotTicksPerSecond,
        wallResolution.zoneDotZoneSize,
        wallResolution.zoneDotKeywords,
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
    const battleWallSegmentsUnstable = useMemo<BattleWallSegment[]>(() => {
        return cityHexes
            .filter(hex => hex.kind === "wall")
            .sort((left, right) => left.column - right.column)
            .map(hex => ({
                cellKey: hex.cellKey,
                column: hex.column,
                row: hex.row,
                wallKey: hex.wallKey ?? null,
                wallDevelopmentVector: hex.wallDevelopmentVector ?? null,
                wallTopKey: hex.wallTopKey ?? null,
                wallTopDevelopmentVector: hex.wallTopDevelopmentVector ?? null,
            }));
    }, [cityHexes]);
    const battleWallSegmentsKey = battleWallSegmentsUnstable
        .map(segment => [
            segment.cellKey,
            segment.column,
            segment.row,
            segment.wallKey ?? "",
            segment.wallDevelopmentVector ?? "",
            segment.wallTopKey ?? "",
            segment.wallTopDevelopmentVector ?? "",
        ].join(":"))
        .join("|");
    const battleWallSegments = useStableValueByKey(battleWallSegmentsUnstable, battleWallSegmentsKey);
    const [battleMode, setBattleMode] = useState<BattleMode>(() => signatureStatus.isBesieged ? "siege" : "pressure");
    const [battleRunId, setBattleRunId] = useState(0);
    const [retreatEnemiesSignal, setRetreatEnemiesSignal] = useState(0);
    const [pendingTerritoryLossFailureId, setPendingTerritoryLossFailureId] = useState(0);
    const processedFailedSiegeRef = useRef<"territoryLost" | "noTerritoryLost" | null>(null);
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
    const siegeProgressPercent = isSiege
        ? toPercent(metrics.siegeElapsedSeconds, siegeDurationSeconds)
        : 0;
    const pressureProgressPercent = toPercent(metrics.siegePressure, metrics.wallResilience);
    const wallLogicalWidth = Math.max(1, battleWallSegments.length) * CITY_HEX_WIDTH;
    const standaloneDefenseRanges = standaloneTowerDefenses.map((defense) => getTowerBattlefieldRange(defense.stats));
    const longestTowerRange = Math.max(
        0,
        ...resolvedBattleTowers.map((tower) => getTowerBattlefieldRange(tower.stats)),
        ...standaloneDefenseRanges,
    );
    const battlefieldLength = longestTowerRange * BATTLEFIELD_RANGE_MULTIPLIER + toPixels(BATTLEFIELD_UNTARGETABLE_ENTRY_HEXES);
    const battlefieldHeight = battlefieldLength + BATTLE_WALL_APRON_HEIGHT;
    const battlefieldTerrainHexesUnstable = useMemo(() => createBattlefieldTerrainHexes({
        biome: cityBiome,
        terrainVectorMap: cityTerrainVectorMap,
        baseTerrainBackgroundsByKey: Object.fromEntries(
            allCityHexes.flatMap(hex => (
                hex.baseTerrainSpriteId
                    ? [[hex.cellKey, {
                        backgroundSpriteId: hex.baseTerrainSpriteId,
                        backgroundDevelopmentVector: hex.baseTerrainDevelopmentVector ?? hex.backgroundDevelopmentVector,
                    }]]
                    : []
            )),
        ),
        wallSegments: battleWallSegments,
        battlefieldWidth: wallLogicalWidth,
        battlefieldHeight,
        wallY: battlefieldLength,
    }), [
        battleWallSegments,
        allCityHexes,
        battlefieldHeight,
        battlefieldLength,
        cityBiome,
        cityTerrainVectorMap,
        wallLogicalWidth,
    ]);
    const battlefieldTerrainHexesKey = battlefieldTerrainHexesUnstable
        .map(hex => `${hex.cellKey}:${hex.centerX}:${hex.centerY}:${hex.backgroundSpriteId}:${hex.backgroundDevelopmentVector}`)
        .join("|");
    const battlefieldTerrainHexes = useStableValueByKey(battlefieldTerrainHexesUnstable, battlefieldTerrainHexesKey);
    const battleKey = useMemo(() => [
        battleRunId,
        wallLogicalWidth,
        battlefieldHeight,
        battlefieldTerrainHexes
            .map(hex => `${hex.cellKey}:${hex.backgroundSpriteId}`)
            .join("|"),
        resolvedBattleTowers.map(getResolvedTowerBattleKey).join("::"),
        standaloneTowerDefenses.map(getStandaloneTowerDefenseBattleKey).join("::"),
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
        battleRunId,
        wallLogicalWidth,
        battlefieldHeight,
        battlefieldTerrainHexes,
        resolvedBattleTowers,
        standaloneTowerDefenses,
        battleWallSegments,
    ]);
    const startBattleMode = useCallback((mode: BattleMode) => {
        if (battleMode === mode) return;

        setBattleMode(mode);
        setBattleRunId(runId => runId + 1);
    }, [battleMode]);
    const resetBattleRuntime = useCallback(() => {
        setBattleRunId(runId => runId + 1);
    }, []);
    const announceSiegeResult = useCallback((
        title: string,
        message: string,
        scheme: "alert" | "warning" | "congratulation",
    ) => {
        const notification = {
            title,
            message,
            scheme,
        };
        sendNotification(notification);
        dispatch(addNotificationHistoryEntry(notification));
    }, [dispatch]);
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
    useEffect(() => {
        if (!signatureStatus.isBesieged || battleMode === "siege") return;

        startBattleMode("siege");
    }, [battleMode, signatureStatus.isBesieged, startBattleMode]);
    useEffect(() => {
        if (pendingTerritoryLossFailureId === 0 || signatureStatus.isBesieged) return;

        setPendingTerritoryLossFailureId(0);
        setRetreatEnemiesSignal(signal => signal + 1);
        startBattleMode("pressure");
    }, [pendingTerritoryLossFailureId, signatureStatus.isBesieged, startBattleMode]);
    const handleBattleEnded = useCallback((result: BattleResult) => {
        setMetrics(result);

        if (result.outcome === "held") {
            processedFailedSiegeRef.current = null;
            dispatch(recordControlledTerritoryReached(result.threat));
            dispatch(recordLastSiegeSignature(cityThreat));
            dispatch(recordSurvivedSiege());
            dispatch(enqueueGlobalSignal({type: "siegeSucceeded"}));
            dispatch(enqueueGlobalSignal({type: "siegeEnded"}));
            announceSiegeResult("Siege repelled", SIEGE_REPELLED_MESSAGE, "congratulation");
            startBattleMode("pressure");
            return;
        }

        if (result.outcome === "overwhelmed") {
            if (processedFailedSiegeRef.current === "territoryLost") {
                processedFailedSiegeRef.current = null;
                setPendingTerritoryLossFailureId(0);
                if (signatureStatus.isBesieged) {
                    resetBattleRuntime();
                } else {
                    startBattleMode("pressure");
                }
                return;
            }

            if (!isSiege) {
                startBattleMode("pressure");
                return;
            }

            dispatch(enqueueGlobalSignal({type: "siegeFailedTerritoryLost"}));
            dispatch(enqueueGlobalSignal({type: "siegeEnded"}));
            announceSiegeResult("Siege overwhelmed", SIEGE_TERRITORY_LOST_MESSAGE, "alert");

            if (isDebugModeEnabled) {
                startBattleMode("pressure");
                return;
            }

            dispatch(loseUnprotectedCityTerritory());
            startBattleMode("pressure");
            return;
        }

        startBattleMode("pressure");
    }, [announceSiegeResult, cityThreat, dispatch, isDebugModeEnabled, isSiege, resetBattleRuntime, signatureStatus.isBesieged, startBattleMode]);
    const handleSiegeOverwhelmed = useCallback((): SiegeOverwhelmedDecision => {
        if (!isSiege) return "continueFrozen";

        const lostHexCount = countHexesLostToFailedSiege(allCityHexes);
        if (lostHexCount === 0) {
            processedFailedSiegeRef.current = "noTerritoryLost";
            dispatch(enqueueGlobalSignal({type: "siegeFailedNoTerritoryLost"}));
            announceSiegeResult("Siege not lifted", SIEGE_NOT_LIFTED_MESSAGE, "warning");
            return "continueFrozen";
        }

        processedFailedSiegeRef.current = "territoryLost";
        dispatch(enqueueGlobalSignal({type: "siegeFailedTerritoryLost"}));
        dispatch(enqueueGlobalSignal({type: "siegeEnded"}));
        announceSiegeResult("Siege overwhelmed", SIEGE_TERRITORY_LOST_MESSAGE, "alert");

        if (!isDebugModeEnabled) {
            dispatch(loseUnprotectedCityTerritory());
            setPendingTerritoryLossFailureId(id => id + 1);
        }

        return "waitForClear";
    }, [allCityHexes, announceSiegeResult, dispatch, isDebugModeEnabled, isSiege]);
    const handleBattleMetrics = useCallback((nextMetrics: BattleMetrics) => {
        const nextSecond = Math.floor(nextMetrics.siegeElapsedSeconds);
        if (nextSecond === lastRenderedMetricsSecondRef.current) return;

        lastRenderedMetricsSecondRef.current = nextSecond;
        setMetrics(nextMetrics);
    }, []);

    return (
        <div className={styles.battlePage}>
            {resolvedBattleTowers.length > 0 || standaloneTowerDefenses.length > 0 ? (
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
                    <BattleStage
                        wallLogicalWidth={wallLogicalWidth}
                        wallSegments={battleWallSegments}
                        terrainHexes={battlefieldTerrainHexes}
                        battlefieldWidth={wallLogicalWidth}
                        battlefieldHeight={battlefieldHeight}
                        wallY={battlefieldLength}
                        runtimeResetKey={battleRunId}
                        retreatEnemiesSignal={retreatEnemiesSignal}
                        resolvedTowers={resolvedBattleTowers}
                        standaloneTowerDefenses={standaloneTowerDefenses}
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
                        onSiegeOverwhelmed={handleSiegeOverwhelmed}
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

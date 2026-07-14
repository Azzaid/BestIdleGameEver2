import {type CSSProperties, useCallback, useEffect, useMemo, useRef, useState} from "react";
import CityHex from "./Components/CityHex/CityHex.tsx";
import * as s from "./CityWorldUnderlay.css.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {
    selectAllCityHexes,
    selectCityBiome,
    selectCityExpansionOptions,
    selectCityHexes,
} from "../../store/city/selectors.ts";
import {selectCitySignatureStatus, selectTowerAwareCityResolution} from "../../store/upkeep/selectors.ts";
import {selectIsDebugModeEnabled} from "../../store/debug/selectors.ts";
import type {HexCell} from "../../models/city/HexGrid.ts";
import type {CityExpansionOption} from "../../models/city/expansion.ts";
import {getAxialDistance} from "../../models/city/expansion.ts";
import {formatHomogeneousValue} from "../../models/homogeneousValueHelpers.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import {
    BATTLEFIELD_RANGE_MULTIPLIER,
    BATTLE_WALL_APRON_HEIGHT,
    BATTLE_WAVE_THREAT_TO_CITY_THREAT_RATIO,
    BASE_SIMULTANEOUS_MONSTERS_LIMIT,
    CITY_HEX_RADIUS,
    CITY_HEX_WIDTH,
    PRESSURE_WAVE_INTERVAL_SECONDS,
    SIEGE_DURATION_SECONDS,
    SIEGE_THREAT_START_RATIO,
    SIEGE_WAVE_INTERVAL_SECONDS,
    SIGNATURE_PER_HEX,
    toPixels,
} from "../../data/constants.ts";
import {useCityCanvasInteraction} from "./cityCanvasInteraction.tsx";
import {createBattlefieldTerrainHexes} from "../Battle/battlefieldTerrain.ts";
import type {BattleWallSegment} from "../../models/battle/wallSegment.ts";
import {axialCoordinateToPixelPosition} from "./Components/CityHex/hexUtils.ts";
import {
    selectControlledTerritory,
    selectEffectiveWallResolution,
    selectResolvedEffectiveAvailableTowers,
} from "../../store/upkeep/selectors.ts";
import {
    selectControlledTerritoryGrowthStep,
    selectMonsterModifierValues,
    selectSiegeModifierValues,
} from "../../store/homogeneousValues/selectors.ts";
import {createTowerDamageProfiles, resolveTowerAssemblyStatsAndSupport} from "../../models/battle/resolveTowerAssembly.ts";
import {towerStatsToPixels} from "../../models/battle/towerStatsPixels.ts";
import type {TowerAssemblyResolved, TowerStatsResolved} from "../../models/battle/towerParts.ts";
import type {StandaloneTowerDefense} from "../../models/battle/tower.ts";
import type {TowerDamageProfiles} from "../../models/battle/damage.ts";
import type {HomogeneousResolvedEntity} from "../../models/homogeneousValueResolution.ts";
import {
    resolveEntityContributionsWithDerivedValues,
    resolveEntityValuesWithDerivedValues,
} from "../../models/homogeneousValueResolution.ts";
import type {CityResolution} from "../../models/city/Adjancency.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS, isWallTopTower} from "../../data/wallSuperstructures/index.ts";
import type {BattleMetrics, BattleResult} from "../../models/battle/world.ts";
import {recordControlledTerritoryReached, recordLastSiegeSignature} from "../../store/upkeep/slice.ts";
import {loseUnprotectedCityTerritory, recordSurvivedSiege} from "../../store/city/slice.ts";
import {addNotificationHistoryEntry, enqueueGlobalSignal} from "../../store/globalEvents/slice.ts";
import {sendNotification} from "../../lib/notifications/eventBus.ts";
import type {CityBattleRuntimeConfig} from "../Battle/battleRuntime.ts";
import type {WorldViewMode} from "../../models/store/worldView.ts";
import {selectWorldViewMode} from "../../store/worldView/selectors.ts";
import {setWorldViewMode} from "../../store/worldView/slice.ts";

type BattleMode = "siege" | "pressure";

const SIEGE_REPELLED_MESSAGE = "Siege repelled. City now controls more territory.";
const SIEGE_TERRITORY_LOST_MESSAGE = "Siege overwhelmed city defense and we had to fall back to protected hexes behind the wall";
const SIEGE_NOT_LIFTED_MESSAGE = "City where not able to lift the siege. There are still monster waiting behind the wall.";
const BATTLEFIELD_UNTARGETABLE_ENTRY_HEXES = 3;

function toPercent(value: number, max: number) {
    if (max <= 0) return 0;
    return Math.floor(Math.max(0, Math.min(100, (value / max) * 100)));
}

export function CityWorldUnderlay({
    interactive,
    topInsetPx = 0,
}: {
    interactive: boolean;
    topInsetPx?: number;
}) {
    const dispatch = useTypedDispatch();
    const allHexes = useTypedSelector(selectAllCityHexes);
    const hexes = useTypedSelector(selectCityHexes);
    const cityBiome = useTypedSelector(selectCityBiome);
    const cityTerrainVectorMap = useTypedSelector(state => state.city.terrainVectorMap);
    const cityExpansionOptions = useTypedSelector(selectCityExpansionOptions);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const cityResolution = useTypedSelector(selectTowerAwareCityResolution);
    const controlledTerritory = useTypedSelector(selectControlledTerritory);
    const resolvedAvailableTowers = useTypedSelector(selectResolvedEffectiveAvailableTowers);
    const wallResolution = useTypedSelector(selectEffectiveWallResolution);
    const controlledTerritoryGrowthStep = useTypedSelector(selectControlledTerritoryGrowthStep);
    const monsterModifierValues = useTypedSelector(selectMonsterModifierValues);
    const siegeModifierValues = useTypedSelector(selectSiegeModifierValues);
    const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
    const worldViewMode = useTypedSelector(selectWorldViewMode);
    const {selectedHex, setConfirmingExpansionSide, setSelectedHex} = useCityCanvasInteraction();
    const [battleMode, setBattleMode] = useState<BattleMode>(() => signatureStatus.isBesieged ? "siege" : "pressure");
    const [battleRunId, setBattleRunId] = useState(0);
    const [retreatEnemiesSignal, setRetreatEnemiesSignal] = useState(0);
    const [pendingTerritoryLossFailureId, setPendingTerritoryLossFailureId] = useState(0);
    const [clearSelectionSignal, setClearSelectionSignal] = useState(0);
    const [cameraFocusRequest, setCameraFocusRequest] = useState<{target: WorldViewMode; id: number; focusCellKey?: string | null}>({
        target: "city",
        id: 0,
    });
    const lastRenderedMetricsSecondRef = useRef(-1);
    const hasAnnouncedSiegeStartedRef = useRef(false);
    const previousWorldViewModeRef = useRef<WorldViewMode>(worldViewMode);
    const protectedCityRadius = getProtectedCityRadius(allHexes);
    const occupiedCellKeys = useMemo(
        () => new Set(allHexes.filter(hex => !hex.isUnclaimed).map(hex => hex.cellKey)),
        [allHexes],
    );
    const resolvedBattleTowers = useMemo(
        () => resolvedAvailableTowers
            .map(({resolved}) => ({
                ...resolved,
                stats: towerStatsToPixels(resolved.stats),
            }))
            .filter((resolved) => resolved.warnings.length === 0),
        [resolvedAvailableTowers],
    );
    const derivedSourceValues = useMemo(
        () => getDerivedSourceValues(cityResolution, controlledTerritory),
        [cityResolution, controlledTerritory],
    );
    const standaloneTowerDefenses = useMemo(
        () => createStandaloneTowerDefenses(cityResolution.resolvedWallSegments, derivedSourceValues),
        [cityResolution.resolvedWallSegments, derivedSourceValues],
    );
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
        wallResolution.zoneDotKeywords,
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
    const battleWallSegments = useMemo(() => hexes
        .filter(hex => hex.kind === "wall")
        .sort((left, right) => left.column - right.column)
        .map<BattleWallSegment>(hex => ({
            cellKey: hex.cellKey,
            column: hex.column,
            row: hex.row,
            wallKey: hex.wallKey ?? null,
            wallDevelopmentVector: hex.wallDevelopmentVector ?? null,
            wallTopKey: hex.wallTopKey ?? null,
            wallTopDevelopmentVector: hex.wallTopDevelopmentVector ?? null,
        })), [hexes]);
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
        * siegeModifierValues.simultaneousMonstersLimitMultiplier,
    ));
    const [metrics, setMetrics] = useState<BattleMetrics>(() => ({
        threat: initialThreat,
        targetThreat,
        siegeElapsedSeconds: 0,
        siegePressure: 0,
        wallResilience: wallResolution.resilience,
    }));
    const siegeProgressPercent = isSiege
        ? toPercent(metrics.siegeElapsedSeconds, siegeDurationSeconds)
        : 0;
    const wallResilienceProgressPercent = toPercent(metrics.siegePressure, metrics.wallResilience);
    const battlefieldWidth = Math.max(1, battleWallSegments.length) * CITY_HEX_WIDTH;
    const standaloneDefenseRanges = standaloneTowerDefenses.map((defense) => getTowerBattlefieldRange(defense.stats));
    const longestTowerRange = Math.max(
        0,
        ...resolvedBattleTowers.map((tower) => getTowerBattlefieldRange(tower.stats)),
        ...standaloneDefenseRanges,
    );
    const battlefieldDepth = longestTowerRange * BATTLEFIELD_RANGE_MULTIPLIER + toPixels(BATTLEFIELD_UNTARGETABLE_ENTRY_HEXES);
    const battlefieldHeight = battlefieldDepth + BATTLE_WALL_APRON_HEIGHT;
    const baseTerrainBackgroundsByKey = useMemo(() => Object.fromEntries(
        allHexes.flatMap(hex => (
            hex.baseTerrainSpriteId
                ? [[hex.cellKey, {
                    backgroundSpriteId: hex.baseTerrainSpriteId,
                    backgroundDevelopmentVector: hex.baseTerrainDevelopmentVector ?? hex.backgroundDevelopmentVector,
                }]]
                : []
        )),
    ), [allHexes]);
    const localBattlefieldHexes = useMemo(() => createBattlefieldTerrainHexes({
        biome: cityBiome,
        terrainVectorMap: cityTerrainVectorMap,
        baseTerrainBackgroundsByKey,
        wallSegments: battleWallSegments,
        battlefieldWidth,
        battlefieldHeight,
        wallY: battlefieldDepth,
    }), [
        baseTerrainBackgroundsByKey,
        battleWallSegments,
        battlefieldDepth,
        battlefieldHeight,
        battlefieldWidth,
        cityBiome,
        cityTerrainVectorMap,
    ]);
    const translatedBattlefield = useMemo(
        () => translateBattlefieldHexesToCityWorld(localBattlefieldHexes, battleWallSegments, battlefieldDepth),
        [battleWallSegments, battlefieldDepth, localBattlefieldHexes],
    );
    const battlefieldHexes = useMemo(
        () => translatedBattlefield.hexes.filter(hex => !occupiedCellKeys.has(hex.cellKey)),
        [occupiedCellKeys, translatedBattlefield.hexes],
    );
    const startBattleMode = useCallback((mode: BattleMode) => {
        if (battleMode === mode) return;

        setBattleMode(mode);
        setBattleRunId(runId => runId + 1);
    }, [battleMode]);
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
    }, [battleRunId, initialThreat, targetThreat, wallResolution.resilience]);
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
        const previousWorldViewMode = previousWorldViewModeRef.current;
        previousWorldViewModeRef.current = worldViewMode;

        if (worldViewMode === previousWorldViewMode && worldViewMode !== "tower") return;

        setCameraFocusRequest(request => ({
            target: worldViewMode,
            id: request.id + 1,
            focusCellKey: worldViewMode === "tower" ? selectedHex?.cellKey ?? null : null,
        }));
    }, [selectedHex?.cellKey, worldViewMode]);
    useEffect(() => {
        if (worldViewMode !== "tower" || selectedHex) return;

        dispatch(setWorldViewMode("city"));
    }, [dispatch, selectedHex, worldViewMode]);
    useEffect(() => {
        if (pendingTerritoryLossFailureId === 0 || signatureStatus.isBesieged) return;

        setPendingTerritoryLossFailureId(0);
        startBattleMode("pressure");
    }, [pendingTerritoryLossFailureId, signatureStatus.isBesieged, startBattleMode]);
    const handleBattleEnded = useCallback((result: BattleResult) => {
        dispatch(recordControlledTerritoryReached(result.threat));
        dispatch(recordLastSiegeSignature(cityThreat));
        dispatch(recordSurvivedSiege());
        dispatch(enqueueGlobalSignal({type: "siegeSucceeded"}));
        dispatch(enqueueGlobalSignal({type: "siegeEnded"}));
        announceSiegeResult("Siege repelled", SIEGE_REPELLED_MESSAGE, "congratulation");
        startBattleMode("pressure");
    }, [announceSiegeResult, cityThreat, dispatch, startBattleMode]);
    const handleSiegeOverwhelmed = useCallback(() => {
        if (!isSiege) return;

        const lostHexCount = countHexesLostToFailedSiege(allHexes);
        if (lostHexCount === 0) {
            dispatch(enqueueGlobalSignal({type: "siegeFailedNoTerritoryLost"}));
            announceSiegeResult("Siege not lifted", SIEGE_NOT_LIFTED_MESSAGE, "warning");
            return;
        }

        dispatch(enqueueGlobalSignal({type: "siegeFailedTerritoryLost"}));
        dispatch(enqueueGlobalSignal({type: "siegeEnded"}));
        announceSiegeResult("Siege overwhelmed", SIEGE_TERRITORY_LOST_MESSAGE, "alert");

        dispatch(loseUnprotectedCityTerritory());
        setPendingTerritoryLossFailureId(id => id + 1);
        setRetreatEnemiesSignal(signal => signal + 1);
    }, [allHexes, announceSiegeResult, dispatch, isSiege]);
    const handleBattleMetrics = useCallback((nextMetrics: BattleMetrics) => {
        const nextSecond = Math.floor(nextMetrics.siegeElapsedSeconds);
        if (nextSecond === lastRenderedMetricsSecondRef.current) return;

        lastRenderedMetricsSecondRef.current = nextSecond;
        setMetrics(nextMetrics);
    }, []);
    const battleRuntime = useMemo<CityBattleRuntimeConfig | null>(() => {
        if (resolvedBattleTowers.length === 0 && standaloneTowerDefenses.length === 0) return null;

        return {
            battleKey: [
                battleRunId,
                battlefieldWidth,
                battlefieldHeight,
                resolvedBattleTowers.map(getResolvedTowerBattleKey).join("::"),
                standaloneTowerDefenses.map(getStandaloneTowerDefenseBattleKey).join("::"),
                battleWallSegments.map(segment => [
                    segment.cellKey,
                    segment.wallKey ?? "",
                    segment.wallDevelopmentVector ?? "",
                    segment.wallTopKey ?? "",
                    segment.wallTopDevelopmentVector ?? "",
                ].join(":")).join("|"),
            ].join(":"),
            wallSegments: battleWallSegments,
            terrainHexes: battlefieldHexes,
            standaloneTowerDefenses,
            battlefieldWidth,
            battlefieldHeight,
            wallY: battlefieldDepth,
            runtimeResetKey: battleRunId,
            retreatEnemiesSignal,
            resolvedTowers: resolvedBattleTowers,
            initialThreat,
            targetThreat,
            threatGrowthPerSecond,
            waveThreatToCityThreatRatio: BATTLE_WAVE_THREAT_TO_CITY_THREAT_RATIO,
            simultaneousMonstersLimit,
            timeBetweenWavesSeconds,
            fastForwardWavesWhenCleared: isSiege,
            completesWhenThreatTargetReached: isSiege,
            wallResilience: wallResolution.resilience,
            wallIgnoredThreat: wallResolution.ignoredThreat,
            monsterMovementModifiers,
            wallZoneEffects,
            showDebugOutlines: isDebugModeEnabled,
            showSiegeOutline: isSiege,
            origin: translatedBattlefield.origin,
            onBattleMetrics: handleBattleMetrics,
            onBattleEnded: handleBattleEnded,
            onSiegeOverwhelmed: handleSiegeOverwhelmed,
        };
    }, [
        battleRunId,
        battleWallSegments,
        battlefieldDepth,
        battlefieldHeight,
        battlefieldHexes,
        battlefieldWidth,
        handleBattleEnded,
        handleBattleMetrics,
        handleSiegeOverwhelmed,
        initialThreat,
        isDebugModeEnabled,
        isSiege,
        monsterMovementModifiers,
        resolvedBattleTowers,
        retreatEnemiesSignal,
        simultaneousMonstersLimit,
        standaloneTowerDefenses,
        targetThreat,
        threatGrowthPerSecond,
        timeBetweenWavesSeconds,
        translatedBattlefield.origin,
        wallResolution.ignoredThreat,
        wallResolution.resilience,
        wallZoneEffects,
    ]);
    const clearSelectedHex = useCallback(() => {
        setSelectedHex(null);
        setConfirmingExpansionSide(null);
        setClearSelectionSignal(signal => signal + 1);
    }, [setConfirmingExpansionSide, setSelectedHex]);

    const requestWorldViewMode = useCallback((mode: WorldViewMode) => {
        if (mode === "battle") {
            clearSelectedHex();
        }

        if (worldViewMode === mode) {
            setCameraFocusRequest(request => ({
                target: mode,
                id: request.id + 1,
            }));
            return;
        }

        dispatch(setWorldViewMode(mode));
    }, [clearSelectedHex, dispatch, worldViewMode]);

    const selectHex = (hex: HexCell | null) => {
        if (!hex) {
            clearSelectedHex();
            return;
        }

        const selectedCoreHex = hex.partOfStructureId && !hex.isLost
            ? hexes.find(candidate => candidate.cellKey === (hex.structureCoreCellKey ?? hex.cellKey)) ?? hex
            : hex;

        setSelectedHex(selectedCoreHex);
    };

    const getExpansionDisabledReason = (option: CityExpansionOption) => {
        if (isDebugModeEnabled) return undefined;
        if (option.addedHexCount === 0) return "No claimable land remains on this side.";

        const outsideProtectedHexCount = getOutsideProtectedExpansionHexCount(option, protectedCityRadius);
        if (outsideProtectedHexCount === 0) return undefined;

        const requiredTerritory = getExpansionRequiredTerritory(cityResolution, outsideProtectedHexCount);
        if (signatureStatus.controlledTerritory < requiredTerritory) {
            return `Requires controlled territory ${formatHomogeneousValue(HOMOGENEOUS_VALUE_IDS.cityControlledTerritory, requiredTerritory)}.`;
        }

        return undefined;
    };
    const worldUnderlayStyle = {
        pointerEvents: interactive ? "auto" : "none",
        "--city-world-top-inset": `${topInsetPx}px`,
    } as CSSProperties;

    return (
        <div
            className={s.worldUnderlay}
            aria-hidden={!interactive}
            style={worldUnderlayStyle}
        >
            <div className={s.cityCanvas}>
                <CityHex
                    cells={allHexes}
                    biome={cityBiome}
                    topInsetPx={topInsetPx}
                    expansionOptions={cityExpansionOptions}
                    getExpansionDisabledReason={getExpansionDisabledReason}
                    showDebugAxes={isDebugModeEnabled}
                    battlefieldHexes={battlefieldHexes}
                    battleRuntime={battleRuntime}
                    cameraFocusRequest={cameraFocusRequest}
                    clearSelectionSignal={clearSelectionSignal}
                    onExpandSide={setConfirmingExpansionSide}
                    onSelect={selectHex}
                />
            </div>
            {worldViewMode === "battle" && battleRuntime && (
                <>
                    {isSiege && (
                        <div className={`${s.battleProgress} ${s.siegeProgress}`} aria-label="Siege duration">
                            <span className={s.progressLabel}>Siege</span>
                            <div className={s.progressTrack}>
                                <div
                                    className={s.siegeProgressFill}
                                    style={{width: `${siegeProgressPercent}%`}}
                                />
                            </div>
                        </div>
                    )}
                    <div className={`${s.battleProgress} ${s.wallResilienceProgress}`} aria-label="Wall resilience">
                        <span className={s.progressLabel}>Wall resilience</span>
                        <div className={s.progressTrack}>
                            <div
                                className={s.wallResilienceProgressFill}
                                style={{width: `${wallResilienceProgressPercent}%`}}
                            />
                        </div>
                    </div>
                </>
            )}
            {interactive && worldViewMode === "city" && (
                <div className={`${s.cameraControls} ${s.cameraControlsCity}`}>
                    <button
                        className={`${s.cameraButton} ${s.cameraButtonUp}`}
                        type="button"
                        aria-label="View battle"
                        title="View battle"
                        onClick={() => requestWorldViewMode("battle")}
                    >
                        {"\u2191"}
                    </button>
                </div>
            )}
            {interactive && worldViewMode === "battle" && (
                <div className={`${s.cameraControls} ${s.cameraControlsBattle}`}>
                    <button
                        className={`${s.cameraButton} ${s.cameraButtonDown}`}
                        type="button"
                        aria-label="View city"
                        title="View city"
                        onClick={() => requestWorldViewMode("city")}
                    >
                        {"\u2193"}
                    </button>
                </div>
            )}
        </div>
    );
}

function translateBattlefieldHexesToCityWorld<T extends {centerX: number; centerY: number}>(
    battlefieldHexes: readonly T[],
    wallSegments: readonly BattleWallSegment[],
    localWallY: number,
): {
    hexes: T[];
    origin: {x: number; y: number};
} {
    const anchorSegment = wallSegments
        .map(segment => ({
            segment,
            offset: segment.column + segment.row / 2,
        }))
        .sort((left, right) => left.offset - right.offset)[0];
    if (!anchorSegment) return {
        hexes: [...battlefieldHexes],
        origin: {x: 0, y: 0},
    };

    const minWallOffset = Math.min(...wallSegments.map(segment => segment.column + segment.row / 2));
    const localAnchorX = (anchorSegment.offset - minWallOffset) * CITY_HEX_WIDTH + CITY_HEX_WIDTH / 2;
    const cityAnchor = axialCoordinateToPixelPosition(anchorSegment.segment, CITY_HEX_RADIUS, 0);
    const offsetX = cityAnchor.x - localAnchorX;
    const offsetY = cityAnchor.y - localWallY;

    return {
        hexes: battlefieldHexes.map(hex => ({
            ...hex,
            centerX: hex.centerX + offsetX,
            centerY: hex.centerY + offsetY,
        })),
        origin: {x: offsetX, y: offsetY},
    };
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

export function getExpansionRequiredTerritory(
    cityResolution: ReturnType<typeof selectTowerAwareCityResolution>,
    outsideProtectedHexCount: number,
): number {
    return cityResolution.effectiveSignature + SIGNATURE_PER_HEX * outsideProtectedHexCount;
}

export function getProtectedCityRadius(hexes: readonly HexCell[]): number {
    const activeWallHexes = hexes.filter(hex => (
        !hex.isUnclaimed
        && !hex.isLost
        && hex.kind === "wall"
    ));
    const wallCoordinateRadius = activeWallHexes.reduce((radius, hex) => (
        Math.max(radius, getAxialDistance(hex, {column: 0, row: 0}))
    ), 0);

    return Math.max(1, activeWallHexes.length - 1, wallCoordinateRadius);
}

export function getOutsideProtectedExpansionHexCount(
    option: CityExpansionOption,
    protectedCityRadius: number,
): number {
    return option.hexes.filter(hex => (
        getAxialDistance(hex, {column: 0, row: 0}) > protectedCityRadius
    )).length;
}

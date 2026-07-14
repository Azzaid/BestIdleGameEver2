import { useEffect, useMemo, useState } from 'react';
import * as s from './CityPage.css.ts';
import type {HexCell} from "../../models/city/HexGrid.ts";
import {BuildingSelector} from "./Components/BuildingSelector/BuildingSelector.tsx";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {
    selectCityExpansionOptions,
    selectBuiltStructureIds,
    selectAllCityHexes,
    selectCityBuildings,
    selectCityHexes,
    selectCityStructureCandidates,
} from "../../store/city/selectors.ts";
import {
    buildHex,
    buildWall,
    buildWallTop,
    demolishHex,
    demolishWallTop,
    buildMultistructure,
    expandCitySide,
} from "../../store/city/slice.ts";
import {UPKEEP_SPRITES, UPKEEP_TYPES, type UpkeepAmount, type UpkeepTypesValue} from "../../models/Upkeep.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../data/wallSegments/index.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS, isWallTopTower} from "../../data/wallSuperstructures/index.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import {selectWallResolution} from "../../store/wall/selectors.ts";
import type {SelectedHexPanelProps} from "../../models/city/cityPage.ts";
import {selectCitySignatureStatus, selectTowerAwareCityResolution} from "../../store/upkeep/selectors.ts";
import type {PlacedBuilding} from "../../models/city/Building.ts";
import type {StructureDetectionResult} from "../../models/city/multistructureDetection.ts";
import {BUILDINGS_ATLAS} from "../../data/buildings";
import {getUpkeepShortfalls, hasEnoughUpkeep} from "./Components/CityHex/upkeepUtils.ts";
import {placeCityBuildings} from "./Components/CityHex/adjacencyUtils.ts";
import {
    formatHomogeneousValue,
    getHomogeneousProductionContributions,
    getHomogeneousRequirementContributions,
} from "../../models/homogeneousValueHelpers.ts";
import {getHomogeneousValueDefinition, HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {HomogeneousActiveModifier} from "../../models/homogeneousValueResolution.ts";
import {getUpkeepValues, normalizeMultiplier, resolveHomogeneousValueContributions} from "../../models/homogeneousValueResolution.ts";
import {
    getHomogeneousValueIdForUpkeepType,
    homogeneousValueTotalsToUpkeepAmount,
} from "../../models/homogeneousValueAdapters.ts";
import {GLOBAL_MODIFIERS} from "../../data/globalModifiers/index.ts";
import {resolveGlobalModifierEffects} from "../../models/globalEvents.ts";
import {selectActiveGlobalModifiers} from "../../store/globalEvents/selectors.ts";
import {
    selectRequirementResolutionData,
    selectUnlockedBuildingIds,
    selectUnlockedWallSegmentIds,
    selectUnlockedWallSuperstructureIds,
    selectVisibleBuildingIds,
    selectVisibleWallSegmentIds,
    selectVisibleWallSuperstructureIds,
} from "../../store/unlocks/selectors.ts";
import {areRequirementsMet, getUnmetRequirements, type Requirement} from "../../models/progression/requirements.ts";
import {ConfirmationModal} from "../../components/ConfirmationModal.tsx";
import {sendNotification} from "../../lib/notifications/eventBus.ts";
import {enqueueGlobalSignal} from "../../store/globalEvents/slice.ts";
import {SIGNATURE_PER_HEX} from "../../data/constants.ts";
import {getAxialDistance} from "../../models/city/expansion.ts";
import type {CityExpansionOption} from "../../models/city/expansion.ts";
import {selectIsDebugModeEnabled} from "../../store/debug/selectors.ts";
import {useCityCanvasInteraction} from "./cityCanvasInteraction.tsx";

const EXPAND_WARNING = "City grows bigger, more noticeable and attracts more monsters";
const LOST_TERRITORY_BLOCK_REASON = "Lost territory must be reclaimed before it can work, transform, or be rebuilt.";
const BROKEN_STRUCTURE_BLOCK_REASON = "This multistructure is cut off. Reclaim every part before it can work again.";

const CityPage = () => {
    const dispatch = useTypedDispatch();
    const allHexes = useTypedSelector(selectAllCityHexes);
    const cityExpansionOptions = useTypedSelector(selectCityExpansionOptions);
    const hexes = useTypedSelector(selectCityHexes);
    const cityBuildings = useTypedSelector(selectCityBuildings);
    const builtStructureIds = useTypedSelector(selectBuiltStructureIds);
    const structureCandidates = useTypedSelector(selectCityStructureCandidates);
    const wallResolution = useTypedSelector(selectWallResolution);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const cityResolution = useTypedSelector(selectTowerAwareCityResolution);
    const {effectiveUpkeep} = cityResolution;
    const unlockedBuildingIds = useTypedSelector(selectUnlockedBuildingIds);
    const visibleBuildingIds = useTypedSelector(selectVisibleBuildingIds);
    const unlockedWallSegmentIds = useTypedSelector(selectUnlockedWallSegmentIds);
    const visibleWallSegmentIds = useTypedSelector(selectVisibleWallSegmentIds);
    const unlockedWallSuperstructureIds = useTypedSelector(selectUnlockedWallSuperstructureIds);
    const visibleWallSuperstructureIds = useTypedSelector(selectVisibleWallSuperstructureIds);
    const requirementResolutionData = useTypedSelector(selectRequirementResolutionData);
    const activeGlobalModifiers = useTypedSelector(selectActiveGlobalModifiers);
    const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
    const {
        selectedHex,
        setSelectedHex,
        confirmingExpansionSide,
        setConfirmingExpansionSide,
    } = useCityCanvasInteraction();
    const [globalEffectsOpen, setGlobalEffectsOpen] = useState(false);

    useEffect(() => {
        if (!selectedHex) return;

        const currentHex = allHexes.find(hex => hex.cellKey === selectedHex.cellKey);
        if (!currentHex) {
            setSelectedHex(null);
            return;
        }

        const currentCoreHex = currentHex.partOfStructureId && !currentHex.isLost
            ? hexes.find(hex => hex.cellKey === (currentHex.structureCoreCellKey ?? currentHex.cellKey)) ?? currentHex
            : currentHex;

        setSelectedHex(currentCoreHex);
    }, [allHexes, hexes, selectedHex]);
    const unlockedBuildingIdSet = useMemo(() => new Set(unlockedBuildingIds), [unlockedBuildingIds]);
    const visibleBuildingIdSet = useMemo(() => new Set(visibleBuildingIds), [visibleBuildingIds]);
    const unlockedWallSegmentIdSet = useMemo(() => new Set(unlockedWallSegmentIds), [unlockedWallSegmentIds]);
    const visibleWallSegmentIdSet = useMemo(() => new Set(visibleWallSegmentIds), [visibleWallSegmentIds]);
    const unlockedWallSuperstructureIdSet = useMemo(() => new Set(unlockedWallSuperstructureIds), [unlockedWallSuperstructureIds]);
    const visibleWallSuperstructureIdSet = useMemo(() => new Set(visibleWallSuperstructureIds), [visibleWallSuperstructureIds]);
    const builtStructureIdSet = useMemo(() => new Set(builtStructureIds), [builtStructureIds]);
    const unavailableBuildingReasons = useMemo(() => {
        if (!selectedHex || selectedHex.isLost || selectedHex.kind !== "city" || selectedHex.buildingKey || selectedHex.partOfStructureId) {
            return {};
        }

        const reasons: Record<string, string> = {};

        for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
            for (const building of Object.values(BUILDINGS_ATLAS[vector])) {
                if (building.isMultistructure || !visibleBuildingIdSet.has(building.id)) continue;

                if (!unlockedBuildingIdSet.has(building.id)) {
                    reasons[building.id] = "Not permanently unlocked yet";
                    continue;
                }

                const unmetBuildRequirements = getUnmetRequirements(building.buildRequirements, requirementResolutionData);
                if (unmetBuildRequirements.length) {
                    reasons[building.id] = formatUnmetBuildRequirements(unmetBuildRequirements, requirementResolutionData);
                    continue;
                }

                const requiredUpkeep = getResolvedRequiredUpkeepForBuild(hexes, selectedHex, building.id, vector);
                const shortfalls = getUpkeepShortfalls(requiredUpkeep, effectiveUpkeep);
                const missingResources = formatMissingUpkeep(shortfalls);

                if (missingResources) {
                    reasons[building.id] = `Missing ${missingResources}`;
                }
            }
        }

        return reasons;
    }, [effectiveUpkeep, hexes, requirementResolutionData, selectedHex, unlockedBuildingIdSet, visibleBuildingIdSet]);
    const unavailableWallSegmentReasons = useMemo(
        () => getUnavailableWallBuildingReasons(WALL_SEGMENT_BUILDINGS, unlockedWallSegmentIdSet, requirementResolutionData),
        [requirementResolutionData, unlockedWallSegmentIdSet],
    );
    const unavailableWallSuperstructureReasons = useMemo(
        () => getUnavailableWallBuildingReasons(WALL_SUPERSTRUCTURE_BUILDINGS, unlockedWallSuperstructureIdSet, requirementResolutionData),
        [requirementResolutionData, unlockedWallSuperstructureIdSet],
    );
    const selectedExpansionOption = confirmingExpansionSide
        ? cityExpansionOptions.find(option => option.side.id === confirmingExpansionSide)
        : undefined;
    const protectedCityRadius = getProtectedCityRadius(allHexes);
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

    const handleBuildingSelect = (buildingKey: string, developmentVector: DevelopmentVectorValue) => {
        if (!selectedHex || selectedHex.isLost) return;
        if (selectedHex.kind !== "city" || selectedHex.buildingKey || selectedHex.partOfStructureId) return;
        if (!unlockedBuildingIdSet.has(buildingKey)) return;
        if (!areRequirementsMet(BUILDINGS_ATLAS[developmentVector][buildingKey]?.buildRequirements, requirementResolutionData)) return;

        const requiredUpkeep = getResolvedRequiredUpkeepForBuild(hexes, selectedHex, buildingKey, developmentVector);
        if (!hasEnoughUpkeep(requiredUpkeep, effectiveUpkeep)) return;

        const builtHex = {...selectedHex, buildingKey, developmentVector};
        dispatch(buildHex(builtHex));
        setSelectedHex(builtHex);
    };

    const handleWallBuildingSelect = (buildingKey: string) => {
        if (!selectedHex || selectedHex.isLost) return;
        if (selectedHex.kind !== "wall" || selectedHex.wallKey === buildingKey) return;
        if (!unlockedWallSegmentIdSet.has(buildingKey)) return;
        const wallBuilding = WALL_SEGMENT_BUILDINGS[buildingKey];
        if (!wallBuilding) return;
        if (!areRequirementsMet(wallBuilding.buildRequirements, requirementResolutionData)) return;
        const nextHex = {
            ...selectedHex,
            wallKey: buildingKey,
            wallDevelopmentVector: wallBuilding.vector ?? DEVELOPMENT_VECTORS.medieval,
        };
        dispatch(buildWall({
            cellKey: selectedHex.cellKey,
            wallKey: buildingKey,
            developmentVector: nextHex.wallDevelopmentVector,
        }))
        setSelectedHex(nextHex);
    };

    const handleWallTopBuildingSelect = (buildingKey: string) => {
        if (!selectedHex || selectedHex.isLost) return;
        if (selectedHex.kind !== "wall" || selectedHex.wallTopKey) return;
        if (!unlockedWallSuperstructureIdSet.has(buildingKey)) return;
        const wallTopBuilding = WALL_SUPERSTRUCTURE_BUILDINGS[buildingKey];
        if (!wallTopBuilding) return;
        if (!areRequirementsMet(wallTopBuilding.buildRequirements, requirementResolutionData)) return;
        const nextHex = {
            ...selectedHex,
            wallTopKey: buildingKey,
            wallTopDevelopmentVector: wallTopBuilding.vector ?? DEVELOPMENT_VECTORS.medieval,
        };
        dispatch(buildWallTop({
            cellKey: selectedHex.cellKey,
            wallTopKey: buildingKey,
            developmentVector: nextHex.wallTopDevelopmentVector,
        }))
        setSelectedHex(nextHex);
    };

    const handleDemolishSelectedHex = () => {
        if (!selectedHex) return;
        dispatch(demolishHex({cellKey: selectedHex.cellKey}));
        setSelectedHex(null);
    };

    const handleDemolishSelectedWallTop = () => {
        if (!selectedHex || selectedHex.kind !== "wall" || !selectedHex.wallTopKey) return;
        dispatch(demolishWallTop({cellKey: selectedHex.cellKey}));
        setSelectedHex({
            ...selectedHex,
            wallTopKey: null,
            wallTopDevelopmentVector: undefined,
        });
    };

    const handleBuildStructure = (structureId: string, coreCellKey: string) => {
        if (!selectedHex || selectedHex.isLost) return;
        if (!unlockedBuildingIdSet.has(structureId)) return;
        const structureBuilding = getStructureBuilding(structureId);
        if (!areRequirementsMet(structureBuilding?.buildRequirements, requirementResolutionData)) return;
        dispatch(buildMultistructure({ coreCellKey, structureId }));
    };

    const handleExpandConfirm = () => {
        if (!selectedExpansionOption || getExpansionDisabledReason(selectedExpansionOption)) return;

        dispatch(expandCitySide({sideId: selectedExpansionOption.side.id}));
        dispatch(enqueueGlobalSignal({type: "cityExpanded"}));
        setConfirmingExpansionSide(null);
        sendNotification({
            title: "City Expanded",
            message: EXPAND_WARNING,
            scheme: "warning",
        });
    };

    const selectedActiveBuilding = selectedHex ? cityBuildings.get(selectedHex.cellKey) : undefined;
    const selectedBuilding = selectedHex ? selectedActiveBuilding ?? getStoredPlacedBuilding(selectedHex) : undefined;
    const selectedStructureIsBroken = Boolean(selectedHex?.partOfStructureId && !selectedActiveBuilding);
    const selectedResolvedEntity = selectedHex
        ? cityResolution.resolvedHexes.find(entity => (
            entity.entityType === "building"
            && entity.cellKey === selectedHex.cellKey
        ))
        : undefined;
    const selectedWallBuilding = selectedHex?.wallKey ? WALL_SEGMENT_BUILDINGS[selectedHex.wallKey] : undefined;
    const selectedWallTopBuilding = selectedHex?.wallTopKey ? WALL_SUPERSTRUCTURE_BUILDINGS[selectedHex.wallTopKey] : undefined;
    const selectedBuildingVector = selectedBuilding?.vector ?? (selectedHex?.kind === "city" ? selectedHex.developmentVector : undefined);
    const selectedBuildingIsNature = selectedBuildingVector === DEVELOPMENT_VECTORS.nature;
    const selectedStructureCandidates = selectedHex
        ? structureCandidates.filter(candidate => (
            isHexPartOfStructureCandidate(selectedHex.cellKey, candidate)
            && isStructureCandidateVisibleOrBuilt(candidate, visibleBuildingIdSet)
        ))
        : [];
    const selectedHexIsPartOfCompleteStructure = selectedHex
        ? Boolean(selectedHex.partOfStructureId)
        : false;

    return (
        <div className={s.cityPage}>
            <GlobalEffectsDrawer
                activeGlobalModifiers={activeGlobalModifiers}
                isOpen={globalEffectsOpen}
                onToggle={() => setGlobalEffectsOpen(isOpen => !isOpen)}
            />
            {selectedHex &&
                <div className={s.buildingSelectorContainer}>
                    <SelectedHexPanel
                        selectedHex={selectedHex}
                        selectedBuilding={selectedBuilding}
                        selectedResolvedEntity={selectedResolvedEntity}
                        selectedWallBuilding={selectedWallBuilding}
                        selectedWallTopBuilding={selectedWallTopBuilding}
                        structureCandidates={selectedStructureCandidates}
                        builtStructureIds={builtStructureIdSet}
                        unlockedBuildingIds={unlockedBuildingIdSet}
                        requirementResolutionData={requirementResolutionData}
                        isPartOfCompleteStructure={selectedHexIsPartOfCompleteStructure}
                        wallResolution={wallResolution}
                        blocked={false}
                        blockedReason=""
                        isLost={Boolean(selectedHex.isLost || selectedStructureIsBroken)}
                        lostReason={selectedHex.isLost ? LOST_TERRITORY_BLOCK_REASON : BROKEN_STRUCTURE_BLOCK_REASON}
                        onBuildStructure={handleBuildStructure}
                        onDemolish={handleDemolishSelectedHex}
                        onDemolishWallTop={handleDemolishSelectedWallTop}
                    />
                    {selectedHex.isLost
                        ? <p className={s.buildingLockedNote}>
                            {LOST_TERRITORY_BLOCK_REASON}
                        </p>
                        : selectedHex.kind === "wall"
                        ? <WallBuildingSelector
                            onBuildWall={handleWallBuildingSelect}
                            onBuildWallTop={handleWallTopBuildingSelect}
                            visibleWallSegmentIds={visibleWallSegmentIdSet}
                            visibleWallSuperstructureIds={visibleWallSuperstructureIdSet}
                            unavailableWallSegmentReasons={unavailableWallSegmentReasons}
                            unavailableWallSuperstructureReasons={unavailableWallSuperstructureReasons}
                            currentWallKey={selectedHex.wallKey ?? null}
                            hasWallTop={Boolean(selectedHex.wallTopKey)}
                            blocked={false}
                            blockedReason=""
                        />
                        : selectedHex.buildingKey || selectedHex.partOfStructureId
                            ? <p className={s.buildingLockedNote}>
                                {selectedBuildingIsNature
                                    ? "Nature buildings remain rooted here and cannot be demolished."
                                    : "Demolish the existing building before using this hex again."}
                            </p>
                            : <BuildingSelector
                            onBuild={handleBuildingSelect}
                            unlockedBuildingIds={visibleBuildingIdSet}
                            unavailableBuildingReasons={unavailableBuildingReasons}
                            blocked={false}
                            blockedReason=""
                        />
                    }
                </div>
            }
            {selectedExpansionOption && (
                <div className={s.overlayControl}>
                    <ConfirmationModal
                        title="Expand City?"
                        message={`${EXPAND_WARNING}. ${selectedExpansionOption.side.label} by ${selectedExpansionOption.addedHexCount} hexes.`}
                        confirmLabel="Expand"
                        onCancel={() => setConfirmingExpansionSide(null)}
                        onConfirm={handleExpandConfirm}
                    />
                </div>
            )}
        </div>
    );
};

function getExpansionRequiredTerritory(
    cityResolution: ReturnType<typeof selectTowerAwareCityResolution>,
    outsideProtectedHexCount: number,
): number {
    return cityResolution.effectiveSignature + SIGNATURE_PER_HEX * outsideProtectedHexCount;
}

function getProtectedCityRadius(hexes: readonly HexCell[]): number {
    const activeWallHexes = hexes.filter(hex => (
        !hex.isUnclaimed
        && !hex.isLost
        && hex.kind === "wall"
    ));
    const wallCoordinateRadius = activeWallHexes.reduce((radius, hex) => (
        Math.max(radius, getAxialDistance(hex, {column: 0, row: 0}))
    ), 1);

    return Math.max(1, activeWallHexes.length - 1, wallCoordinateRadius);
}

function getOutsideProtectedExpansionHexCount(
    option: CityExpansionOption,
    protectedCityRadius: number,
): number {
    return option.hexes.filter(hex => (
        getAxialDistance(hex, {column: 0, row: 0}) > protectedCityRadius
    )).length;
}

function GlobalEffectsDrawer({
    activeGlobalModifiers,
    isOpen,
    onToggle,
}: {
    activeGlobalModifiers: ReturnType<typeof selectActiveGlobalModifiers>;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const modifierEntries = Object.values(activeGlobalModifiers)
        .flatMap(instance => {
            const definition = GLOBAL_MODIFIERS[instance.modifierId];
            if (!definition) return [];

            return [{
                definition,
                instance,
                effects: resolveGlobalModifierEffects(definition, instance),
            }];
        });

    return (
        <aside className={s.globalEffectsShell} data-open={isOpen}>
            <button
                className={s.globalEffectsToggle}
                type="button"
                aria-expanded={isOpen}
                aria-label={isOpen ? "Hide global effects" : "Show global effects"}
                title={isOpen ? "Hide global effects" : "Show global effects"}
                onClick={onToggle}
            >
                {isOpen ? ">" : "<"}
            </button>
            <div className={s.globalEffectsPanel}>
                <div className={s.selectionHeader}>
                    <h2 className={s.selectionTitle}>Global effects</h2>
                    <span className={s.selectionCoordinates}>{modifierEntries.length}</span>
                </div>

                {modifierEntries.length ? (
                    <div className={s.globalModifierList}>
                        {modifierEntries.map(({definition, instance, effects}) => (
                            <article key={definition.id} className={s.globalModifierCard}>
                                <div className={s.globalModifierHeader}>
                                    <h3 className={s.globalModifierTitle}>{definition.title}</h3>
                                    <span className={s.selectionCoordinates}>x{instance.appliedCount}</span>
                                </div>
                                {definition.description && (
                                    <p className={s.panelDescription}>{definition.description}</p>
                                )}
                                <GlobalEffectList effects={effects} />
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className={s.emptyStats}>No global effects are active.</p>
                )}
            </div>
        </aside>
    );
}

function GlobalEffectList({effects}: {effects: HomogeneousValueEffect[]}) {
    const visibleEffects = effects.flatMap((effect, index) => {
        const additive = effect.additive ?? 0;
        const multiplier = normalizeMultiplier(effect.multiplier);
        if (!additive && multiplier === 1) return [];

        return [{effect, additive, multiplier, key: `${effect.valueId}-${index}`}];
    });

    if (!visibleEffects.length) {
        return <p className={s.emptyStats}>No resolved value changes.</p>;
    }

    return (
        <dl className={s.metricList}>
            {visibleEffects.map(({effect, additive, multiplier, key}) => {
                const definition = getHomogeneousValueDefinition(effect.valueId);

                return (
                    <div key={key} className={s.metricRow}>
                        <dt>{definition.label}</dt>
                        <dd>{formatGlobalEffectAmount(effect, additive, multiplier)}</dd>
                    </div>
                );
            })}
        </dl>
    );
}

function formatGlobalEffectAmount(
    effect: HomogeneousValueEffect,
    additive: number,
    multiplier: number,
): string {
    const parts: string[] = [];

    if (additive) {
        parts.push(formatHomogeneousValue(effect.valueId, additive, effect.additionalKeywords));
    }

    if (multiplier !== 1) {
        parts.push(`x${formatResourceAmount(multiplier)}`);
    }

    return parts.join(" ") || "Active";
}

function SelectedHexPanel({
    selectedHex,
    selectedBuilding,
    selectedResolvedEntity,
    selectedWallBuilding,
    selectedWallTopBuilding,
    structureCandidates,
    builtStructureIds,
    unlockedBuildingIds,
    requirementResolutionData,
    isPartOfCompleteStructure,
    wallResolution,
    blocked,
    blockedReason,
    isLost,
    lostReason,
    onBuildStructure,
    onDemolish,
    onDemolishWallTop,
}: SelectedHexPanelProps) {
    const selectionTitle = getSelectionTitle(selectedHex, selectedBuilding, selectedWallBuilding, selectedWallTopBuilding);
    const selectionCoordinates = `${selectedHex.column}:${selectedHex.row}`;
    const selectedWallTopLabel = selectedWallTopBuilding && isWallTopTower(selectedWallTopBuilding)
        ? "Tower"
        : "Wall Superstructure";
    const canDemolishSelectedBuilding = selectedHex.kind === "city" && selectedBuilding?.vector !== DEVELOPMENT_VECTORS.nature;
    const actionBlocked = blocked || isLost;
    const actionBlockedReason = isLost ? lostReason : blockedReason;

    return (
        <aside className={s.selectionPanel}>
            <div className={s.selectionHeader}>
                <h2 className={s.selectionTitle}>{selectionTitle}</h2>
                <span className={s.selectionCoordinates}>{selectionCoordinates}</span>
            </div>

            {isLost && (
                <p className={s.panelDescription}>{lostReason}</p>
            )}

            {selectedBuilding && (
                <div className={s.statSection}>
                    {!isLost && (
                        <div className={s.sideBySideStats}>
                            <HomogeneousContributionGroup
                                title="Resolved production"
                                effects={getHomogeneousProductionContributions({
                                    values: selectedResolvedEntity?.resolvedContributions
                                        ?? selectedBuilding.effectiveHomogeneousValueEffects,
                                })}
                                baseEffects={getHomogeneousProductionContributions(selectedBuilding)}
                            />
                            <HomogeneousContributionGroup
                                title="Resolved upkeep"
                                effects={getHomogeneousRequirementContributions({
                                    values: selectedResolvedEntity?.resolvedContributions
                                        ?? selectedBuilding.effectiveHomogeneousValueEffects,
                                })}
                                baseEffects={getHomogeneousRequirementContributions(selectedBuilding)}
                            />
                        </div>
                    )}
                    {selectedResolvedEntity && (
                        <ActiveModifierList modifiers={selectedResolvedEntity.activeModifiers} />
                    )}
                    {!isLost && (
                        <MultistructureStatus
                            structureCandidates={structureCandidates}
                            builtStructureIds={builtStructureIds}
                            unlockedBuildingIds={unlockedBuildingIds}
                            requirementResolutionData={requirementResolutionData}
                            onBuildStructure={onBuildStructure}
                            blocked={actionBlocked}
                            blockedReason={actionBlockedReason}
                        />
                    )}
                    <p className={s.panelDescription}>{selectedBuilding.adjacencyDescription}</p>
                    {canDemolishSelectedBuilding && (
                        <button
                            className={s.demolishButton}
                            type="button"
                            disabled={blocked}
                            title={blocked ? blockedReason : undefined}
                            onClick={onDemolish}
                        >
                            {isPartOfCompleteStructure ? "Demolish Structure" : "Demolish"}
                        </button>
                    )}
                </div>
            )}

            {selectedWallBuilding && (
                <div className={s.statSection}>
                    <WallStats wallBuilding={selectedWallBuilding} />
                    <p className={s.panelDescription}>{selectedWallBuilding.description}</p>
                </div>
            )}

            {selectedWallTopBuilding && (
                <div className={s.statSection}>
                    <h3 className={s.statHeading}>On wall: {selectedWallTopBuilding.name}</h3>
                    <WallStats wallBuilding={selectedWallTopBuilding} />
                    <p className={s.panelDescription}>{selectedWallTopBuilding.description}</p>
                    <button
                        className={s.demolishButton}
                        type="button"
                        disabled={blocked}
                        title={blocked ? blockedReason : undefined}
                        onClick={onDemolishWallTop}
                    >
                        Demolish {selectedWallTopLabel}
                    </button>
                </div>
            )}

            {selectedHex.kind === "wall" && (
                <div className={s.statSection}>
                    <h3 className={s.statHeading}>Total wall</h3>
                    <MetricGroup title="Upkeep" values={wallResolution.requiredUpkeep} />
                    <dl className={s.metricList}>
                        <div className={s.metricRow}>
                            <dt>Resilience</dt>
                            <dd>{wallResolution.resilience}</dd>
                        </div>
                        <div className={s.metricRow}>
                            <dt>Camo level</dt>
                            <dd>{wallResolution.camoLevel}</dd>
                        </div>
                        <div className={s.metricRow}>
                            <dt>Ignored threat</dt>
                            <dd>{wallResolution.ignoredThreat}</dd>
                        </div>
                    </dl>
                </div>
            )}

            {!selectedBuilding && !selectedWallBuilding && !selectedWallTopBuilding && !isLost && (
                <p className={s.panelDescription}>Empty tile. Choose something below to build here.</p>
            )}
        </aside>
    );
}

function getSelectionTitle(
    selectedHex: HexCell,
    selectedBuilding?: PlacedBuilding,
    selectedWallBuilding?: WallBuilding,
    selectedWallTopBuilding?: WallBuilding,
): string {
    if (selectedBuilding) return `Building: ${selectedBuilding.name}`;
    if (selectedWallBuilding) return `Wall: ${selectedWallBuilding.name}`;
    if (selectedWallTopBuilding) return `On wall: ${selectedWallTopBuilding.name}`;

    return selectedHex.kind === "wall" ? "Wall hex" : "City hex";
}

function MultistructureStatus({
    structureCandidates,
    builtStructureIds,
    unlockedBuildingIds,
    requirementResolutionData,
    onBuildStructure,
    blocked,
    blockedReason,
}: {
    structureCandidates: StructureDetectionResult[];
    builtStructureIds: ReadonlySet<string>;
    unlockedBuildingIds: ReadonlySet<string>;
    requirementResolutionData: ReturnType<typeof selectRequirementResolutionData>;
    onBuildStructure: (structureId: string, coreCellKey: string) => void;
    blocked: boolean;
    blockedReason: string;
}) {
    if (!structureCandidates.length) {
        return <p className={s.emptyStats}>No multistructure transformation from this tile.</p>;
    }

    return (
        <div className={s.multistructureStatus}>
            <h4 className={s.metricTitle}>Multistructure</h4>
            {structureCandidates.map(candidate => {
                const isAlreadyTransformed =
                    candidate.coreHex.kind === "city" &&
                    candidate.coreHex.partOfStructureId === candidate.structure.id;
                const hasBeenBuiltBefore = builtStructureIds.has(candidate.structure.id);
                const structureBuilding = getStructureBuilding(candidate.structure.id);
                const buildBlockedReason = getStructureBuildBlockedReason(
                    candidate.structure.id,
                    structureBuilding?.buildRequirements,
                    unlockedBuildingIds,
                    requirementResolutionData,
                );
                const transformBlockedReason = blocked ? blockedReason : buildBlockedReason;

                return (
                    <div key={`${candidate.structure.id}-${candidate.coreHex.cellKey}`} className={s.multistructureCandidate}>
                        <div className={s.metricRow}>
                            <span>{candidate.structure.name}</span>
                            {hasBeenBuiltBefore && (
                                <strong>{candidate.isComplete ? (isAlreadyTransformed ? "Built" : "Ready") : "Missing satellites"}</strong>
                            )}
                            {candidate.isComplete && !isAlreadyTransformed && (
                                <button
                                    className={s.demolishButton}
                                    type="button"
                                    disabled={Boolean(transformBlockedReason)}
                                    title={transformBlockedReason}
                                    onClick={() => onBuildStructure(candidate.structure.id, candidate.coreHex.cellKey)}
                                >
                                    Transform
                                </button>
                            )}
                        </div>
                        {hasBeenBuiltBefore ? (
                            <>
                                {candidate.structure.description && (
                                    <p className={s.panelDescription}>{candidate.structure.description}</p>
                                )}
                                {structureBuilding && (
                                    <div className={s.sideBySideStats}>
                                        <HomogeneousContributionGroup
                                            title="Provides"
                                            effects={getHomogeneousProductionContributions(structureBuilding)}
                                        />
                                        <HomogeneousContributionGroup
                                            title="Requires"
                                            effects={getHomogeneousRequirementContributions(structureBuilding)}
                                        />
                                    </div>
                                )}
                                <StructureBuildingList
                                    title="Combined from"
                                    buildingIds={candidate.structure.requiredBuildingIds}
                                />
                            </>
                        ) : (
                            <p className={s.panelDescription}>{candidate.structure.hint}</p>
                        )}
                        {hasBeenBuiltBefore && candidate.missingBuildingIds.length > 0 && (
                            <StructureBuildingList
                                title="Needed adjacent"
                                buildingIds={candidate.missingBuildingIds}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function StructureBuildingList({title, buildingIds}: {title: string; buildingIds: string[]}) {
    return (
        <div>
            <h5 className={s.structureListTitle}>{title}</h5>
            <ul className={s.structureList}>
                {buildingIds.map((buildingId, index) => (
                    <li key={`${buildingId}-${index}`}>{getBuildingName(buildingId)}</li>
                ))}
            </ul>
        </div>
    );
}

function MetricGroup({title, values}: {title: string; values: UpkeepAmount}) {
    const entries = Object.values(UPKEEP_TYPES).flatMap((resource) => {
        const amount = values[resource];
        return amount ? [{resource, amount}] : [];
    });

    return (
        <div>
            <h4 className={s.metricTitle}>{title}</h4>
            {entries.length ? (
                <dl className={s.metricList}>
                    {entries.map(({resource, amount}) => (
                        <div key={resource} className={s.metricRow}>
                            <dt>{UPKEEP_SPRITES[resource]}</dt>
                            <dd>{formatUpkeepResourceAmount(resource, amount)}</dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className={s.emptyStats}>None</p>
            )}
        </div>
    );
}

function ActiveModifierList({modifiers}: {modifiers: readonly HomogeneousActiveModifier[]}) {
    const visibleModifiers = modifiers.filter(modifier => (
        (modifier.rule.additive ?? 0) !== 0
        || normalizeMultiplier(modifier.rule.multiplier) !== 1
        || (modifier.rule.additionalBuildingKeywords?.length ?? 0) > 0
        || (modifier.rule.removedBuildingKeywords?.length ?? 0) > 0
    ));

    return (
        <div>
            <h4 className={s.metricTitle}>Active effects</h4>
            {visibleModifiers.length ? (
                <dl className={s.metricList}>
                    {visibleModifiers.map((modifier, index) => (
                        <div key={index} className={s.metricRow}>
                            <dt>{formatActiveModifierSource(modifier)}{" -> "}{formatModifierTarget(modifier.rule)}</dt>
                            <dd>{formatModifierAmount(modifier.rule)}</dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className={s.emptyStats}>None</p>
            )}
        </div>
    );
}

function HomogeneousContributionGroup({
    title,
    effects,
    baseEffects,
}: {
    title: string;
    effects: HomogeneousValueEffect[];
    baseEffects?: HomogeneousValueEffect[];
}) {
    const baseAmounts = useMemo(() => (
        baseEffects ? buildEffectAmountMap(baseEffects) : undefined
    ), [baseEffects]);
    const entries = effects.flatMap((effect, index) => {
        const amount = (effect.additive ?? 0) * normalizeMultiplier(effect.multiplier);
        if (!amount) return [];

        return [{
            effect,
            amount,
            baseAmount: baseAmounts?.get(getEffectComparisonKey(effect)) ?? 0,
            key: `${effect.valueId}-${index}`,
        }];
    });

    return (
        <div>
            <h4 className={s.metricTitle}>{title}</h4>
            {entries.length ? (
                <dl className={s.metricList}>
                    {entries.map(({effect, amount, baseAmount, key}) => {
                        const definition = getHomogeneousValueDefinition(effect.valueId);
                        const formattedAmount = formatHomogeneousValue(effect.valueId, amount, effect.additionalKeywords);
                        const formattedBaseAmount = formatHomogeneousValue(effect.valueId, baseAmount, effect.additionalKeywords);

                        return (
                            <div key={key} className={s.metricRow}>
                                <dt>{definition.label}</dt>
                                <dd>
                                    {formattedAmount}
                                    {baseAmounts && amount !== baseAmount && ` (${formattedBaseAmount})`}
                                </dd>
                            </div>
                        );
                    })}
                </dl>
            ) : (
                <p className={s.emptyStats}>None</p>
            )}
        </div>
    );
}

function formatModifierTarget(modifier: HomogeneousAdjacencyRule): string {
    const hiddenValueKeywords = new Set(["resource", "support", "output", "spendable", "production", "upkeep", "unlock"]);
    const valueKeywords = modifier.requiredValueKeywords?.filter(keyword => !hiddenValueKeywords.has(keyword)) ?? [];
    const buildingKeywords = modifier.requiredBuildingKeywords ?? [];
    const targets = [...new Set([...buildingKeywords, ...valueKeywords])];

    return targets.length
        ? targets.map(formatKeywordLabel).join(", ")
        : "Matching values";
}

function formatModifierAmount(modifier: HomogeneousAdjacencyRule): string {
    const parts: string[] = [];
    const additive = modifier.additive ?? 0;
    const multiplier = normalizeMultiplier(modifier.multiplier);

    if (additive) {
        parts.push(additive > 0 ? `+${additive}` : String(additive));
    }

    if (multiplier !== 1) {
        parts.push(`x${formatResourceAmount(multiplier)}`);
    }

    if (modifier.additionalBuildingKeywords?.length) {
        parts.push(`adds ${modifier.additionalBuildingKeywords.map(formatKeywordLabel).join(", ")}`);
    }

    if (modifier.removedBuildingKeywords?.length) {
        parts.push(`removes ${modifier.removedBuildingKeywords.map(formatKeywordLabel).join(", ")}`);
    }

    return parts.join(" ") || "Active";
}

function formatKeywordLabel(keyword: string): string {
    return keyword
        .replace(/^resource\./, "")
        .replace(/^city\./, "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_.]+/g, " ")
        .replace(/\b\w/g, character => character.toUpperCase());
}

function buildEffectAmountMap(effects: HomogeneousValueEffect[]): Map<string, number> {
    const amounts = new Map<string, number>();

    for (const effect of effects) {
        const key = getEffectComparisonKey(effect);
        const amount = (effect.additive ?? 0) * normalizeMultiplier(effect.multiplier);
        amounts.set(key, (amounts.get(key) ?? 0) + amount);
    }

    return amounts;
}

function getEffectComparisonKey(effect: HomogeneousValueEffect): string {
    return [
        effect.valueId,
        [...(effect.additionalKeywords ?? [])].sort().join(","),
        [...(effect.removedKeywords ?? [])].sort().join(","),
    ].join("|");
}

function WallStats({wallBuilding}: {wallBuilding: WallBuilding}) {
    const wallValues = {values: wallBuilding.values};

    return (
        <>
            <HomogeneousContributionGroup
                title="Upkeep"
                effects={getHomogeneousRequirementContributions(wallValues)}
            />
            <HomogeneousContributionGroup
                title="Stats"
                effects={getHomogeneousProductionContributions(wallValues)}
            />
        </>
    );
}

function getResolvedRequiredUpkeepForBuild(
    hexes: HexCell[],
    targetHex: HexCell,
    buildingKey: string,
    developmentVector: DevelopmentVectorValue,
): UpkeepAmount {
    const candidateHexes = hexes.map(hex => {
        if (hex.cellKey !== targetHex.cellKey) return hex;

        return {
            ...hex,
            buildingKey,
            developmentVector,
        };
    });

    return placeCityBuildings(candidateHexes).get(targetHex.cellKey)?.effectiveRequiredUpkeep
        ?? getBuildingRequiredUpkeep(BUILDINGS_ATLAS[developmentVector][buildingKey])
        ?? {};
}

function getBuildingRequiredUpkeep(building?: {values?: HomogeneousValueEffect[]}): UpkeepAmount {
    if (!building) return {};

    return homogeneousValueTotalsToUpkeepAmount(
        getUpkeepValues(resolveHomogeneousValueContributions(building.values ?? [])),
    );
}

function formatMissingUpkeep(shortfalls: UpkeepAmount): string {
    return (Object.values(UPKEEP_TYPES) as UpkeepTypesValue[])
        .flatMap(resource => {
            const amount = shortfalls[resource];
            return amount ? [`${UPKEEP_SPRITES[resource]} ${formatUpkeepResourceAmount(resource, amount)}`] : [];
        })
        .join(", ");
}

function formatUpkeepResourceAmount(resource: UpkeepTypesValue, amount: number): string {
    return formatHomogeneousValue(getHomogeneousValueIdForUpkeepType(resource), amount);
}

function formatResourceAmount(amount: number): string {
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function getUnavailableWallBuildingReasons(
    buildings: Record<string, WallBuilding>,
    unlockedBuildingIds: ReadonlySet<string>,
    requirementResolutionData: ReturnType<typeof selectRequirementResolutionData>,
): Record<string, string> {
    const reasons: Record<string, string> = {};

    for (const building of Object.values(buildings)) {
        if (!unlockedBuildingIds.has(building.id)) {
            reasons[building.id] = "Not permanently unlocked yet";
            continue;
        }

        const unmetBuildRequirements = getUnmetRequirements(building.buildRequirements, requirementResolutionData);
        if (unmetBuildRequirements.length) {
            reasons[building.id] = formatUnmetBuildRequirements(unmetBuildRequirements, requirementResolutionData);
        }
    }

    return reasons;
}

function getStructureBuildBlockedReason(
    structureId: string,
    buildRequirements: readonly Requirement[] | undefined,
    unlockedBuildingIds: ReadonlySet<string>,
    requirementResolutionData: ReturnType<typeof selectRequirementResolutionData>,
): string | undefined {
    if (!unlockedBuildingIds.has(structureId)) {
        return "Not permanently unlocked yet";
    }

    const unmetBuildRequirements = getUnmetRequirements(buildRequirements, requirementResolutionData);
    if (unmetBuildRequirements.length) {
        return formatUnmetBuildRequirements(unmetBuildRequirements, requirementResolutionData);
    }

    return undefined;
}

function formatUnmetBuildRequirements(
    requirements: readonly Requirement[],
    requirementResolutionData: ReturnType<typeof selectRequirementResolutionData>,
): string {
    return requirements.map(requirement => formatUnmetBuildRequirement(requirement, requirementResolutionData)).join("; ");
}

function formatUnmetBuildRequirement(
    requirement: Requirement,
    requirementResolutionData: ReturnType<typeof selectRequirementResolutionData>,
): string {
    if (requirement.type === "technologyUnlocked") {
        return `Requires technology ${requirement.technologyId}`;
    }

    if (requirement.type === "buildingExists") {
        return `Requires ${getBuildingName(requirement.buildingId)}`;
    }

    if (requirement.type === "buildingKeywordExists") {
        return `Requires ${requirement.keyword} building`;
    }

    if (requirement.type === "globalFlagExists") {
        return `Requires flag ${requirement.flagId}`;
    }

    if (requirement.type === "globalFlagMissing") {
        return `Requires missing flag ${requirement.flagId}`;
    }

    const definition = getHomogeneousValueDefinition(requirement.valueId);
    const currentValue = requirementResolutionData.resolvedCityData.homogeneousValues[requirement.valueId] ?? 0;
    const amount = formatHomogeneousValue(requirement.valueId, requirement.amount);
    const current = formatHomogeneousValue(requirement.valueId, currentValue);

    if (requirement.type === "homogeneousValueAtLeast") {
        return `Requires ${definition.label} at least ${amount} (current ${current})`;
    }

    return `Requires ${definition.label} below ${amount} (current ${current})`;
}

function getBuildingName(buildingId: string): string {
    for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
        const building = BUILDINGS_ATLAS[vector][buildingId];
        if (building) return building.name;
    }

    return buildingId;
}

function getStoredPlacedBuilding(hex: HexCell): PlacedBuilding | undefined {
    if (hex.kind !== "city" || !hex.buildingKey) return undefined;

    const building = BUILDINGS_ATLAS[hex.developmentVector]?.[hex.buildingKey];
    if (!building) return undefined;

    return {
        ...building,
        column: hex.column,
        row: hex.row,
        effectiveProvidedUpkeep: {},
        effectiveRequiredUpkeep: {},
        effectiveSignature: 0,
        effectiveHomogeneousValueEffects: [...(building.values ?? [])],
    };
}

function getStructureBuilding(structureId: string) {
    for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
        const building = BUILDINGS_ATLAS[vector][structureId];
        if (building) return building;
    }

    return undefined;
}

function isHexPartOfStructureCandidate(cellKey: string, candidate: StructureDetectionResult): boolean {
    return candidate.coreHex.cellKey === cellKey
        || candidate.matchedSatellites.some(match => match.hex.cellKey === cellKey);
}

function isStructureCandidateVisibleOrBuilt(
    candidate: StructureDetectionResult,
    visibleBuildingIds: ReadonlySet<string>,
): boolean {
    return visibleBuildingIds.has(candidate.structure.id)
        || (
            candidate.coreHex.kind === "city"
            && candidate.coreHex.partOfStructureId === candidate.structure.id
        );
}

function WallBuildingSelector({
    onBuildWall,
    onBuildWallTop,
    visibleWallSegmentIds,
    visibleWallSuperstructureIds,
    unavailableWallSegmentReasons,
    unavailableWallSuperstructureReasons,
    currentWallKey,
    hasWallTop,
    blocked,
    blockedReason,
}: {
    onBuildWall: (buildingId: string) => void;
    onBuildWallTop: (buildingId: string) => void;
    visibleWallSegmentIds: ReadonlySet<string>;
    visibleWallSuperstructureIds: ReadonlySet<string>;
    unavailableWallSegmentReasons: Readonly<Record<string, string>>;
    unavailableWallSuperstructureReasons: Readonly<Record<string, string>>;
    currentWallKey: string | null;
    hasWallTop: boolean;
    blocked: boolean;
    blockedReason: string;
}) {
    const [activeWallTopCategory, setActiveWallTopCategory] = useState<WallTopCategory>("tower");
    const visibleWallSegments = Object.values(WALL_SEGMENT_BUILDINGS)
        .filter(building => visibleWallSegmentIds.has(building.id) && building.id !== currentWallKey);
    const visibleWallTopBuildings = Object.values(WALL_SUPERSTRUCTURE_BUILDINGS)
        .filter(building => visibleWallSuperstructureIds.has(building.id));
    const visibleTowers = visibleWallTopBuildings.filter(isWallTopTower);
    const visibleWallSuperstructures = visibleWallTopBuildings.filter(building => !isWallTopTower(building));
    const wallTopCategories = [
        {category: "tower" as const, label: "Tower", buildings: visibleTowers},
        {category: "wallSuperstructure" as const, label: "Wall Superstructure", buildings: visibleWallSuperstructures},
    ].filter(option => option.buildings.length > 0);
    const activeCategoryIsAvailable = wallTopCategories.some(option => option.category === activeWallTopCategory);
    const selectedWallTopCategory = (
        activeCategoryIsAvailable
            ? wallTopCategories.find(option => option.category === activeWallTopCategory)
            : wallTopCategories[0]
    );

    useEffect(() => {
        if (selectedWallTopCategory && selectedWallTopCategory.category !== activeWallTopCategory) {
            setActiveWallTopCategory(selectedWallTopCategory.category);
        }
    }, [activeWallTopCategory, selectedWallTopCategory]);

    return (
        <div className={s.wallSelector}>
            <WallBuildingList title="Wall" buildings={visibleWallSegments} unavailableBuildingReasons={unavailableWallSegmentReasons} onBuild={onBuildWall} blocked={blocked} blockedReason={blockedReason} />
            {hasWallTop ? (
                <p className={s.buildingLockedNote}>
                    Demolish the existing tower or wall superstructure before building another wall-top detail here.
                </p>
            ) : (
                <section className={s.wallCategory}>
                    {wallTopCategories.length > 0 && (
                        <div className={s.wallTopTabs} role="tablist" aria-label="Wall-top build type">
                            {wallTopCategories.map(({category, label, buildings}) => {
                                const selected = selectedWallTopCategory?.category === category;

                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        className={s.wallTopTabButton[selected ? "active" : "regular"]}
                                        onClick={() => setActiveWallTopCategory(category)}
                                    >
                                        <span className={s.wallTopTabLabel}>{label}</span>
                                        <span className={s.wallTopTabCount}>{buildings.length}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {selectedWallTopCategory ? (
                        <WallBuildingList
                            title={selectedWallTopCategory.label}
                            buildings={selectedWallTopCategory.buildings}
                            unavailableBuildingReasons={unavailableWallSuperstructureReasons}
                            onBuild={onBuildWallTop}
                            blocked={blocked}
                            blockedReason={blockedReason}
                        />
                    ) : (
                        <p className={s.buildingLockedNote}>No wall-top details are available yet.</p>
                    )}
                </section>
            )}
        </div>
    );
}

function formatActiveModifierSource(modifier: HomogeneousActiveModifier): string {
    return modifier.sourceName
        ?? modifier.sourceContentId?.split(".").at(-1)?.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ")
        ?? modifier.sourceEntityId;
}

type WallTopCategory = "tower" | "wallSuperstructure";

function WallBuildingList({
    title,
    buildings,
    unavailableBuildingReasons,
    onBuild,
    blocked,
    blockedReason,
}: {
    title: string;
    buildings: WallBuilding[];
    unavailableBuildingReasons: Readonly<Record<string, string>>;
    onBuild: (buildingId: string) => void;
    blocked: boolean;
    blockedReason: string;
}) {
    return (
        <section className={s.wallCategory}>
            <h3 className={s.wallCategoryTitle}>{title}</h3>
            <div className={s.wallCardList}>
                {buildings.length === 0 && (
                    <p className={s.buildingLockedNote}>No other options are available yet.</p>
                )}
                {buildings.map((building) => {
                    const unavailableReason = unavailableBuildingReasons[building.id];
                    const buildBlockedReason = blocked ? blockedReason : unavailableReason;
                    const buildBlocked = blocked || Boolean(unavailableReason);

                    return (
                        <article key={building.id} className={s.wallCard}>
                            <div>
                                <h4 className={s.wallCardTitle}>{building.name}</h4>
                                <WallStats wallBuilding={building} />
                            </div>
                            <button
                                className={s.wallBuildButton}
                                type="button"
                                disabled={buildBlocked}
                                title={buildBlockedReason}
                                onClick={() => onBuild(building.id)}
                            >
                                Build
                            </button>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default CityPage;

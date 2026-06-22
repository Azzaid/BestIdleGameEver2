import { useEffect, useMemo, useState } from 'react';
import * as s from './CityPage.css.ts';
import CityHex from "./Components/CityHex/CityHex.tsx";
import type {HexCell} from "../../models/city/HexGrid.ts";
import {BuildingSelector} from "./Components/BuildingSelector/BuildingSelector.tsx";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {
    selectBuiltStructureIds,
    selectCityBuildings,
    selectCityHexes,
    selectCityStructureCandidates,
} from "../../store/city/selectors.ts";
import {buildHex, buildWall, buildWallTop, demolishHex, buildMultistructure} from "../../store/city/slice.ts";
import {UPKEEP_SPRITES, UPKEEP_TYPES, type UpkeepAmount, type UpkeepTypesValue} from "../../models/Upkeep.ts";
import {ALL_WALL_BUILDINGS, WALL_TOWER_BUILDINGS, WALL_SEGMENT_BUILDINGS} from "../../data/wall/index.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import {selectWallResolution} from "../../store/wall/selectors.ts";
import type {SelectedHexPanelProps} from "../../models/city/cityPage.ts";
import {selectCityResolution, selectCitySignatureStatus} from "../../store/upkeep/selectors.ts";
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
import {getHomogeneousValueDefinition} from "../../data/homogeneousValues/index.ts";
import type {HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import {getUpkeepValues, normalizeMultiplier, resolveHomogeneousValueContributions} from "../../models/homogeneousValueResolution.ts";
import {homogeneousValueTotalsToUpkeepAmount} from "../../models/homogeneousValueAdapters.ts";
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

const BESIEGED_BUILD_BLOCK_REASON = "The city is besieged. Raise controlled territory in battle before building.";

const CityPage = () => {
    const dispatch = useTypedDispatch();
    const hexes = useTypedSelector(selectCityHexes);
    const cityBuildings = useTypedSelector(selectCityBuildings);
    const builtStructureIds = useTypedSelector(selectBuiltStructureIds);
    const structureCandidates = useTypedSelector(selectCityStructureCandidates);
    const wallResolution = useTypedSelector(selectWallResolution);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const {effectiveUpkeep} = useTypedSelector(selectCityResolution);
    const unlockedBuildingIds = useTypedSelector(selectUnlockedBuildingIds);
    const visibleBuildingIds = useTypedSelector(selectVisibleBuildingIds);
    const unlockedWallSegmentIds = useTypedSelector(selectUnlockedWallSegmentIds);
    const visibleWallSegmentIds = useTypedSelector(selectVisibleWallSegmentIds);
    const unlockedWallSuperstructureIds = useTypedSelector(selectUnlockedWallSuperstructureIds);
    const visibleWallSuperstructureIds = useTypedSelector(selectVisibleWallSuperstructureIds);
    const requirementResolutionData = useTypedSelector(selectRequirementResolutionData);
    const [selectedHex, setSelectedHex] = useState<HexCell | null>(null);
    const selectHex = (hex: HexCell) => {
        const selectedCoreHex = hex.partOfStructureId
            ? hexes.find(candidate => candidate.cellKey === (hex.structureCoreCellKey ?? hex.cellKey)) ?? hex
            : hex;

        setSelectedHex(selectedCoreHex);
    };

    useEffect(() => {
        if (!selectedHex) return;

        const currentHex = hexes.find(hex => hex.cellKey === selectedHex.cellKey);
        if (!currentHex) {
            setSelectedHex(null);
            return;
        }

        const currentCoreHex = currentHex.partOfStructureId
            ? hexes.find(hex => hex.cellKey === (currentHex.structureCoreCellKey ?? currentHex.cellKey)) ?? currentHex
            : currentHex;

        setSelectedHex(currentCoreHex);
    }, [hexes, selectedHex]);
    const unlockedBuildingIdSet = useMemo(() => new Set(unlockedBuildingIds), [unlockedBuildingIds]);
    const visibleBuildingIdSet = useMemo(() => new Set(visibleBuildingIds), [visibleBuildingIds]);
    const unlockedWallSegmentIdSet = useMemo(() => new Set(unlockedWallSegmentIds), [unlockedWallSegmentIds]);
    const visibleWallSegmentIdSet = useMemo(() => new Set(visibleWallSegmentIds), [visibleWallSegmentIds]);
    const unlockedWallSuperstructureIdSet = useMemo(() => new Set(unlockedWallSuperstructureIds), [unlockedWallSuperstructureIds]);
    const visibleWallSuperstructureIdSet = useMemo(() => new Set(visibleWallSuperstructureIds), [visibleWallSuperstructureIds]);
    const builtStructureIdSet = useMemo(() => new Set(builtStructureIds), [builtStructureIds]);
    const unavailableBuildingReasons = useMemo(() => {
        if (!selectedHex || selectedHex.kind !== "city" || selectedHex.buildingKey || selectedHex.partOfStructureId) {
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
        () => getUnavailableWallBuildingReasons(WALL_TOWER_BUILDINGS, unlockedWallSuperstructureIdSet, requirementResolutionData),
        [requirementResolutionData, unlockedWallSuperstructureIdSet],
    );

    const handleBuildingSelect = (buildingKey: string, developmentVector: DevelopmentVectorValue) => {
        if (!selectedHex || signatureStatus.isBesieged) return;
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
        if (!selectedHex || signatureStatus.isBesieged) return;
        if (!unlockedWallSegmentIdSet.has(buildingKey)) return;
        if (!areRequirementsMet(WALL_SEGMENT_BUILDINGS[buildingKey]?.buildRequirements, requirementResolutionData)) return;
        dispatch(buildWall({cellKey: selectedHex.cellKey, wallKey: buildingKey}))
    };

    const handleWallTopBuildingSelect = (buildingKey: string) => {
        if (!selectedHex || signatureStatus.isBesieged) return;
        if (!unlockedWallSuperstructureIdSet.has(buildingKey)) return;
        if (!areRequirementsMet(WALL_TOWER_BUILDINGS[buildingKey]?.buildRequirements, requirementResolutionData)) return;
        dispatch(buildWallTop({cellKey: selectedHex.cellKey, wallTopKey: buildingKey}))
    };

    const handleDemolishSelectedHex = () => {
        if (!selectedHex || signatureStatus.isBesieged) return;
        dispatch(demolishHex({cellKey: selectedHex.cellKey}));
        setSelectedHex(null);
    };

    const handleBuildStructure = (structureId: string, coreCellKey: string) => {
        if (!selectedHex || signatureStatus.isBesieged) return;
        if (!unlockedBuildingIdSet.has(structureId)) return;
        dispatch(buildMultistructure({ coreCellKey, structureId }));
    };

    const selectedBuilding = selectedHex ? cityBuildings.get(selectedHex.cellKey) : undefined;
    const selectedWallBuilding = selectedHex?.wallKey ? ALL_WALL_BUILDINGS[selectedHex.wallKey] : undefined;
    const selectedWallTopBuilding = selectedHex?.wallTopKey ? ALL_WALL_BUILDINGS[selectedHex.wallTopKey] : undefined;
    const selectedStructureCandidates = selectedHex
        ? structureCandidates.filter(candidate => (
            isHexPartOfStructureCandidate(selectedHex.cellKey, candidate)
            && isStructureCandidateUnlockedOrBuilt(candidate, unlockedBuildingIdSet)
        ))
        : [];
    const selectedHexIsPartOfCompleteStructure = selectedHex
        ? Boolean(selectedHex.partOfStructureId)
        : false;

    return (
        <div className={s.cityPage}>
            <div className={s.cityContainer}>
                <CityHex cells={hexes} onSelect={selectHex}/>
            </div>
            {selectedHex &&
                <div className={s.buildingSelectorContainer}>
                    <SelectedHexPanel
                        selectedHex={selectedHex}
                        selectedBuilding={selectedBuilding}
                        selectedWallBuilding={selectedWallBuilding}
                        selectedWallTopBuilding={selectedWallTopBuilding}
                        structureCandidates={selectedStructureCandidates}
                        builtStructureIds={builtStructureIdSet}
                        isPartOfCompleteStructure={selectedHexIsPartOfCompleteStructure}
                        wallResolution={wallResolution}
                        blocked={signatureStatus.isBesieged}
                        blockedReason={BESIEGED_BUILD_BLOCK_REASON}
                        onBuildStructure={handleBuildStructure}
                        onDemolish={handleDemolishSelectedHex}
                    />
                    {selectedHex.kind === "wall"
                        ? <WallBuildingSelector
                            onBuildWall={handleWallBuildingSelect}
                            onBuildWallTop={handleWallTopBuildingSelect}
                            visibleWallSegmentIds={visibleWallSegmentIdSet}
                            visibleWallSuperstructureIds={visibleWallSuperstructureIdSet}
                            unavailableWallSegmentReasons={unavailableWallSegmentReasons}
                            unavailableWallSuperstructureReasons={unavailableWallSuperstructureReasons}
                            blocked={signatureStatus.isBesieged}
                            blockedReason={BESIEGED_BUILD_BLOCK_REASON}
                        />
                        : selectedHex.buildingKey || selectedHex.partOfStructureId
                            ? <p className={s.buildingLockedNote}>
                                Demolish the existing building before using this hex again.
                            </p>
                            : <BuildingSelector
                            onBuild={handleBuildingSelect}
                            unlockedBuildingIds={visibleBuildingIdSet}
                            unavailableBuildingReasons={unavailableBuildingReasons}
                            blocked={signatureStatus.isBesieged}
                            blockedReason={BESIEGED_BUILD_BLOCK_REASON}
                        />
                    }
                </div>
            }
        </div>
    );
};

function SelectedHexPanel({
    selectedHex,
    selectedBuilding,
    selectedWallBuilding,
    selectedWallTopBuilding,
    structureCandidates,
    builtStructureIds,
    isPartOfCompleteStructure,
    wallResolution,
    blocked,
    blockedReason,
    onBuildStructure,
    onDemolish,
}: SelectedHexPanelProps) {
    const selectionTitle = getSelectionTitle(selectedHex, selectedBuilding, selectedWallBuilding, selectedWallTopBuilding);
    const selectionCoordinates = `${selectedHex.column}:${selectedHex.row}`;

    return (
        <aside className={s.selectionPanel}>
            <div className={s.selectionHeader}>
                <h2 className={s.selectionTitle}>{selectionTitle}</h2>
                <span className={s.selectionCoordinates}>{selectionCoordinates}</span>
            </div>

            {selectedBuilding && (
                <div className={s.statSection}>
                    <div className={s.sideBySideStats}>
                        <HomogeneousContributionGroup
                            title="Resolved production"
                            effects={getHomogeneousProductionContributions({
                                values: selectedBuilding.effectiveHomogeneousValueEffects,
                            })}
                            baseEffects={getHomogeneousProductionContributions(selectedBuilding)}
                        />
                        <HomogeneousContributionGroup
                            title="Resolved upkeep"
                            effects={getHomogeneousRequirementContributions({
                                values: selectedBuilding.effectiveHomogeneousValueEffects,
                            })}
                            baseEffects={getHomogeneousRequirementContributions(selectedBuilding)}
                        />
                    </div>
                    <MultistructureStatus
                        structureCandidates={structureCandidates}
                        builtStructureIds={builtStructureIds}
                        onBuildStructure={onBuildStructure}
                        blocked={blocked}
                        blockedReason={blockedReason}
                    />
                    <p className={s.panelDescription}>{selectedBuilding.adjacencyDescription}</p>
                    {selectedHex.kind === "city" && (
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

            {!selectedBuilding && !selectedWallBuilding && !selectedWallTopBuilding && (
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
    onBuildStructure,
    blocked,
    blockedReason,
}: {
    structureCandidates: StructureDetectionResult[];
    builtStructureIds: ReadonlySet<string>;
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
                                    disabled={blocked}
                                    title={blocked ? blockedReason : undefined}
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
                            <dd>{amount}</dd>
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
            {wallBuilding.specialEffects.length > 0 && (
                <ul className={s.effectList}>
                    {wallBuilding.specialEffects.map((effect) => (
                        <li key={`${effect.keyword}-${effect.value}`}>
                            <strong>{effect.keyword}</strong> {effect.value}: {effect.description}
                        </li>
                    ))}
                </ul>
            )}
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
            return amount ? [`${UPKEEP_SPRITES[resource]} ${formatResourceAmount(amount)}`] : [];
        })
        .join(", ");
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

    const definition = getHomogeneousValueDefinition(requirement.valueId);
    const currentValue = requirementResolutionData.resolvedCityData.homogeneousValues[requirement.valueId] ?? 0;
    const amount = formatResourceAmount(requirement.amount);
    const current = formatResourceAmount(currentValue);

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

function isStructureCandidateUnlockedOrBuilt(
    candidate: StructureDetectionResult,
    unlockedBuildingIds: ReadonlySet<string>,
): boolean {
    return unlockedBuildingIds.has(candidate.structure.id)
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
    blocked,
    blockedReason,
}: {
    onBuildWall: (buildingId: string) => void;
    onBuildWallTop: (buildingId: string) => void;
    visibleWallSegmentIds: ReadonlySet<string>;
    visibleWallSuperstructureIds: ReadonlySet<string>;
    unavailableWallSegmentReasons: Readonly<Record<string, string>>;
    unavailableWallSuperstructureReasons: Readonly<Record<string, string>>;
    blocked: boolean;
    blockedReason: string;
}) {
    const visibleWallSegments = Object.values(WALL_SEGMENT_BUILDINGS)
        .filter(building => visibleWallSegmentIds.has(building.id));
    const visibleWallSuperstructures = Object.values(WALL_TOWER_BUILDINGS)
        .filter(building => visibleWallSuperstructureIds.has(building.id));

    return (
        <div className={s.wallSelector}>
            <WallBuildingList title="Wall" buildings={visibleWallSegments} unavailableBuildingReasons={unavailableWallSegmentReasons} onBuild={onBuildWall} blocked={blocked} blockedReason={blockedReason} />
            <WallBuildingList title="Tower" buildings={visibleWallSuperstructures} unavailableBuildingReasons={unavailableWallSuperstructureReasons} onBuild={onBuildWallTop} blocked={blocked} blockedReason={blockedReason} />
        </div>
    );
}

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

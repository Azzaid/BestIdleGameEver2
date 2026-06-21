import { useEffect, useMemo, useState } from 'react';
import * as s from './CityPage.css.ts';
import CityHex from "./Components/CityHex/CityHex.tsx";
import type {HexCell} from "../../models/city/HexGrid.ts";
import {BuildingSelector} from "./Components/BuildingSelector/BuildingSelector.tsx";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {
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
    selectUnlockedBuildingIds,
    selectUnlockedWallSegmentIds,
    selectUnlockedWallSuperstructureIds,
    selectVisibleBuildingIds,
    selectVisibleWallSegmentIds,
    selectVisibleWallSuperstructureIds,
} from "../../store/unlocks/selectors.ts";

const BESIEGED_BUILD_BLOCK_REASON = "The city is besieged. Raise controlled territory in battle before building.";

const CityPage = () => {
    const dispatch = useTypedDispatch();
    const hexes = useTypedSelector(selectCityHexes);
    const cityBuildings = useTypedSelector(selectCityBuildings);
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

                const requiredUpkeep = getResolvedRequiredUpkeepForBuild(hexes, selectedHex, building.id, vector);
                const shortfalls = getUpkeepShortfalls(requiredUpkeep, effectiveUpkeep);
                const missingResources = formatMissingUpkeep(shortfalls);

                if (missingResources) {
                    reasons[building.id] = `Missing ${missingResources}`;
                }
            }
        }

        return reasons;
    }, [effectiveUpkeep, hexes, selectedHex, unlockedBuildingIdSet, visibleBuildingIdSet]);

    const handleBuildingSelect = (buildingKey: string, developmentVector: DevelopmentVectorValue) => {
        if (!selectedHex || signatureStatus.isBesieged) return;
        if (selectedHex.kind !== "city" || selectedHex.buildingKey || selectedHex.partOfStructureId) return;
        if (!unlockedBuildingIdSet.has(buildingKey)) return;

        const requiredUpkeep = getResolvedRequiredUpkeepForBuild(hexes, selectedHex, buildingKey, developmentVector);
        if (!hasEnoughUpkeep(requiredUpkeep, effectiveUpkeep)) return;

        const builtHex = {...selectedHex, buildingKey, developmentVector};
        dispatch(buildHex(builtHex));
        setSelectedHex(builtHex);
    };

    const handleWallBuildingSelect = (buildingKey: string) => {
        if (!selectedHex || signatureStatus.isBesieged) return;
        if (!unlockedWallSegmentIdSet.has(buildingKey)) return;
        dispatch(buildWall({cellKey: selectedHex.cellKey, wallKey: buildingKey}))
    };

    const handleWallTopBuildingSelect = (buildingKey: string) => {
        if (!selectedHex || signatureStatus.isBesieged) return;
        if (!unlockedWallSuperstructureIdSet.has(buildingKey)) return;
        dispatch(buildWallTop({cellKey: selectedHex.cellKey, wallTopKey: buildingKey}))
    };

    const handleDemolishSelectedHex = () => {
        if (!selectedHex || signatureStatus.isBesieged) return;
        dispatch(demolishHex({cellKey: selectedHex.cellKey}));
        setSelectedHex(null);
    };

    const handleBuildStructure = (structureId: string, coreCellKey: string) => {
        if (!selectedHex || signatureStatus.isBesieged) return;
        dispatch(buildMultistructure({ coreCellKey, structureId }));
    };

    const selectedBuilding = selectedHex ? cityBuildings.get(selectedHex.cellKey) : undefined;
    const selectedWallBuilding = selectedHex?.wallKey ? ALL_WALL_BUILDINGS[selectedHex.wallKey] : undefined;
    const selectedWallTopBuilding = selectedHex?.wallTopKey ? ALL_WALL_BUILDINGS[selectedHex.wallTopKey] : undefined;
    const selectedStructureCandidates = selectedHex
        ? structureCandidates.filter(candidate => isHexPartOfStructureCandidate(selectedHex.cellKey, candidate))
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
                            unlockedWallSegmentIds={unlockedWallSegmentIdSet}
                            unlockedWallSuperstructureIds={unlockedWallSuperstructureIdSet}
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
                                homogeneousValueEffects: selectedBuilding.effectiveHomogeneousValueEffects,
                            })}
                        />
                        <HomogeneousContributionGroup
                            title="Resolved upkeep"
                            effects={getHomogeneousRequirementContributions({
                                homogeneousValueEffects: selectedBuilding.effectiveHomogeneousValueEffects,
                            })}
                        />
                    </div>
                    <AdjacencyEffectSummary building={selectedBuilding} />
                    <MultistructureStatus
                        structureCandidates={structureCandidates}
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
    onBuildStructure,
    blocked,
    blockedReason,
}: {
    structureCandidates: StructureDetectionResult[];
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

                return (
                    <div key={`${candidate.structure.id}-${candidate.coreHex.cellKey}`} className={s.multistructureCandidate}>
                        <div className={s.metricRow}>
                            <span>{candidate.structure.name}</span>
                            <strong>{candidate.isComplete ? (isAlreadyTransformed ? "Built" : "Ready") : "Missing satellites"}</strong>
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
                        {candidate.structure.description && (
                            <p className={s.panelDescription}>{candidate.structure.description}</p>
                        )}
                        {candidate.matchedSatellites.length > 0 && (
                            <StructureBuildingList
                                title="Connected"
                                buildingIds={candidate.matchedSatellites.map(match => match.buildingId)}
                            />
                        )}
                        {candidate.missingBuildingIds.length > 0 && (
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

function HomogeneousContributionGroup({title, effects}: {title: string; effects: HomogeneousValueEffect[]}) {
    const entries = effects.flatMap((effect, index) => {
        const amount = (effect.additive ?? 0) * normalizeMultiplier(effect.multiplier);
        if (!amount) return [];

        return [{effect, amount, key: `${effect.valueId}-${index}`}];
    });

    return (
        <div>
            <h4 className={s.metricTitle}>{title}</h4>
            {entries.length ? (
                <dl className={s.metricList}>
                    {entries.map(({effect, amount, key}) => {
                        const definition = getHomogeneousValueDefinition(effect.valueId);

                        return (
                            <div key={key} className={s.metricRow}>
                                <dt>{definition.label}</dt>
                                <dd>{formatHomogeneousValue(effect.valueId, amount, effect.additionalKeywords)}</dd>
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

function WallStats({wallBuilding}: {wallBuilding: WallBuilding}) {
    const cityEffects = {homogeneousValueEffects: wallBuilding.cityHomogeneousValueEffects};
    const mountedGunEffects = {homogeneousValueEffects: wallBuilding.mountedGunHomogeneousValueEffects};

    return (
        <>
            <HomogeneousContributionGroup
                title="Upkeep"
                effects={getHomogeneousRequirementContributions(cityEffects)}
            />
            <HomogeneousContributionGroup
                title="Stats"
                effects={getHomogeneousProductionContributions(cityEffects)}
            />
            {wallBuilding.mountedGunHomogeneousValueEffects?.length ? (
                <HomogeneousContributionGroup
                    title="Mounted gun"
                    effects={getHomogeneousProductionContributions(mountedGunEffects)}
                />
            ) : null}
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

function AdjacencyEffectSummary({building}: {building: PlacedBuilding}) {
    const hasRequiredAdd = hasUpkeepValues(building.requiredUpkeepAdd);
    const hasProvidedAdd = hasUpkeepValues(building.providedUpkeepAdd);
    const hasRequiredMul = hasUpkeepValues(building.requiredUpkeepMul);
    const hasProvidedMul = hasUpkeepValues(building.providedUpkeepMul);
    const hasSignatureEffect = Boolean(building.signatureAdd) || (building.signatureMul ?? 1) !== 1;
    const hasAnyEffect = hasRequiredAdd || hasProvidedAdd || hasRequiredMul || hasProvidedMul || hasSignatureEffect;

    if (!hasAnyEffect) {
        return <p className={s.emptyStats}>No adjacent modifiers applied.</p>;
    }

    return (
        <div>
            <h4 className={s.metricTitle}>Adjacent modifiers</h4>
            {hasRequiredAdd && <MetricGroup title="Cost added" values={building.requiredUpkeepAdd ?? {}} />}
            {hasProvidedAdd && <MetricGroup title="Output added" values={building.providedUpkeepAdd ?? {}} />}
            {hasRequiredMul && <MetricGroup title="Cost multiplier" values={building.requiredUpkeepMul ?? {}} />}
            {hasProvidedMul && <MetricGroup title="Output multiplier" values={building.providedUpkeepMul ?? {}} />}
            {hasSignatureEffect && (
                <dl className={s.metricList}>
                    <div className={s.metricRow}>
                        <dt>Signature add</dt>
                        <dd>{building.signatureAdd ?? 0}</dd>
                    </div>
                    <div className={s.metricRow}>
                        <dt>Signature multiplier</dt>
                        <dd>{building.signatureMul ?? 1}</dd>
                    </div>
                </dl>
            )}
        </div>
    );
}

function hasUpkeepValues(values?: UpkeepAmount) {
    return Boolean(values && Object.values(values).some((value) => value !== undefined && value !== 0));
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

function getBuildingRequiredUpkeep(building?: {homogeneousValueEffects?: HomogeneousValueEffect[]}): UpkeepAmount {
    if (!building) return {};

    return homogeneousValueTotalsToUpkeepAmount(
        getUpkeepValues(resolveHomogeneousValueContributions(building.homogeneousValueEffects ?? [])),
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

function getBuildingName(buildingId: string): string {
    for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
        const building = BUILDINGS_ATLAS[vector][buildingId];
        if (building) return building.name;
    }

    return buildingId;
}

function isHexPartOfStructureCandidate(cellKey: string, candidate: StructureDetectionResult): boolean {
    return candidate.coreHex.cellKey === cellKey
        || candidate.matchedSatellites.some(match => match.hex.cellKey === cellKey);
}

function WallBuildingSelector({
    onBuildWall,
    onBuildWallTop,
    visibleWallSegmentIds,
    visibleWallSuperstructureIds,
    unlockedWallSegmentIds,
    unlockedWallSuperstructureIds,
    blocked,
    blockedReason,
}: {
    onBuildWall: (buildingId: string) => void;
    onBuildWallTop: (buildingId: string) => void;
    visibleWallSegmentIds: ReadonlySet<string>;
    visibleWallSuperstructureIds: ReadonlySet<string>;
    unlockedWallSegmentIds: ReadonlySet<string>;
    unlockedWallSuperstructureIds: ReadonlySet<string>;
    blocked: boolean;
    blockedReason: string;
}) {
    const visibleWallSegments = Object.values(WALL_SEGMENT_BUILDINGS)
        .filter(building => visibleWallSegmentIds.has(building.id));
    const visibleWallSuperstructures = Object.values(WALL_TOWER_BUILDINGS)
        .filter(building => visibleWallSuperstructureIds.has(building.id));

    return (
        <div className={s.wallSelector}>
            <WallBuildingList title="Wall" buildings={visibleWallSegments} unlockedBuildingIds={unlockedWallSegmentIds} onBuild={onBuildWall} blocked={blocked} blockedReason={blockedReason} />
            <WallBuildingList title="Tower" buildings={visibleWallSuperstructures} unlockedBuildingIds={unlockedWallSuperstructureIds} onBuild={onBuildWallTop} blocked={blocked} blockedReason={blockedReason} />
        </div>
    );
}

function WallBuildingList({
    title,
    buildings,
    unlockedBuildingIds,
    onBuild,
    blocked,
    blockedReason,
}: {
    title: string;
    buildings: WallBuilding[];
    unlockedBuildingIds: ReadonlySet<string>;
    onBuild: (buildingId: string) => void;
    blocked: boolean;
    blockedReason: string;
}) {
    return (
        <section className={s.wallCategory}>
            <h3 className={s.wallCategoryTitle}>{title}</h3>
            <div className={s.wallCardList}>
                {buildings.map((building) => {
                    const unlocked = unlockedBuildingIds.has(building.id);

                    return (
                        <article key={building.id} className={s.wallCard}>
                            <div>
                                <h4 className={s.wallCardTitle}>{building.name}</h4>
                                <WallStats wallBuilding={building} />
                            </div>
                            <button
                                className={s.wallBuildButton}
                                type="button"
                                disabled={blocked || !unlocked}
                                title={blocked ? blockedReason : !unlocked ? "Not permanently unlocked yet" : undefined}
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

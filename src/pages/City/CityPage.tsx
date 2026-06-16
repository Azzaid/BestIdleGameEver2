import { useMemo, useState } from 'react';
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
    selectCompleteCityStructureIds,
} from "../../store/city/selectors.ts";
import {buildHex, buildWall, buildWallTop, demolishHex} from "../../store/city/slice.ts";
import {UPKEEP_TYPES, type UpkeepAmount} from "../../models/Upkeep.ts";
import {ALL_WALL_BUILDINGS, TOWER_PLATFORM_BUILDINGS, WALL_SEGMENT_BUILDINGS} from "../../data/wall/index.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import {selectWallResolution} from "../../store/wall/selectors.ts";
import type {SelectedHexPanelProps} from "../../models/city/cityPage.ts";
import {selectCityResolution, selectCityTraceStatus} from "../../store/upkeep/selectors.ts";
import type {PlacedBuilding} from "../../models/city/Building.ts";
import type {StructureDetectionResult} from "../../models/city/multistructureDetection.ts";
import {BUILDINGS_ATLAS} from "../../data/buildings";
import {selectPurchasedTechsIds} from "../../store/research/selectors.ts";
import {PROGRESSION_RULES} from "../../data/content/rules.ts";
import {getRuleForTarget, isProgressionRuleUnlocked} from "../../data/content/progression.ts";

const BESIEGED_BUILD_BLOCK_REASON = "The city is besieged. Raise resilience in battle before building.";

const CityPage = () => {
    const dispatch = useTypedDispatch();
    const hexes = useTypedSelector(selectCityHexes);
    const cityBuildings = useTypedSelector(selectCityBuildings);
    const structureCandidates = useTypedSelector(selectCityStructureCandidates);
    const completeStructureIds = useTypedSelector(selectCompleteCityStructureIds);
    const wallResolution = useTypedSelector(selectWallResolution);
    const traceStatus = useTypedSelector(selectCityTraceStatus);
    const {effectiveUpkeep} = useTypedSelector(selectCityResolution);
    const purchasedTechsIds = useTypedSelector(selectPurchasedTechsIds);
    const [selectedHex, setSelectedHex] = useState<HexCell | null>(null);
    const builtBuildingIds = useMemo(() => {
        return new Set(hexes.flatMap(hex => [
            hex.buildingKey,
            hex.wallKey,
            hex.wallTopKey,
        ].filter((buildingId): buildingId is string => Boolean(buildingId))));
    }, [hexes]);
    const unlockedBuildingIds = useMemo(() => {
        const context = {
            researchIds: new Set(purchasedTechsIds),
            buildingIds: builtBuildingIds,
            structureIds: completeStructureIds,
            freeUpkeep: effectiveUpkeep,
        };

        return new Set(Object.values(DEVELOPMENT_VECTORS).flatMap(vector => {
            return Object.values(BUILDINGS_ATLAS[vector])
                .filter(building => !building.isMultistructure)
                .filter(building => isProgressionRuleUnlocked(
                    getRuleForTarget(PROGRESSION_RULES, "building", building.id),
                    context,
                ))
                .map(building => building.id);
        }));
    }, [builtBuildingIds, completeStructureIds, effectiveUpkeep, purchasedTechsIds]);

    const handleBuildingSelect = (buildingKey: string, developmentVector: DevelopmentVectorValue) => {
        if (!selectedHex || traceStatus.isBesieged) return;
        if (selectedHex.kind !== "city" || selectedHex.buildingKey) return;
        if (!unlockedBuildingIds.has(buildingKey)) return;

        const builtHex = {...selectedHex, buildingKey, developmentVector};
        dispatch(buildHex(builtHex));
        setSelectedHex(builtHex);
    };

    const handleWallBuildingSelect = (buildingKey: string) => {
        if (!selectedHex || traceStatus.isBesieged) return;
        dispatch(buildWall({cellKey: selectedHex.cellKey, wallKey: buildingKey}))
    };

    const handleWallTopBuildingSelect = (buildingKey: string) => {
        if (!selectedHex || traceStatus.isBesieged) return;
        dispatch(buildWallTop({cellKey: selectedHex.cellKey, wallTopKey: buildingKey}))
    };

    const handleDemolishSelectedHex = () => {
        if (!selectedHex || traceStatus.isBesieged) return;
        dispatch(demolishHex({cellKey: selectedHex.cellKey}));
        setSelectedHex(null);
    };

    const selectedBuilding = selectedHex ? cityBuildings.get(selectedHex.cellKey) : undefined;
    const selectedWallBuilding = selectedHex?.wallKey ? ALL_WALL_BUILDINGS[selectedHex.wallKey] : undefined;
    const selectedWallTopBuilding = selectedHex?.wallTopKey ? ALL_WALL_BUILDINGS[selectedHex.wallTopKey] : undefined;
    const selectedStructureCandidates = selectedHex
        ? structureCandidates.filter(candidate => candidate.coreHex.cellKey === selectedHex.cellKey)
        : [];
    const selectedHexIsPartOfCompleteStructure = selectedHex
        ? structureCandidates.some(candidate => {
            if (!candidate.isComplete) return false;
            if (candidate.coreHex.cellKey === selectedHex.cellKey) return true;

            return candidate.matchedSatellites.some(match => match.hex.cellKey === selectedHex.cellKey);
        })
        : false;

  return (
    <div className={s.cityPage}>
      <div className={s.cityContainer}>
        <CityHex cells={hexes} onSelect={setSelectedHex}/>
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
                    blocked={traceStatus.isBesieged}
                    blockedReason={BESIEGED_BUILD_BLOCK_REASON}
                    onDemolish={handleDemolishSelectedHex}
                />
                {selectedHex.kind === "wall"
                    ? <WallBuildingSelector
                        onBuildWall={handleWallBuildingSelect}
                        onBuildWallTop={handleWallTopBuildingSelect}
                        blocked={traceStatus.isBesieged}
                        blockedReason={BESIEGED_BUILD_BLOCK_REASON}
                    />
                    : selectedHex.buildingKey
                        ? <p className={s.buildingLockedNote}>
                            Demolish the existing building before using this hex again.
                        </p>
                        : <BuildingSelector
                        onBuild={handleBuildingSelect}
                        unlockedBuildingIds={unlockedBuildingIds}
                        blocked={traceStatus.isBesieged}
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
    onDemolish,
}: SelectedHexPanelProps) {
    return (
        <aside className={s.selectionPanel}>
            <div className={s.selectionHeader}>
                <span className={s.selectionEyebrow}>{selectedHex.kind === "wall" ? "Wall hex" : "City hex"}</span>
                <h2 className={s.selectionTitle}>{selectedHex.cellKey}</h2>
            </div>

            {selectedBuilding && (
                <div className={s.statSection}>
                    <h3 className={s.statHeading}>{selectedBuilding.name}</h3>
                    <MetricGroup title="Resolved cost" values={selectedBuilding.effectiveRequiredUpkeep} />
                    <MetricGroup title="Resolved output" values={selectedBuilding.effectiveProvidedUpkeep} />
                    <dl className={s.metricList}>
                        <div className={s.metricRow}>
                            <dt>Trace</dt>
                            <dd>{selectedBuilding.effectiveTrace}</dd>
                        </div>
                    </dl>
                    <AdjacencyEffectSummary building={selectedBuilding} />
                    <MultistructureStatus structureCandidates={structureCandidates} />
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
                    <h3 className={s.statHeading}>Wall: {selectedWallBuilding.name}</h3>
                    <MetricGroup title="Upkeep" values={selectedWallBuilding.requiredUpkeep} />
                    <WallStats wallBuilding={selectedWallBuilding} />
                    <p className={s.panelDescription}>{selectedWallBuilding.description}</p>
                </div>
            )}

            {selectedWallTopBuilding && (
                <div className={s.statSection}>
                    <h3 className={s.statHeading}>On wall: {selectedWallTopBuilding.name}</h3>
                    <MetricGroup title="Upkeep" values={selectedWallTopBuilding.requiredUpkeep} />
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

function MultistructureStatus({structureCandidates}: {structureCandidates: StructureDetectionResult[]}) {
    if (!structureCandidates.length) {
        return <p className={s.emptyStats}>No multistructure transformation from this tile.</p>;
    }

    return (
        <div className={s.multistructureStatus}>
            <h4 className={s.metricTitle}>Multistructure</h4>
            {structureCandidates.map(candidate => (
                <div key={`${candidate.structure.id}-${candidate.coreHex.cellKey}`} className={s.multistructureCandidate}>
                    <div className={s.metricRow}>
                        <span>{candidate.structure.name}</span>
                        <strong>{candidate.isComplete ? "Ready" : "Missing satellites"}</strong>
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
            ))}
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
                        <div key={resource.description} className={s.metricRow}>
                            <dt>{resource.description}</dt>
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

function WallStats({wallBuilding}: {wallBuilding: WallBuilding}) {
    return (
        <>
            <dl className={s.metricList}>
                <div className={s.metricRow}>
                    <dt>Resilience</dt>
                    <dd>{wallBuilding.resilience}</dd>
                </div>
                <div className={s.metricRow}>
                    <dt>Camo level</dt>
                    <dd>{wallBuilding.camoLevel}</dd>
                </div>
                <div className={s.metricRow}>
                    <dt>Ignored threat</dt>
                    <dd>{wallBuilding.ignoredThreat}</dd>
                </div>
            </dl>
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
    const hasTraceEffect = Boolean(building.traceAdd) || (building.traceMul ?? 1) !== 1;
    const hasAnyEffect = hasRequiredAdd || hasProvidedAdd || hasRequiredMul || hasProvidedMul || hasTraceEffect;

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
            {hasTraceEffect && (
                <dl className={s.metricList}>
                    <div className={s.metricRow}>
                        <dt>Trace add</dt>
                        <dd>{building.traceAdd ?? 0}</dd>
                    </div>
                    <div className={s.metricRow}>
                        <dt>Trace multiplier</dt>
                        <dd>{building.traceMul ?? 1}</dd>
                    </div>
                </dl>
            )}
        </div>
    );
}

function hasUpkeepValues(values?: UpkeepAmount) {
    return Boolean(values && Object.values(values).some((value) => value !== undefined && value !== 0));
}

function getBuildingName(buildingId: string): string {
    for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
        const building = BUILDINGS_ATLAS[vector][buildingId];
        if (building) return building.name;
    }

    return buildingId;
}

function WallBuildingSelector({
    onBuildWall,
    onBuildWallTop,
    blocked,
    blockedReason,
}: {
    onBuildWall: (buildingId: string) => void;
    onBuildWallTop: (buildingId: string) => void;
    blocked: boolean;
    blockedReason: string;
}) {
    return (
        <div className={s.wallSelector}>
            <WallBuildingList title="Wall" buildings={Object.values(WALL_SEGMENT_BUILDINGS)} onBuild={onBuildWall} blocked={blocked} blockedReason={blockedReason} />
            <WallBuildingList title="On top of wall" buildings={Object.values(TOWER_PLATFORM_BUILDINGS)} onBuild={onBuildWallTop} blocked={blocked} blockedReason={blockedReason} />
        </div>
    );
}

function WallBuildingList({
    title,
    buildings,
    onBuild,
    blocked,
    blockedReason,
}: {
    title: string;
    buildings: WallBuilding[];
    onBuild: (buildingId: string) => void;
    blocked: boolean;
    blockedReason: string;
}) {
    return (
        <section className={s.wallCategory}>
            <h3 className={s.wallCategoryTitle}>{title}</h3>
            <div className={s.wallCardList}>
                {buildings.map((building) => (
                    <article key={building.id} className={s.wallCard}>
                        <div>
                            <h4 className={s.wallCardTitle}>{building.name}</h4>
                            <WallStats wallBuilding={building} />
                        </div>
                        <button
                            className={s.wallBuildButton}
                            type="button"
                            disabled={blocked}
                            title={blocked ? blockedReason : undefined}
                            onClick={() => onBuild(building.id)}
                        >
                            Build
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default CityPage;

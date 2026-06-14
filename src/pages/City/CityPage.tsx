import { useState } from 'react';
import * as s from './CityPage.css.ts';
import CityHex from "./Components/CityHex/CityHex.tsx";
import type {HexCell} from "../../models/city/HexGrid.ts";
import {BuildingSelector} from "./Components/BuildingSelector/BuildingSelector.tsx";
import {type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {selectCityBuildings, selectCityHexes} from "../../store/city/selectors.ts";
import {buildHex} from "../../store/city/slice.ts";
import {UPKEEP_TYPES, type UpkeepAmount} from "../../models/Upkeep.ts";
import {ALL_WALL_BUILDINGS, WALL_BUILDINGS_ATLAS} from "../../data/wall.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import {selectWallResolution, type WallResolution} from "../../store/wall/selectors.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import type {PlacedBuilding} from "../../models/city/Building.ts";

const CityPage = () => {
    const dispatch = useTypedDispatch();
    const hexes = useTypedSelector(selectCityHexes);
    const cityBuildings = useTypedSelector(selectCityBuildings);
    const wallResolution = useTypedSelector(selectWallResolution);
    const [selectedHex, setSelectedHex] = useState<HexCell | null>(null);

    const handleBuildingSelect = (buildingKey: string, developmentVector: DevelopmentVectorValue) => {
        if (!selectedHex) return;
        dispatch(buildHex({...selectedHex, buildingKey, developmentVector }))
    };

    const handleWallBuildingSelect = (buildingKey: string) => {
        if (!selectedHex) return;
        dispatch(buildHex({...selectedHex, buildingKey, developmentVector: DEVELOPMENT_VECTORS.default }))
    };

    const selectedBuilding = selectedHex ? cityBuildings.get(selectedHex.cellKey) : undefined;
    const selectedWallBuilding = selectedHex?.buildingKey ? ALL_WALL_BUILDINGS[selectedHex.buildingKey] : undefined;

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
                    wallResolution={wallResolution}
                />
                {selectedHex.kind === "wall"
                    ? <WallBuildingSelector onBuild={handleWallBuildingSelect} />
                    : <BuildingSelector onBuild={handleBuildingSelect}/>
                }
            </div>
        }
    </div>
  );
};

type SelectedHexPanelProps = {
    selectedHex: HexCell;
    selectedBuilding?: PlacedBuilding;
    selectedWallBuilding?: WallBuilding;
    wallResolution: WallResolution;
};

function SelectedHexPanel({
    selectedHex,
    selectedBuilding,
    selectedWallBuilding,
    wallResolution,
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
                    <p className={s.panelDescription}>{selectedBuilding.adjacencyDescription}</p>
                </div>
            )}

            {selectedWallBuilding && (
                <div className={s.statSection}>
                    <h3 className={s.statHeading}>{selectedWallBuilding.name}</h3>
                    <MetricGroup title="Upkeep" values={selectedWallBuilding.requiredUpkeep} />
                    <WallStats wallBuilding={selectedWallBuilding} />
                    <p className={s.panelDescription}>{selectedWallBuilding.description}</p>
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

            {!selectedBuilding && !selectedWallBuilding && (
                <p className={s.panelDescription}>Empty tile. Choose something below to build here.</p>
            )}
        </aside>
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

function WallBuildingSelector({onBuild}: {onBuild: (buildingId: string) => void}) {
    return (
        <div className={s.wallSelector}>
            <WallBuildingList title="Wall segments" buildings={Object.values(WALL_BUILDINGS_ATLAS.wallSegments)} onBuild={onBuild} />
            <WallBuildingList title="Tower bases" buildings={Object.values(WALL_BUILDINGS_ATLAS.towerBases)} onBuild={onBuild} />
        </div>
    );
}

function WallBuildingList({
    title,
    buildings,
    onBuild,
}: {
    title: string;
    buildings: WallBuilding[];
    onBuild: (buildingId: string) => void;
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
                        <button className={s.wallBuildButton} type="button" onClick={() => onBuild(building.id)}>
                            Build
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default CityPage;

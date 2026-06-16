import { useEffect, useMemo, useState } from "react";
import * as s from "./BuildingSelector.css.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../../../models/DevlopmentVector.ts";
import {BUILDINGS_ATLAS} from "../../../../data/buildings";
import {UPKEEP_TYPES} from "../../../../models/Upkeep.ts";
import {HexTilePreview} from "./HexTilePreview.tsx";
import {buildingsSpriteAtlas} from "../../../../models/sprites/buildings/buildingsSpriteAtlas.ts";
import type {BuildingSelectorProps} from "../../../../models/city/buildingSelector.ts";

export function BuildingSelector({
                                     onBuild,
                                     unlockedBuildingIds,
                                     blocked = false,
                                 blockedReason,
                                 }: BuildingSelectorProps) {
    const [activeVector, setActiveVector] = useState<DevelopmentVectorValue>(DEVELOPMENT_VECTORS.medieval);
    const availableVectors = useMemo(() => (
        Object.values(DEVELOPMENT_VECTORS)
            .map(vector => ({
                vector,
                buildings: Object.values(BUILDINGS_ATLAS[vector])
                    .filter(building => !building.isMultistructure)
                    .filter(building => unlockedBuildingIds.has(building.id)),
            }))
            .filter(vectorOption => vectorOption.buildings.length > 0)
    ), [unlockedBuildingIds]);
    const activeBuildings = availableVectors.find(vectorOption => vectorOption.vector === activeVector)?.buildings ?? [];

    useEffect(() => {
        if (availableVectors.some(vectorOption => vectorOption.vector === activeVector)) return;

        const fallbackVector = availableVectors[0]?.vector;
        if (fallbackVector) {
            setActiveVector(fallbackVector);
        }
    }, [activeVector, availableVectors]);

    return (
        <div className={s.wrapper} data-theme={activeVector.description}>
            {/* Tabs */}
            <div className={s.tabs} role="tablist" aria-label="Development vectors">
                {availableVectors.map(({vector, buildings}) => {
                    const count = buildings.length;
                    return (
                        <button
                            key={vector.description}
                            type="button"
                            aria-controls={`tab-${vector.description}`}
                            aria-expanded={activeVector === vector}
                            role="tab"
                            aria-selected={activeVector === vector}
                            className={s.tabButton[activeVector === vector ? 'active' : 'regular']}
                            onClick={() => setActiveVector(vector)}
                            data-vector={vector}
                        >
                            <span className={s.tabDot} aria-hidden />
                            <span className={s.tabLabel}>{vector.description}</span>
                            <span className={s.tabCount}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Cards list */}
            <div className={s.list} role="list">
                {activeBuildings.map(building => {
                    return (
                        <article key={building.id} role="listitem" className={s.card} aria-labelledby={`${building.id}-name`}>
                            {/* Zone 1 — Header (name + cost + build btn) */}
                            <header className={s.zoneHeader}>
                                <div className={s.titleLine}>
                                    <h3 id={`${building.id}-name`} className={s.name}>
                                        {building.name}
                                    </h3>
                                    <ul className={s.cost}>
                                        {Object.values(UPKEEP_TYPES).map((resource) => {
                                            if (!building.requiredUpkeep[resource]) return null
                                            return (
                                                <li key={resource.description} className={s.costItem}>
                                                    <span className={s.costValue}>{building.requiredUpkeep[resource]}</span>
                                                    <span className={s.costLabel}>{resource.description}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                                <button
                                    className={s.buildBtn}
                                    type="button"
                                    disabled={blocked}
                                    onClick={() => onBuild(building.id, activeVector)}
                                    aria-label={`Build ${building.name}`}
                                    title={blocked ? blockedReason : undefined}
                                >
                                    Build
                                </button>
                            </header>

                            {/* Zone 2 — Preview + Gives */}
                            <section className={s.zoneRow}>
                                <div className={s.previewCol}>
                                    <HexTilePreview
                                        imageUrl={buildingsSpriteAtlas[building.vector][building.id]}
                                    />
                                </div>
                                <div className={s.contentCol}>
                                    <h4 className={s.sectionTitle}>Gives</h4>
                                    <ul className={s.bullets}>
                                        {Object.values(UPKEEP_TYPES).map((resource) => {
                                            if (!building.providedUpkeep[resource]) return null
                                            return (
                                                <li key={resource.description} className={s.bulletItem}>
                                                    <span className={s.costValue}>{building.providedUpkeep[resource]}</span>
                                                    <span className={s.costLabel}>{resource.description}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </section>

                            {/* Zone 3 — Adjacency effects */}
                            <section className={s.zoneRow}>
                                <div className={s.previewColPlaceholder} aria-hidden />
                                <div className={s.contentCol}>
                                    <h4 className={s.sectionTitle}>Adjacency</h4>
                                    {/*{building.adjacency.length ? (
                                        <ul className={s.bullets}>
                                            {building.adjacency.map((a, i) => (
                                                <li key={i} className={s.bulletItem}>
                                                    {a.icon}
                                                    <span>{a.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className={s.muted}>No adjacency effects.</p>
                                    )}*/}
                                </div>
                            </section>

                            {/* Zone 4 — Description */}
                            <section className={s.zoneDesc}>
                                <p className={s.description}>{building.description}</p>
                            </section>
                        </article>
                    )
                })}
            </div>
        </div>
    );
}

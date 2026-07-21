import { useEffect, useMemo } from "react";
import * as s from "./BuildingSelector.css.ts";
import {
    DEVELOPMENT_VECTOR_LABELS,
    DEVELOPMENT_VECTORS,
} from "../../../../models/DevlopmentVector.ts";
import {BUILDINGS_ATLAS} from "../../../../data/buildings";
import {HexTilePreview} from "./HexTilePreview.tsx";
import {buildingsSpriteAtlas} from "../../../../models/sprites/buildings/buildingsSpriteAtlas.ts";
import {BUILDING_SPRITE_HEX_WIDTH_RATIO} from "../../../../models/sprites/buildings/buildingSpriteLayout.ts";
import type {BuildingSelectorProps} from "../../../../models/city/buildingSelector.ts";
import {
    formatHomogeneousValue,
    getHomogeneousProductionContributions,
    getHomogeneousRequirementContributions,
} from "../../../../models/homogeneousValueHelpers.ts";
import {getHomogeneousValueDefinition} from "../../../../data/homogeneousValues/index.ts";
import type {HomogeneousValueEffect} from "../../../../models/homogeneousValues.ts";
import {normalizeMultiplier} from "../../../../models/homogeneousValueResolution.ts";

export function BuildingSelector({
                                     onBuild,
                                     activeVector,
                                     onActiveVectorChange,
                                     unlockedBuildingIds,
                                     unavailableBuildingReasons = {},
                                     blocked = false,
                                 blockedReason,
                                 }: BuildingSelectorProps) {
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
            onActiveVectorChange(fallbackVector);
        }
    }, [activeVector, availableVectors, onActiveVectorChange]);

    return (
        <div className={s.wrapper} data-theme={activeVector}>
            {/* Tabs */}
            <div className={s.tabs} role="tablist" aria-label="Development vectors">
                {availableVectors.map(({vector, buildings}) => {
                    const count = buildings.length;
                    return (
                        <button
                            key={vector}
                            type="button"
                            aria-controls={`tab-${vector}`}
                            aria-expanded={activeVector === vector}
                            role="tab"
                            aria-selected={activeVector === vector}
                            className={`${s.tabButton[activeVector === vector ? 'active' : 'regular']} ${s.tabVector[vector]}`}
                            onClick={() => onActiveVectorChange(vector)}
                            data-vector={vector}
                        >
                            <span className={s.tabDot} aria-hidden />
                            <span className={s.tabLabel}>{DEVELOPMENT_VECTOR_LABELS[vector]}</span>
                            <span className={s.tabCount}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Cards list */}
            <div className={s.list} role="list">
                {activeBuildings.map(building => {
                    const unavailableReason = unavailableBuildingReasons[building.id];
                    const buildBlockedReason = blocked ? blockedReason : unavailableReason;
                    const buildBlocked = blocked || Boolean(unavailableReason);
                    const hasAdjacencyRules = Boolean(building.effects?.length);
                    const spriteAsset = buildingsSpriteAtlas[building.vector][building.visualAssetId ?? building.id]
                        ?? buildingsSpriteAtlas[building.vector][building.id];
                    const spriteUrl = spriteAsset?.src;

                    return (
                        <article key={building.id} role="listitem" className={`${s.card} ${s.cardFrame[building.vector]}`} aria-labelledby={`${building.id}-name`}>
                            {/* Zone 1 — Header (name + cost + build btn) */}
                            <header className={s.zoneHeader}>
                                <div className={s.titleLine}>
                                    <h3 id={`${building.id}-name`} className={s.name}>
                                        {building.name}
                                    </h3>
                                </div>
                                <button
                                    className={s.buildBtn}
                                    type="button"
                                    disabled={buildBlocked}
                                    onClick={() => onBuild(building.id, activeVector)}
                                    aria-label={`Build ${building.name}`}
                                    title={buildBlockedReason}
                                >
                                    Build
                                </button>
                            </header>

                            {/* Zone 2 — Preview + effects */}
                            <section className={s.effectsRow}>
                                <div className={s.previewCol}>
                                    <HexTilePreview
                                        imageUrl={spriteUrl}
                                        imageZoom={spriteAsset?.metadata?.zoom}
                                        imageShift={spriteAsset?.metadata?.shift}
                                        padding={spriteUrl ? BUILDING_SPRITE_HEX_WIDTH_RATIO : 0.96}
                                        strokeWidth={spriteUrl ? 0 : 3}
                                    />
                                </div>
                                <div className={s.contentCol}>
                                    <h4 className={s.sectionTitle}>Gives</h4>
                                    <HomogeneousEffectList
                                        effects={getHomogeneousProductionContributions(building)}
                                        className={s.bullets}
                                        itemClassName={s.bulletItem}
                                    />
                                </div>
                                <div className={s.contentCol}>
                                    <h4 className={s.sectionTitle}>Requires</h4>
                                    <HomogeneousEffectList
                                        effects={getHomogeneousRequirementContributions(building)}
                                        className={s.bullets}
                                        itemClassName={s.bulletItem}
                                    />
                                </div>
                            </section>

                            {hasAdjacencyRules && (
                                <section className={s.zoneRow}>
                                    <div className={s.previewColPlaceholder} aria-hidden />
                                    <div className={s.contentCol}>
                                        <h4 className={s.sectionTitle}>Adjacency</h4>
                                        <p className={s.description}>{building.adjacencyDescription}</p>
                                    </div>
                                </section>
                            )}

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

function HomogeneousEffectList({
    effects,
    className,
    itemClassName,
}: {
    effects: HomogeneousValueEffect[];
    className: string;
    itemClassName: string;
}) {
    const visibleEffects = effects.filter(effect => resolveEffectValue(effect) !== 0);

    if (!visibleEffects.length) return null;

    return (
        <ul className={className}>
            {visibleEffects.map((effect, index) => {
                const value = resolveEffectValue(effect);
                const definition = getHomogeneousValueDefinition(effect.valueId);

                return (
                    <li key={`${effect.valueId}-${index}`} className={itemClassName}>
                        <span className={s.costValue}>
                            {formatHomogeneousValue(effect.valueId, value, effect.additionalKeywords)}
                        </span>
                        <span className={s.costLabel}>{definition.label}</span>
                    </li>
                );
            })}
        </ul>
    );
}

function resolveEffectValue(effect: HomogeneousValueEffect): number {
    return (effect.additive ?? 0) * normalizeMultiplier(effect.multiplier);
}

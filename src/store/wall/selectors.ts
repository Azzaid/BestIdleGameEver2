import {createSelector} from "@reduxjs/toolkit";
import {WALL_SEGMENT_BUILDINGS} from "../../data/wallSegments/index.ts";
import {WALL_TOWER_BUILDINGS} from "../../data/wallSuperstructures/index.ts";
import {selectCityHexes} from "../city/selectors.ts";
import type {WallBuilding, WallResolution} from "../../models/city/Wall.ts";
import {getUpkeepValues, resolveCity} from "../../models/homogeneousValueResolution.ts";
import {homogeneousValueTotalsToUpkeepAmount} from "../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import type {
    HomogeneousCityEntityType,
    HomogeneousResolvedEntity,
    HomogeneousValueEntitySource,
} from "../../models/homogeneousValueResolution.ts";
import {selectUnlockedWallSegmentIds, selectUnlockedWallSuperstructureIds} from "../unlocks/selectors.ts";

export const selectUnlockedWallBuildingIds = createSelector(
    [selectUnlockedWallSegmentIds, selectUnlockedWallSuperstructureIds],
    (segmentIds, superstructureIds) => [...segmentIds, ...superstructureIds],
);

export const selectUnlockedWallBuildings = createSelector(
    [selectUnlockedWallBuildingIds],
    (ids): WallBuilding[] => ids.flatMap((id) => {
        const wallBuilding = WALL_SEGMENT_BUILDINGS[id] ?? WALL_TOWER_BUILDINGS[id];
        return wallBuilding ? [wallBuilding] : [];
    })
);

export const selectWallResolution = createSelector(
    [selectCityHexes],
    (hexes): WallResolution => {
        const resolution: WallResolution = {
            requiredUpkeep: {},
            resilience: 0,
            camoLevel: 0,
            ignoredThreat: 0,
            pushBackDistance: 0,
            pushBacksPerSecond: 0,
            pushBackEffectZoneSize: 0,
            zoneDotDamage: 0,
            zoneDotTicksPerSecond: 0,
            zoneDotZoneSize: 0,
            zoneDotKeywords: [],
            homogeneousValues: {},
            homogeneousResolvedValues: {},
        };
        const wallEntities: HomogeneousValueEntitySource[] = [];

        hexes.forEach((hex) => {
            if (hex.kind !== "wall") return;

            [
                {key: hex.wallKey, entityType: "wallSegment" as const},
                {key: hex.wallTopKey, entityType: "wallSuperstructure" as const},
            ].forEach(({key: wallBuildingKey, entityType}: {
                key?: string | null;
                entityType: HomogeneousCityEntityType;
            }) => {
                if (!wallBuildingKey) return;

                const wallBuilding = entityType === "wallSegment"
                    ? WALL_SEGMENT_BUILDINGS[wallBuildingKey]
                    : WALL_TOWER_BUILDINGS[wallBuildingKey];
                if (!wallBuilding) return;

                wallEntities.push({
                    id: `${hex.cellKey}:${wallBuilding.id}`,
                    name: wallBuilding.name,
                    entityType,
                    cellKey: hex.cellKey,
                    column: hex.column,
                    row: hex.row,
                    keywords: [String(wallBuilding.type), ...(wallBuilding.keywords ?? [])],
                    values: wallBuilding.values ?? [],
                    derivedValues: wallBuilding.derivedValues ?? [],
                    effects: wallBuilding.effects,
                });
            });
        });
        const resolvedWallCity = resolveCity(wallEntities);
        resolution.homogeneousResolvedValues = resolvedWallCity.resolvedValues;
        resolution.homogeneousValues = resolvedWallCity.values;
        resolution.requiredUpkeep = homogeneousValueTotalsToUpkeepAmount(getUpkeepValues(resolution.homogeneousResolvedValues));
        resolution.resilience = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallResilience] ?? 0;
        resolution.camoLevel = Math.max(0, -(resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0));
        resolution.ignoredThreat = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallThreatSuppression] ?? 0;
        resolution.pushBackDistance = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallPushBackDistance] ?? 0;
        resolution.pushBacksPerSecond = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallPushBacksPerSecond] ?? 0;
        resolution.pushBackEffectZoneSize = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallPushBackEffectZoneSize] ?? 0;
        resolution.zoneDotDamage = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallZoneDotDamage] ?? 0;
        resolution.zoneDotTicksPerSecond = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallZoneDotTicksPerSecond] ?? 0;
        resolution.zoneDotZoneSize = resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallZoneDotZoneSize] ?? 0;
        resolution.zoneDotKeywords = collectWallZoneDotKeywords(resolvedWallCity.resolvedWallSegments);

        return resolution;
    }
);

export const selectWallResilience = createSelector(
    [selectWallResolution],
    (resolution): number => resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallResilience] ?? 0,
);

export const selectWallThreatSuppression = createSelector(
    [selectWallResolution],
    (resolution): number => resolution.homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallThreatSuppression] ?? 0,
);

export const selectBuiltWallTowerCount = createSelector(
    [selectCityHexes],
    (hexes): number => hexes.filter((hex) => {
        if (hex.kind !== "wall" || !hex.wallTopKey) return false;

        return Boolean(WALL_TOWER_BUILDINGS[hex.wallTopKey]);
    }).length
);

function collectWallZoneDotKeywords(wallEntities: readonly HomogeneousResolvedEntity[]): string[] {
    return [...new Set(wallEntities.flatMap((entity) => {
        const dotDamageContributions = entity.resolvedContributions.filter((value) => (
            value.valueId === HOMOGENEOUS_VALUE_IDS.wallZoneDotDamage
        ));

        if (dotDamageContributions.length === 0) return [];

        return [
            ...entity.effectiveKeywords,
            ...dotDamageContributions.flatMap((value) => value.additionalKeywords ?? []),
        ];
    }))].sort();
}

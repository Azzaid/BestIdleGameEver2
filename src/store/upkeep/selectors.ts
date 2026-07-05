import {createSelector} from "@reduxjs/toolkit";
import {selectCityResolution} from "../city/selectors.ts";
import type {RootState} from "../../models/store/appStore.ts";
import type {CityResolution} from "../../models/city/Adjancency.ts";
import {
    selectActiveTower,
    selectActiveTowerDraftAssembly,
    selectAvailableTowerList,
    selectResolvedActiveTowerDraft,
    selectResolvedAvailableTowers,
} from "../towers/selectors.ts";
import {deductUpkeep} from "../../pages/City/Components/CityHex/upkeepUtils.ts";
import type {CitySignatureStatus} from "../../models/store/upkeep.ts";
import {selectIsDebugModeEnabled} from "../debug/selectors.ts";
import {
    getAvailableValues,
    getProducedValues,
    getUpkeepValues,
    resolveCity,
    resolveHomogeneousValueContributions,
} from "../../models/homogeneousValueResolution.ts";
import {homogeneousValueTotalsToUpkeepAmount} from "../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {HomogeneousResolvedEntity, HomogeneousValueEntitySource} from "../../models/homogeneousValueResolution.ts";
import {selectUnlockedTowerPartIds} from "../unlocks/selectors.ts";
import {resolveTowerAssembly, resolveTowerAssemblyStatsAndSupport} from "../../models/battle/resolveTowerAssembly.ts";
import type {TowerAssemblyResolved} from "../../models/battle/towerParts.ts";
import type {WallResolution} from "../../models/city/Wall.ts";
import {selectTechnologyHomogeneousEntities} from "../research/selectors.ts";
import {selectGlobalModifierHomogeneousEntities} from "../globalEvents/selectors.ts";
import type {GlobalModifierApplyContext} from "../../models/globalEvents.ts";

export {selectCityResolution};

type ResolvedAvailableTower = ReturnType<typeof selectResolvedAvailableTowers>[number];

export const selectTowerAwareCityResolution = createSelector(
    [selectCityResolution, selectResolvedAvailableTowers, selectTechnologyHomogeneousEntities, selectGlobalModifierHomogeneousEntities],
    (cityResolution, resolvedTowers, technologyEntities, globalModifierEntities): CityResolution => {
        return resolveEffectiveCityResolution(cityResolution, resolvedTowers, [
            ...technologyEntities,
            ...globalModifierEntities,
        ]);
    }
);

export const selectResolvedEffectiveAvailableTowers = createSelector(
    [selectResolvedAvailableTowers, selectTowerAwareCityResolution],
    (resolvedTowers, cityResolution): ResolvedAvailableTower[] => resolvedTowers.map((resolvedTower) => ({
        ...resolvedTower,
        resolved: applyEffectiveTowerEntity(
            resolvedTower.resolved,
            cityResolution.resolvedTowers.find((entity) => entity.id === getTowerEntityId(resolvedTower.tower.id)),
        ),
    })),
);

export const selectResolvedEffectiveActiveTowerDraft = createSelector(
    [
        selectCityResolution,
        selectAvailableTowerList,
        selectResolvedAvailableTowers,
        selectActiveTower,
        selectActiveTowerDraftAssembly,
        selectResolvedActiveTowerDraft,
        selectUnlockedTowerPartIds,
        selectTechnologyHomogeneousEntities,
        selectGlobalModifierHomogeneousEntities,
    ],
    (
        cityResolution,
        availableTowers,
        resolvedAvailableTowers,
        activeTower,
        activeTowerDraftAssembly,
        resolvedActiveTowerDraft,
        unlockedTowerPartIds,
        technologyEntities,
        globalModifierEntities,
    ): TowerAssemblyResolved => {
        const activeTowerIndex = availableTowers.findIndex((tower) => tower.id === activeTower?.id);
        if (activeTowerIndex < 0) return resolvedActiveTowerDraft;

        const substitutedResolvedTowers = resolvedAvailableTowers.map((resolvedTower, index) => {
            if (index !== activeTowerIndex) return resolvedTower;

            return {
                tower: resolvedTower.tower,
                resolved: resolveTowerAssembly(activeTowerDraftAssembly, unlockedTowerPartIds),
            };
        });
        const effectiveCityResolution = resolveEffectiveCityResolution(cityResolution, substitutedResolvedTowers, [
            ...technologyEntities,
            ...globalModifierEntities,
        ]);
        const effectiveTowerEntity = effectiveCityResolution.resolvedTowers.find((entity) => (
            entity.id === getTowerEntityId(activeTower?.id ?? "")
        ));

        return applyEffectiveTowerEntity(resolvedActiveTowerDraft, effectiveTowerEntity);
    },
);

export const selectEffectiveWallResolution = createSelector(
    [selectTowerAwareCityResolution],
    (cityResolution): WallResolution => {
        const resolvedWallValues = resolveHomogeneousValueContributions(
            cityResolution.resolvedWallSegments.flatMap((entity) => entity.resolvedContributions),
        );
        const homogeneousValues = getAvailableValues(resolvedWallValues);

        return {
            requiredUpkeep: homogeneousValueTotalsToUpkeepAmount(getUpkeepValues(resolvedWallValues)),
            resilience: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallResilience] ?? 0,
            camoLevel: Math.max(0, -(homogeneousValues[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0)),
            ignoredThreat: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallThreatSuppression] ?? 0,
            pushBackDistance: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallPushBackDistance] ?? 0,
            pushBacksPerSecond: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallPushBacksPerSecond] ?? 0,
            pushBackEffectZoneSize: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallPushBackEffectZoneSize] ?? 0,
            zoneDotDamage: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallZoneDotDamage] ?? 0,
            zoneDotTicksPerSecond: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallZoneDotTicksPerSecond] ?? 0,
            zoneDotZoneSize: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallZoneDotZoneSize] ?? 0,
            zoneDotKeywords: collectWallZoneDotKeywords(cityResolution.resolvedWallSegments),
            homogeneousValues,
            homogeneousResolvedValues: resolvedWallValues,
        };
    },
);

export const selectGlobalModifierApplyContext = createSelector(
    [selectTowerAwareCityResolution],
    (cityResolution): GlobalModifierApplyContext => ({
        availableValues: cityResolution.homogeneousValues,
        producedValues: cityResolution.producedHomogeneousValues,
        upkeepValues: cityResolution.upkeepHomogeneousValues,
    }),
);

function resolveEffectiveCityResolution(
    cityResolution: CityResolution,
    resolvedTowers: readonly ResolvedAvailableTower[],
    technologyEntities: readonly HomogeneousValueEntitySource[],
): CityResolution {
    const baseCityEntities: HomogeneousValueEntitySource[] = cityResolution.resolvedHexes
        .filter((entity) => entity.entityType !== "tower")
        .map((entity) => ({
            ...entity,
            keywords: entity.baseKeywords,
            values: entity.baseValueEffects,
        }));
    const resolvedCity = resolveCity([
        ...baseCityEntities,
        ...technologyEntities,
        ...createTowerEntities(cityResolution, resolvedTowers),
    ]);
    const producedHomogeneousValues = getProducedValues(resolvedCity.resolvedValues);
    const upkeepHomogeneousValues = getUpkeepValues(resolvedCity.resolvedValues);
    const providedUpkeep = homogeneousValueTotalsToUpkeepAmount(producedHomogeneousValues);
    const requiredUpkeep = homogeneousValueTotalsToUpkeepAmount(upkeepHomogeneousValues);
    const buildingsSignature = producedHomogeneousValues[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0;

    return {
        ...cityResolution,
        buildingIds: new Set([
            ...cityResolution.buildingIds,
            ...resolvedCity.buildingIds,
        ]),
        buildingKeywords: new Set([
            ...cityResolution.buildingKeywords,
            ...resolvedCity.buildingKeywords,
        ]),
        values: resolvedCity.values,
        resolvedHexes: resolvedCity.resolvedHexes,
        resolvedTowers: resolvedCity.resolvedTowers,
        resolvedWallSegments: resolvedCity.resolvedWallSegments,
        resolvedTechnologies: resolvedCity.resolvedTechnologies,
        homogeneousValues: resolvedCity.values,
        homogeneousResolvedValues: resolvedCity.resolvedValues,
        producedHomogeneousValues,
        upkeepHomogeneousValues,
        providedUpkeep,
        requiredUpkeep,
        effectiveUpkeep: deductUpkeep(providedUpkeep, requiredUpkeep),
        buildingsSignature,
        effectiveSignature: buildingsSignature + cityResolution.territorySignature + cityResolution.cityFootprint,
    };
}

function createTowerEntities(
    cityResolution: CityResolution,
    resolvedTowers: readonly ResolvedAvailableTower[],
): HomogeneousValueEntitySource[] {
    const towerEntities = cityResolution.resolvedWallSegments.filter((entity) => (
        entity.entityType === "wallSuperstructure"
        && (entity.keywords ?? []).includes(String(BUILDING_TYPES.tower))
    ));

    return resolvedTowers.map(({tower, resolved}, index) => {
        const wallTowerEntity = towerEntities[index];

        return {
            id: getTowerEntityId(tower.id),
            entityType: "tower",
            cellKey: wallTowerEntity?.cellKey,
            column: wallTowerEntity?.column,
            row: wallTowerEntity?.row,
            keywords: [...resolved.keywords],
            values: resolved.values,
            effects: resolved.effects,
        };
    });
}

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

function getTowerEntityId(towerId: string): string {
    return `tower:${towerId}`;
}

function applyEffectiveTowerEntity(
    resolvedTower: TowerAssemblyResolved,
    effectiveTowerEntity?: HomogeneousResolvedEntity,
): TowerAssemblyResolved {
    if (!effectiveTowerEntity) return resolvedTower;

    const effectiveKeywords = new Set(effectiveTowerEntity.effectiveKeywords);
    const {stats, supportCost} = resolveTowerAssemblyStatsAndSupport(
        effectiveTowerEntity.resolvedValues,
        effectiveKeywords,
    );

    return {
        ...resolvedTower,
        stats,
        supportCost,
        keywords: effectiveKeywords,
        homogeneousResolvedValues: effectiveTowerEntity.resolvedValues,
    };
}

export const selectBaseControlledTerritory = (state: RootState): number => state.upkeep.controlledTerritory;

export const selectControlledTerritory = selectBaseControlledTerritory;

export const selectLastSiegeSignature = (state: RootState): number => state.upkeep.lastSiegeSignature;

export const selectCitySignatureStatus = createSelector(
    [selectTowerAwareCityResolution, selectControlledTerritory, selectLastSiegeSignature, selectIsDebugModeEnabled],
    (cityResolution, controlledTerritory, lastSiegeSignature, isDebugModeEnabled): CitySignatureStatus => {
        const signatureRange = controlledTerritory - lastSiegeSignature;
        const displayedSignature = Math.min(cityResolution.effectiveSignature, Math.max(0, controlledTerritory));
        const fillRatio = signatureRange > 0
            ? (displayedSignature - lastSiegeSignature) / signatureRange
            : cityResolution.effectiveSignature > controlledTerritory ? 1 : 0;
        const isBesieged = !isDebugModeEnabled && cityResolution.effectiveSignature > controlledTerritory;

        return {
            effectiveSignature: cityResolution.effectiveSignature,
            cityFootprint: cityResolution.cityFootprint,
            controlledTerritory,
            lastSiegeSignature,
            displayedSignature,
            fillRatio: Math.max(0, Math.min(1, fillRatio)),
            stage: isBesieged ? "besieged" : "stable",
            isBesieged,
        };
    }
);

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
import {selectPurchasedTechsIds} from "../research/selectors.ts";
import {resolveTowerAssembly, resolveTowerAssemblyStatsAndSupport} from "../../models/battle/resolveTowerAssembly.ts";
import type {TowerAssemblyResolved} from "../../models/battle/towerParts.ts";
import type {WallResolution} from "../../models/city/Wall.ts";
import {selectWallResolution} from "../wall/selectors.ts";

export {selectCityResolution};

type ResolvedAvailableTower = ReturnType<typeof selectResolvedAvailableTowers>[number];

export const selectTowerAwareCityResolution = createSelector(
    [selectCityResolution, selectResolvedAvailableTowers],
    (cityResolution, resolvedTowers): CityResolution => {
        return resolveEffectiveCityResolution(cityResolution, resolvedTowers);
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
        selectPurchasedTechsIds,
    ],
    (
        cityResolution,
        availableTowers,
        resolvedAvailableTowers,
        activeTower,
        activeTowerDraftAssembly,
        resolvedActiveTowerDraft,
        purchasedTechIds,
    ): TowerAssemblyResolved => {
        const activeTowerIndex = availableTowers.findIndex((tower) => tower.id === activeTower?.id);
        if (activeTowerIndex < 0) return resolvedActiveTowerDraft;

        const substitutedResolvedTowers = resolvedAvailableTowers.map((resolvedTower, index) => {
            if (index !== activeTowerIndex) return resolvedTower;

            return {
                tower: resolvedTower.tower,
                resolved: resolveTowerAssembly(activeTowerDraftAssembly, purchasedTechIds),
            };
        });
        const effectiveCityResolution = resolveEffectiveCityResolution(cityResolution, substitutedResolvedTowers);
        const effectiveTowerEntity = effectiveCityResolution.resolvedTowers.find((entity) => (
            entity.id === getTowerEntityId(activeTower?.id ?? "")
        ));

        return applyEffectiveTowerEntity(resolvedActiveTowerDraft, effectiveTowerEntity);
    },
);

export const selectEffectiveWallResolution = createSelector(
    [selectTowerAwareCityResolution, selectWallResolution],
    (cityResolution, wallResolution): WallResolution => {
        const resolvedWallValues = resolveHomogeneousValueContributions(
            cityResolution.resolvedWallSegments.flatMap((entity) => entity.resolvedContributions),
        );
        const homogeneousValues = getAvailableValues(resolvedWallValues);

        return {
            requiredUpkeep: homogeneousValueTotalsToUpkeepAmount(getUpkeepValues(resolvedWallValues)),
            resilience: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallResilience] ?? 0,
            camoLevel: Math.max(0, -(homogeneousValues[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0)),
            ignoredThreat: homogeneousValues[HOMOGENEOUS_VALUE_IDS.wallThreatSuppression] ?? 0,
            homogeneousValues,
            homogeneousResolvedValues: resolvedWallValues,
            specialEffects: wallResolution.specialEffects,
        };
    },
);

function resolveEffectiveCityResolution(
    cityResolution: CityResolution,
    resolvedTowers: readonly ResolvedAvailableTower[],
): CityResolution {
    const resolvedCity = resolveCity([
        ...cityResolution.resolvedHexes.filter((entity) => entity.entityType !== "tower"),
        ...createTowerEntities(cityResolution, resolvedTowers),
    ]);
    const producedHomogeneousValues = getProducedValues(resolvedCity.resolvedValues);
    const upkeepHomogeneousValues = getUpkeepValues(resolvedCity.resolvedValues);
    const providedUpkeep = homogeneousValueTotalsToUpkeepAmount(producedHomogeneousValues);
    const requiredUpkeep = homogeneousValueTotalsToUpkeepAmount(upkeepHomogeneousValues);
    const buildingsSignature = producedHomogeneousValues[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0;

    return {
        ...cityResolution,
        values: resolvedCity.values,
        resolvedHexes: resolvedCity.resolvedHexes,
        resolvedTowers: resolvedCity.resolvedTowers,
        resolvedWallSegments: resolvedCity.resolvedWallSegments,
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
    const towerBaseEntities = cityResolution.resolvedWallSegments.filter((entity) => (
        entity.entityType === "wallSuperstructure"
        && (entity.keywords ?? []).includes(String(BUILDING_TYPES.towerBase))
    ));

    return resolvedTowers.map(({tower, resolved}, index) => {
        const towerBaseEntity = towerBaseEntities[index];

        return {
            id: getTowerEntityId(tower.id),
            entityType: "tower",
            cellKey: towerBaseEntity?.cellKey,
            column: towerBaseEntity?.column,
            row: towerBaseEntity?.row,
            keywords: [...resolved.keywords],
            contributions: resolved.homogeneousValueEffects,
        };
    });
}

function getTowerEntityId(towerId: string): string {
    return `tower:${towerId}`;
}

function applyEffectiveTowerEntity(
    resolvedTower: TowerAssemblyResolved,
    effectiveTowerEntity?: HomogeneousResolvedEntity,
): TowerAssemblyResolved {
    if (!effectiveTowerEntity) return resolvedTower;

    const {stats, supportCost} = resolveTowerAssemblyStatsAndSupport(
        effectiveTowerEntity.resolvedValues,
        resolvedTower.keywords,
    );

    return {
        ...resolvedTower,
        stats,
        supportCost,
        homogeneousResolvedValues: effectiveTowerEntity.resolvedValues,
    };
}

export const selectBaseControlledTerritory = (state: RootState): number => state.upkeep.controlledTerritory;

export const selectControlledTerritory = selectBaseControlledTerritory;

export const selectCitySignatureStatus = createSelector(
    [selectTowerAwareCityResolution, selectControlledTerritory, selectIsDebugModeEnabled],
    (cityResolution, controlledTerritory, isDebugModeEnabled): CitySignatureStatus => {
        const displayedSignature = Math.min(cityResolution.effectiveSignature, Math.max(0, controlledTerritory));
        const fillRatio = controlledTerritory > 0
            ? displayedSignature / controlledTerritory
            : cityResolution.effectiveSignature > 0 ? 1 : 0;
        const displayedCityFootprint = Math.min(cityResolution.cityFootprint, displayedSignature);
        const footprintFillRatio = controlledTerritory > 0
            ? displayedCityFootprint / controlledTerritory
            : cityResolution.cityFootprint > 0 ? 1 : 0;
        const activeFillRatio = Math.max(0, fillRatio - footprintFillRatio);
        const isBesieged = !isDebugModeEnabled && cityResolution.effectiveSignature > controlledTerritory;

        return {
            effectiveSignature: cityResolution.effectiveSignature,
            cityFootprint: cityResolution.cityFootprint,
            controlledTerritory,
            displayedSignature,
            fillRatio,
            footprintFillRatio,
            activeFillRatio,
            stage: isBesieged ? "besieged" : "stable",
            isBesieged,
        };
    }
);

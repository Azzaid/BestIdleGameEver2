import {HOMOGENEOUS_VALUE_IDS} from "../data/homogeneousValues/index.ts";
import {UPKEEP_TYPES, type UpkeepAmount, type UpkeepTypesValue} from "./Upkeep.ts";
import type {HomogeneousValueEffect, HomogeneousValueId, HomogeneousValueRoleKeyword} from "./homogeneousValues.ts";
import type {TowerModifiers, TowerStatsResolved} from "./battle/towerParts.ts";

const resourceValueIdsByUpkeepType: Record<UpkeepTypesValue, HomogeneousValueId> = {
    [UPKEEP_TYPES.people]: HOMOGENEOUS_VALUE_IDS.resourcePeople,
    [UPKEEP_TYPES.gold]: HOMOGENEOUS_VALUE_IDS.resourceGold,
    [UPKEEP_TYPES.power]: HOMOGENEOUS_VALUE_IDS.resourcePower,
    [UPKEEP_TYPES.compute]: HOMOGENEOUS_VALUE_IDS.resourceCompute,
    [UPKEEP_TYPES.veil]: HOMOGENEOUS_VALUE_IDS.resourceVeil,
    [UPKEEP_TYPES.manaFlows]: HOMOGENEOUS_VALUE_IDS.resourceManaFlows,
    [UPKEEP_TYPES.death]: HOMOGENEOUS_VALUE_IDS.resourceDeath,
    [UPKEEP_TYPES.fungi]: HOMOGENEOUS_VALUE_IDS.resourceFungi,
    [UPKEEP_TYPES.plants]: HOMOGENEOUS_VALUE_IDS.resourcePlants,
    [UPKEEP_TYPES.animals]: HOMOGENEOUS_VALUE_IDS.resourceAnimals,
};

export function upkeepAmountToHomogeneousValueEffects(
    amount: UpkeepAmount,
    roleKeyword: HomogeneousValueRoleKeyword,
): HomogeneousValueEffect[] {
    return (Object.keys(amount) as UpkeepTypesValue[]).flatMap((resource) => {
        const additive = amount[resource] ?? 0;
        if (additive === 0) return [];

        return [{
            valueId: resourceValueIdsByUpkeepType[resource],
            additionalKeywords: [roleKeyword],
            additive,
        }];
    });
}

export function homogeneousValueTotalsToUpkeepAmount(totals: Record<HomogeneousValueId, number>): UpkeepAmount {
    return (Object.keys(resourceValueIdsByUpkeepType) as UpkeepTypesValue[]).reduce<UpkeepAmount>(
        (amount, resource) => {
            const value = totals[resourceValueIdsByUpkeepType[resource]] ?? 0;
            if (value !== 0) {
                amount[resource] = value;
            }

            return amount;
        },
        {},
    );
}

export function cityVisibilityToHomogeneousValueEffect(trace: number): HomogeneousValueEffect[] {
    if (trace === 0) return [];

    return [{
        valueId: HOMOGENEOUS_VALUE_IDS.cityVisibility,
        additionalKeywords: ["production"],
        additive: trace,
    }];
}

export function wallStatsToHomogeneousValueEffects(args: {
    resilience: number;
    threatSuppression: number;
}): HomogeneousValueEffect[] {
    return [
        {
            valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
            additionalKeywords: ["production"],
            additive: args.resilience,
        },
        {
            valueId: HOMOGENEOUS_VALUE_IDS.wallThreatSuppression,
            additionalKeywords: ["production"],
            additive: args.threatSuppression,
        },
    ].filter((effect) => effect.additive !== 0);
}

const towerValueIdsByModifier: Record<keyof TowerModifiers, HomogeneousValueId> = {
    rotationSpeed: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed,
    reloadSpeed: HOMOGENEOUS_VALUE_IDS.towerReloadSpeed,
    burstCount: HOMOGENEOUS_VALUE_IDS.towerBurstCount,
    projectileDamage: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
    projectileSpeed: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
    aoeRadius: HOMOGENEOUS_VALUE_IDS.towerAoeRadius,
    targetingDistanceLimit: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
    retargetCooldownSeconds: HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds,
    weight: HOMOGENEOUS_VALUE_IDS.towerWeight,
};

export function towerModifiersToHomogeneousValueEffects(
    modifiers?: Partial<TowerModifiers>,
): HomogeneousValueEffect[] {
    if (!modifiers) return [];

    return (Object.keys(modifiers) as Array<keyof TowerModifiers>).flatMap((modifierKey) => {
        const additive = modifiers[modifierKey] ?? 0;
        if (additive === 0) return [];

        return [{
            valueId: towerValueIdsByModifier[modifierKey],
            additionalKeywords: ["production"],
            additive,
        }];
    });
}

export function towerWeightToHomogeneousValueEffects(weight = 0): HomogeneousValueEffect[] {
    if (weight === 0) return [];

    return [{
        valueId: HOMOGENEOUS_VALUE_IDS.towerWeight,
        additionalKeywords: ["production"],
        additive: weight,
    }];
}

export function homogeneousValueTotalsToTowerStats(
    totals: Record<HomogeneousValueId, number>,
    keywords: Set<string>,
): TowerStatsResolved {
    return {
        rotationSpeed: totals[HOMOGENEOUS_VALUE_IDS.towerRotationSpeed] ?? 0,
        reloadSpeed: totals[HOMOGENEOUS_VALUE_IDS.towerReloadSpeed] ?? 0,
        burstCount: totals[HOMOGENEOUS_VALUE_IDS.towerBurstCount] ?? 0,
        projectileDamage: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileDamage] ?? 0,
        projectileSpeed: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed] ?? 0,
        aoeRadius: totals[HOMOGENEOUS_VALUE_IDS.towerAoeRadius] ?? 0,
        targetingDistanceLimit: totals[HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit] ?? 0,
        retargetCooldownSeconds: totals[HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds] ?? 0,
        weight: totals[HOMOGENEOUS_VALUE_IDS.towerWeight] ?? 0,
        keywords,
    };
}

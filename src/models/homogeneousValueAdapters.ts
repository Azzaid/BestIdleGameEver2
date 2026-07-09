import {HOMOGENEOUS_VALUE_IDS} from "../data/homogeneousValues/index.ts";
import {UPKEEP_TYPES, type UpkeepAmount, type UpkeepTypesValue} from "./Upkeep.ts";
import type {HomogeneousValueId} from "./homogeneousValues.ts";
import type {TowerStatsResolved} from "./battle/towerParts.ts";

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

export function getHomogeneousValueIdForUpkeepType(resource: UpkeepTypesValue): HomogeneousValueId {
    return resourceValueIdsByUpkeepType[resource];
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

export function homogeneousValueTotalsToTowerStats(
    totals: Record<HomogeneousValueId, number>,
    keywords: Set<string>,
): TowerStatsResolved {
    return {
        rotationSpeed: totals[HOMOGENEOUS_VALUE_IDS.towerRotationSpeed] ?? 0,
        shotsPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond] ?? 0,
        burstCount: totals[HOMOGENEOUS_VALUE_IDS.towerBurstCount] ?? 0,
        projectileDamage: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileDamage] ?? 0,
        projectileSpeed: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed] ?? 0,
        projectileRadius: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileRadius] ?? 0,
        projectileSpread: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileSpread] ?? 0,
        aoeRadius: totals[HOMOGENEOUS_VALUE_IDS.towerAoeRadius] ?? 0,
        targetingDistanceLimit: totals[HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit] ?? 0,
        maximumRange: totals[HOMOGENEOUS_VALUE_IDS.towerMaximumRange] ?? Infinity,
        minimumRange: totals[HOMOGENEOUS_VALUE_IDS.towerMinimumRange] ?? 0,
        maximumRotationAngle: totals[HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle] ?? Infinity,
        retargetCooldownSeconds: totals[HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds] ?? 0,
        triggerTolerance: totals[HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance] ?? 0,
        zonePushBackDistance: totals[HOMOGENEOUS_VALUE_IDS.towerZonePushBackDistance] ?? 0,
        zonePushBacksPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZonePushBacksPerSecond] ?? 0,
        zonePushBackZoneSize: totals[HOMOGENEOUS_VALUE_IDS.towerZonePushBackZoneSize] ?? 0,
        zoneFleeDuration: totals[HOMOGENEOUS_VALUE_IDS.towerZoneFleeDuration] ?? 0,
        zoneFleesPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZoneFleesPerSecond] ?? 0,
        zoneFleeZoneSize: totals[HOMOGENEOUS_VALUE_IDS.towerZoneFleeZoneSize] ?? 0,
        zoneCircleDuration: totals[HOMOGENEOUS_VALUE_IDS.towerZoneCircleDuration] ?? 0,
        zoneCirclesPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZoneCirclesPerSecond] ?? 0,
        zoneCircleZoneSize: totals[HOMOGENEOUS_VALUE_IDS.towerZoneCircleZoneSize] ?? 0,
        zoneDotDamage: totals[HOMOGENEOUS_VALUE_IDS.towerZoneDotDamage] ?? 0,
        zoneDotTicksPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZoneDotTicksPerSecond] ?? 0,
        zoneDotZoneSize: totals[HOMOGENEOUS_VALUE_IDS.towerZoneDotZoneSize] ?? 0,
        zoneStunDuration: totals[HOMOGENEOUS_VALUE_IDS.towerZoneStunDuration] ?? 0,
        zoneStunsPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZoneStunsPerSecond] ?? 0,
        zoneStunZoneSize: totals[HOMOGENEOUS_VALUE_IDS.towerZoneStunZoneSize] ?? 0,
        singleTargetPushBackDistance: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetPushBackDistance] ?? 0,
        singleTargetPushBacksPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetPushBacksPerSecond] ?? 0,
        singleTargetPushBackRange: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetPushBackRange] ?? 0,
        singleTargetFleeDuration: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetFleeDuration] ?? 0,
        singleTargetFleesPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetFleesPerSecond] ?? 0,
        singleTargetFleeRange: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetFleeRange] ?? 0,
        singleTargetCircleDuration: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetCircleDuration] ?? 0,
        singleTargetCirclesPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetCirclesPerSecond] ?? 0,
        singleTargetCircleRange: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetCircleRange] ?? 0,
        singleTargetDotDamage: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetDotDamage] ?? 0,
        singleTargetDotTicksPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetDotTicksPerSecond] ?? 0,
        singleTargetDotRange: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetDotRange] ?? 0,
        singleTargetStunDuration: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetStunDuration] ?? 0,
        singleTargetStunsPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetStunsPerSecond] ?? 0,
        singleTargetStunRange: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetStunRange] ?? 0,
        weight: totals[HOMOGENEOUS_VALUE_IDS.towerWeight] ?? 0,
        maximumWeight: totals[HOMOGENEOUS_VALUE_IDS.towerMaximumWeight] ?? 0,
        keywords,
    };
}

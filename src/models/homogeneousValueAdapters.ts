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
    const distance = (valueId: HomogeneousValueId, fallback = 0) => (
        totals[valueId] ?? fallback
    );

    return {
        rotationSpeed: totals[HOMOGENEOUS_VALUE_IDS.towerRotationSpeed] ?? 0,
        shotsPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond] ?? 0,
        burstCount: totals[HOMOGENEOUS_VALUE_IDS.towerBurstCount] ?? 0,
        projectileDamage: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileDamage] ?? 0,
        projectileSpeed: distance(HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed),
        projectileRadius: distance(HOMOGENEOUS_VALUE_IDS.towerProjectileRadius),
        projectileSpread: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileSpread] ?? 0,
        aoeRadius: distance(HOMOGENEOUS_VALUE_IDS.towerAoeRadius),
        targetingDistanceLimit: distance(HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit),
        reconRange: distance(HOMOGENEOUS_VALUE_IDS.towerReconRange),
        detectionRange: distance(HOMOGENEOUS_VALUE_IDS.towerDetectionRange),
        maximumRange: distance(HOMOGENEOUS_VALUE_IDS.towerMaximumRange, Infinity),
        minimumRange: distance(HOMOGENEOUS_VALUE_IDS.towerMinimumRange),
        maximumRotationAngle: totals[HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle] ?? Infinity,
        retargetCooldownSeconds: totals[HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds] ?? 0,
        triggerTolerance: totals[HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance] ?? 0,
        zonePushBackDistance: distance(HOMOGENEOUS_VALUE_IDS.towerZonePushBackDistance),
        zonePushBacksPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZonePushBacksPerSecond] ?? 0,
        zonePushBackZoneSize: distance(HOMOGENEOUS_VALUE_IDS.towerZonePushBackZoneSize),
        zoneFleeDuration: totals[HOMOGENEOUS_VALUE_IDS.towerZoneFleeDuration] ?? 0,
        zoneFleesPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZoneFleesPerSecond] ?? 0,
        zoneFleeZoneSize: distance(HOMOGENEOUS_VALUE_IDS.towerZoneFleeZoneSize),
        zoneCircleDuration: totals[HOMOGENEOUS_VALUE_IDS.towerZoneCircleDuration] ?? 0,
        zoneCirclesPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZoneCirclesPerSecond] ?? 0,
        zoneCircleZoneSize: distance(HOMOGENEOUS_VALUE_IDS.towerZoneCircleZoneSize),
        zoneDotDamage: totals[HOMOGENEOUS_VALUE_IDS.towerZoneDotDamage] ?? 0,
        zoneDotTicksPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZoneDotTicksPerSecond] ?? 0,
        zoneDotZoneSize: distance(HOMOGENEOUS_VALUE_IDS.towerZoneDotZoneSize),
        zoneStunDuration: totals[HOMOGENEOUS_VALUE_IDS.towerZoneStunDuration] ?? 0,
        zoneStunsPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerZoneStunsPerSecond] ?? 0,
        zoneStunZoneSize: distance(HOMOGENEOUS_VALUE_IDS.towerZoneStunZoneSize),
        singleTargetPushBackDistance: distance(HOMOGENEOUS_VALUE_IDS.towerSingleTargetPushBackDistance),
        singleTargetPushBacksPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetPushBacksPerSecond] ?? 0,
        singleTargetPushBackRange: distance(HOMOGENEOUS_VALUE_IDS.towerSingleTargetPushBackRange),
        singleTargetFleeDuration: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetFleeDuration] ?? 0,
        singleTargetFleesPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetFleesPerSecond] ?? 0,
        singleTargetFleeRange: distance(HOMOGENEOUS_VALUE_IDS.towerSingleTargetFleeRange),
        singleTargetCircleDuration: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetCircleDuration] ?? 0,
        singleTargetCirclesPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetCirclesPerSecond] ?? 0,
        singleTargetCircleRange: distance(HOMOGENEOUS_VALUE_IDS.towerSingleTargetCircleRange),
        singleTargetDotDamage: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetDotDamage] ?? 0,
        singleTargetDotTicksPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetDotTicksPerSecond] ?? 0,
        singleTargetDotRange: distance(HOMOGENEOUS_VALUE_IDS.towerSingleTargetDotRange),
        singleTargetStunDuration: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetStunDuration] ?? 0,
        singleTargetStunsPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetStunsPerSecond] ?? 0,
        singleTargetStunRange: distance(HOMOGENEOUS_VALUE_IDS.towerSingleTargetStunRange),
        singleTargetInfectionDuration: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetInfectionDuration] ?? 0,
        singleTargetInfectionsPerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetInfectionsPerSecond] ?? 0,
        singleTargetInfectionRange: distance(HOMOGENEOUS_VALUE_IDS.towerSingleTargetInfectionRange),
        singleTargetInfectionStacks: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetInfectionStacks] ?? 0,
        singleTargetInfectionMaxStacks: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetInfectionMaxStacks] ?? 0,
        singleTargetInfectionSlowPerStack: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetInfectionSlowPerStack] ?? 0,
        singleTargetInfectionDamagePerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerSingleTargetInfectionDamagePerSecond] ?? 0,
        projectileInfectionDuration: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileInfectionDuration] ?? 0,
        projectileInfectionStacks: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileInfectionStacks] ?? 0,
        projectileInfectionMaxStacks: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileInfectionMaxStacks] ?? 0,
        projectileInfectionSlowPerStack: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileInfectionSlowPerStack] ?? 0,
        projectileInfectionDamagePerSecond: totals[HOMOGENEOUS_VALUE_IDS.towerProjectileInfectionDamagePerSecond] ?? 0,
        weight: totals[HOMOGENEOUS_VALUE_IDS.towerWeight] ?? 0,
        maximumWeight: totals[HOMOGENEOUS_VALUE_IDS.towerMaximumWeight] ?? 0,
        keywords,
    };
}

import {toPixels} from "../../data/constants.ts";
import type {TowerStatsResolved} from "./towerParts.ts";

export function towerStatsToPixels(stats: TowerStatsResolved): TowerStatsResolved {
  return {
    ...stats,
    projectileSpeed: toPixels(stats.projectileSpeed),
    projectileRadius: toPixels(stats.projectileRadius),
    aoeRadius: toPixels(stats.aoeRadius),
    targetingDistanceLimit: toPixels(stats.targetingDistanceLimit),
    maximumRange: toPixels(stats.maximumRange),
    minimumRange: toPixels(stats.minimumRange),
    zonePushBackDistance: toPixels(stats.zonePushBackDistance),
    zonePushBackZoneSize: toPixels(stats.zonePushBackZoneSize),
    zoneFleeZoneSize: toPixels(stats.zoneFleeZoneSize),
    zoneCircleZoneSize: toPixels(stats.zoneCircleZoneSize),
    zoneDotZoneSize: toPixels(stats.zoneDotZoneSize),
    zoneStunZoneSize: toPixels(stats.zoneStunZoneSize),
    singleTargetPushBackDistance: toPixels(stats.singleTargetPushBackDistance),
    singleTargetPushBackRange: toPixels(stats.singleTargetPushBackRange),
    singleTargetFleeRange: toPixels(stats.singleTargetFleeRange),
    singleTargetCircleRange: toPixels(stats.singleTargetCircleRange),
    singleTargetDotRange: toPixels(stats.singleTargetDotRange),
    singleTargetStunRange: toPixels(stats.singleTargetStunRange),
    singleTargetInfectionRange: toPixels(stats.singleTargetInfectionRange),
  };
}

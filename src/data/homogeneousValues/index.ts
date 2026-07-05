import type {
    HomogeneousValueDerivedResolutionConfig,
    HomogeneousValueDefinition,
    HomogeneousValueId,
} from "../../models/homogeneousValues.ts";
import {BASE_TOWER_STATS} from "../constants.ts";

export const HOMOGENEOUS_VALUE_IDS = {
    resourcePeople: "resource.people",
    resourceGold: "resource.gold",
    resourcePower: "resource.power",
    resourceCompute: "resource.compute",
    resourceVeil: "resource.veil",
    resourceManaFlows: "resource.manaFlows",
    resourceDeath: "resource.death",
    resourceFungi: "resource.fungi",
    resourcePlants: "resource.plants",
    resourceAnimals: "resource.animals",
    naturePlantsDomination: "nature.plantsDomination",
    natureShroomsDomination: "nature.shroomsDomination",
    natureAnimalsDomination: "nature.animalsDomination",
    natureBioComplexity: "nature.bioComplexity",
    natureBioDisbalance: "nature.bioDisbalance",
    citySignature: "city.signature",
    cityControlledTerritory: "city.controlledTerritory",
    cityControlledTerritoryGrowthStep: "city.controlledTerritoryGrowthStep",
    cityFootprint: "city.footprint",
    monsterHpFlat: "monster.hpFlat",
    monsterHpMultiplier: "monster.hpMultiplier",
    monsterSpeedFlat: "monster.speedFlat",
    monsterSpeedMultiplier: "monster.speedMultiplier",
    monsterSwayFlat: "monster.swayFlat",
    monsterSwayMultiplier: "monster.swayMultiplier",
    monsterThreatDistanceFlat: "monster.threatDistanceFlat",
    monsterThreatDistanceMultiplier: "monster.threatDistanceMultiplier",
    monsterRegenAmountFlat: "monster.regenAmountFlat",
    monsterRegenAmountMultiplier: "monster.regenAmountMultiplier",
    monsterRegenSpeedFlat: "monster.regenSpeedFlat",
    monsterRegenSpeedMultiplier: "monster.regenSpeedMultiplier",
    siegeThreatFlat: "siege.threatFlat",
    siegeThreatMultiplier: "siege.threatMultiplier",
    siegeLengthFlat: "siege.lengthFlat",
    siegeLengthMultiplier: "siege.lengthMultiplier",
    siegeSimultaneousMonstersLimitFlat: "siege.simultaneousMonstersLimitFlat",
    siegeSimultaneousMonstersLimitMultiplier: "siege.simultaneousMonstersLimitMultiplier",
    wallResilience: "wall.resilience",
    wallThreatSuppression: "wall.threatSuppression",
    wallPushBackDistance: "wall.pushBackDistance",
    wallPushBacksPerSecond: "wall.pushBacksPerSecond",
    wallPushBackEffectZoneSize: "wall.pushBackEffectZoneSize",
    wallZoneDotDamage: "wall.zoneDotDamage",
    wallZoneDotTicksPerSecond: "wall.zoneDotTicksPerSecond",
    wallZoneDotZoneSize: "wall.zoneDotZoneSize",
    towerRotationSpeed: "tower.rotationSpeed",
    towerShotsPerSecond: "tower.shotsPerSecond",
    towerBurstCount: "tower.burstCount",
    towerProjectileDamage: "tower.projectileDamage",
    towerProjectileSpeed: "tower.projectileSpeed",
    towerProjectileRadius: "tower.projectileRadius",
    towerProjectileSpread: "tower.projectileSpread",
    towerAoeRadius: "tower.aoeRadius",
    towerTargetingDistanceLimit: "tower.targetingDistanceLimit",
    towerMaximumRange: "tower.maximumRange",
    towerMinimumRange: "tower.minimumRange",
    towerMaximumRotationAngle: "tower.maximumRotationAngle",
    towerRetargetCooldownSeconds: "tower.retargetCooldownSeconds",
    towerTriggerTolerance: "tower.triggerTolerance",
    towerWeight: "tower.weight",
} as const satisfies Record<string, HomogeneousValueId>;

export const HOMOGENEOUS_VALUE_DEFINITIONS = {
    [HOMOGENEOUS_VALUE_IDS.resourcePeople]: {
        id: HOMOGENEOUS_VALUE_IDS.resourcePeople,
        label: "People",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "medieval", "people"],
        displayMethod: "integer",
        roundingMethod: "roundUp",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceGold]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceGold,
        label: "Gold",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "medieval", "gold"],
        displayMethod: "integer",
        roundingMethod: "roundUp",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourcePower]: {
        id: HOMOGENEOUS_VALUE_IDS.resourcePower,
        label: "Power",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "tech", "power"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceCompute]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceCompute,
        label: "Compute",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "tech", "compute"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceVeil]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceVeil,
        label: "Veil",
        keywords: ["resource", "atmosphere", "output", "display_orb", "aether", "veil"],
        displayMethod: "damaged",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceManaFlows]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceManaFlows,
        label: "Mana Flows",
        keywords: ["resource", "atmosphere", "output", "display_orb", "aether", "manaFlows"],
        displayMethod: "damaged",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceDeath]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceDeath,
        label: "Death",
        keywords: ["resource", "atmosphere", "output", "display_orb", "aether", "death"],
        displayMethod: "damaged",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceFungi]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceFungi,
        label: "Fungi",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "nature", "fungi"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourcePlants]: {
        id: HOMOGENEOUS_VALUE_IDS.resourcePlants,
        label: "Plants",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "nature", "plants"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceAnimals]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceAnimals,
        label: "Animals",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "nature", "animals"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.naturePlantsDomination]: {
        id: HOMOGENEOUS_VALUE_IDS.naturePlantsDomination,
        label: "Plants Domination",
        keywords: ["nature", "derived", "plants", "domination"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.natureShroomsDomination]: {
        id: HOMOGENEOUS_VALUE_IDS.natureShroomsDomination,
        label: "Shrooms Domination",
        keywords: ["nature", "derived", "shrooms", "fungi", "domination"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.natureAnimalsDomination]: {
        id: HOMOGENEOUS_VALUE_IDS.natureAnimalsDomination,
        label: "Animals Domination",
        keywords: ["nature", "derived", "animals", "domination"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.natureBioComplexity]: {
        id: HOMOGENEOUS_VALUE_IDS.natureBioComplexity,
        label: "Bio Complexity",
        keywords: ["nature", "derived", "bioComplexity"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.natureBioDisbalance]: {
        id: HOMOGENEOUS_VALUE_IDS.natureBioDisbalance,
        label: "Bio Disbalance",
        keywords: ["nature", "derived", "bioDisbalance"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.citySignature]: {
        id: HOMOGENEOUS_VALUE_IDS.citySignature,
        label: "City Signature",
        keywords: ["city", "signature"],
        displayMethod: "kilometers",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.cityControlledTerritory]: {
        id: HOMOGENEOUS_VALUE_IDS.cityControlledTerritory,
        label: "Controlled Territory",
        keywords: ["city", "territory"],
        displayMethod: "kilometers",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.cityControlledTerritoryGrowthStep]: {
        id: HOMOGENEOUS_VALUE_IDS.cityControlledTerritoryGrowthStep,
        label: "Controlled Territory Growth Step",
        keywords: ["city", "territory", "growth"],
        displayMethod: "multiplier",
        initialValue: 1.2,
    },
    [HOMOGENEOUS_VALUE_IDS.cityFootprint]: {
        id: HOMOGENEOUS_VALUE_IDS.cityFootprint,
        label: "City Footprint",
        keywords: ["city", "footprint"],
        displayMethod: "kilometers",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterHpFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterHpFlat,
        label: "Monster HP",
        keywords: ["monster", "hp", "flat"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterHpMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterHpMultiplier,
        label: "Monster HP Multiplier",
        keywords: ["monster", "hp", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterSpeedFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterSpeedFlat,
        label: "Monster Speed",
        keywords: ["monster", "speed", "flat"],
        displayMethod: "default",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterSpeedMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterSpeedMultiplier,
        label: "Monster Speed Multiplier",
        keywords: ["monster", "speed", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterSwayFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterSwayFlat,
        label: "Monster Sway",
        keywords: ["monster", "sway", "flat"],
        displayMethod: "distance",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterSwayMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterSwayMultiplier,
        label: "Monster Sway Multiplier",
        keywords: ["monster", "sway", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceFlat,
        label: "Monster Threat Distance",
        keywords: ["monster", "threatDistance", "flat"],
        displayMethod: "distance",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceMultiplier,
        label: "Monster Threat Distance Multiplier",
        keywords: ["monster", "threatDistance", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterRegenAmountFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterRegenAmountFlat,
        label: "Monster Regen Amount",
        keywords: ["monster", "regen", "amount", "flat"],
        displayMethod: "default",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterRegenAmountMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterRegenAmountMultiplier,
        label: "Monster Regen Amount Multiplier",
        keywords: ["monster", "regen", "amount", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedFlat,
        label: "Monster Regen Speed",
        keywords: ["monster", "regen", "speed", "flat"],
        displayMethod: "seconds",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedMultiplier,
        label: "Monster Regen Speed Multiplier",
        keywords: ["monster", "regen", "speed", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeThreatFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeThreatFlat,
        label: "Siege Threat",
        keywords: ["siege", "threat", "flat"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeThreatMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeThreatMultiplier,
        label: "Siege Threat Multiplier",
        keywords: ["siege", "threat", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeLengthFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeLengthFlat,
        label: "Siege Length",
        keywords: ["siege", "length", "flat"],
        displayMethod: "seconds",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeLengthMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeLengthMultiplier,
        label: "Siege Length Multiplier",
        keywords: ["siege", "length", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitFlat,
        label: "Simultaneous Monsters",
        keywords: ["siege", "simultaneousMonsters", "limit", "flat"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitMultiplier,
        label: "Simultaneous Monsters Multiplier",
        keywords: ["siege", "simultaneousMonsters", "limit", "multiplier"],
        displayMethod: "multiplier",
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.wallResilience]: {
        id: HOMOGENEOUS_VALUE_IDS.wallResilience,
        label: "Wall Resilience",
        keywords: ["wall", "resilience"],
        displayMethod: "integer",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.wallThreatSuppression]: {
        id: HOMOGENEOUS_VALUE_IDS.wallThreatSuppression,
        label: "Wall Threat Suppression",
        keywords: ["wall", "threat", "suppression"],
        displayMethod: "default",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.wallPushBackDistance]: {
        id: HOMOGENEOUS_VALUE_IDS.wallPushBackDistance,
        label: "Wall Push Back Distance",
        keywords: ["wall","push","pushBack","distance"],
        displayMethod: "distance",
        resolutionMethod: "diminishingReturn",
        diminishingReturnPower: 0.8,
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.wallPushBacksPerSecond]: {
        id: HOMOGENEOUS_VALUE_IDS.wallPushBacksPerSecond,
        label: "Wall Push Backs Per Second",
        keywords: ["wall","push","pushBack","rate"],
        displayMethod: "default",
        resolutionMethod: "diminishingReturn",
        diminishingReturnPower: 0.8,
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.wallPushBackEffectZoneSize]: {
        id: HOMOGENEOUS_VALUE_IDS.wallPushBackEffectZoneSize,
        label: "Wall Push Back Zone Size",
        keywords: ["wall", "push", "pushBack", "zone"],
        displayMethod: "distance",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.wallZoneDotDamage]: {
        id: HOMOGENEOUS_VALUE_IDS.wallZoneDotDamage,
        label: "Wall Zone DoT Damage",
        keywords: ["wall", "harm", "dot", "damage"],
        displayMethod: "default",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.wallZoneDotTicksPerSecond]: {
        id: HOMOGENEOUS_VALUE_IDS.wallZoneDotTicksPerSecond,
        label: "Wall Zone DoT Ticks Per Second",
        keywords: ["wall", "harm", "dot", "rate"],
        displayMethod: "default",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.wallZoneDotZoneSize]: {
        id: HOMOGENEOUS_VALUE_IDS.wallZoneDotZoneSize,
        label: "Wall Zone DoT Zone Size",
        keywords: ["wall", "harm", "dot", "zone"],
        displayMethod: "distance",
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.towerRotationSpeed]: {
        id: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed,
        label: "Tower Rotation Speed",
        keywords: ["tower", "rotationSpeed"],
        displayMethod: "default",
        initialValue: BASE_TOWER_STATS.rotationSpeed,
    },
    [HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond]: {
        id: HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond,
        label: "Tower Shots Per Second",
        keywords: ["tower", "shotsPerSecond"],
        displayMethod: "default",
        initialValue: BASE_TOWER_STATS.shotsPerSecond,
    },
    [HOMOGENEOUS_VALUE_IDS.towerBurstCount]: {
        id: HOMOGENEOUS_VALUE_IDS.towerBurstCount,
        label: "Tower Burst Count",
        keywords: ["tower", "burstCount"],
        displayMethod: "integer",
        initialValue: BASE_TOWER_STATS.burstCount,
    },
    [HOMOGENEOUS_VALUE_IDS.towerProjectileDamage]: {
        id: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
        label: "Tower Projectile Damage",
        keywords: ["tower", "projectileDamage"],
        displayMethod: "integer",
        initialValue: BASE_TOWER_STATS.projectileDamage,
    },
    [HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed]: {
        id: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
        label: "Tower Projectile Speed",
        keywords: ["tower", "projectileSpeed"],
        displayMethod: "distance",
        initialValue: BASE_TOWER_STATS.projectileSpeed,
    },
    [HOMOGENEOUS_VALUE_IDS.towerProjectileRadius]: {
        id: HOMOGENEOUS_VALUE_IDS.towerProjectileRadius,
        label: "Tower Projectile Radius",
        keywords: ["tower", "projectileRadius"],
        displayMethod: "distance",
        initialValue: BASE_TOWER_STATS.projectileRadius,
    },
    [HOMOGENEOUS_VALUE_IDS.towerProjectileSpread]: {
        id: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
        label: "Tower Projectile Spread",
        keywords: ["tower", "projectileSpread"],
        displayMethod: "default",
        initialValue: BASE_TOWER_STATS.projectileSpread,
    },
    [HOMOGENEOUS_VALUE_IDS.towerAoeRadius]: {
        id: HOMOGENEOUS_VALUE_IDS.towerAoeRadius,
        label: "Tower AOE Radius",
        keywords: ["tower", "aoeRadius"],
        displayMethod: "distance",
        initialValue: BASE_TOWER_STATS.aoeRadius,
    },
    [HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit]: {
        id: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
        label: "Tower Targeting Distance Limit",
        keywords: ["tower", "targetingDistanceLimit"],
        displayMethod: "distance",
        initialValue: BASE_TOWER_STATS.targetingDistanceLimit,
    },
    [HOMOGENEOUS_VALUE_IDS.towerMaximumRange]: {
        id: HOMOGENEOUS_VALUE_IDS.towerMaximumRange,
        label: "Tower Maximum Range",
        keywords: ["tower", "maximumRange"],
        displayMethod: "distance",
        resolutionMethod: "minimum",
        initialValue: BASE_TOWER_STATS.maximumRange,
    },
    [HOMOGENEOUS_VALUE_IDS.towerMinimumRange]: {
        id: HOMOGENEOUS_VALUE_IDS.towerMinimumRange,
        label: "Tower Minimum Range",
        keywords: ["tower", "minimumRange"],
        displayMethod: "distance",
        resolutionMethod: "maximum",
        initialValue: BASE_TOWER_STATS.minimumRange,
    },
    [HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle]: {
        id: HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle,
        label: "Tower Maximum Rotation Angle",
        keywords: ["tower", "maximumRotationAngle"],
        displayMethod: "default",
        resolutionMethod: "minimum",
        initialValue: BASE_TOWER_STATS.maximumRotationAngle,
    },
    [HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds]: {
        id: HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds,
        label: "Tower Retarget Cooldown",
        keywords: ["tower", "retargetCooldownSeconds"],
        displayMethod: "seconds",
        initialValue: BASE_TOWER_STATS.retargetCooldownSeconds,
    },
    [HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance]: {
        id: HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance,
        label: "Tower Trigger Tolerance",
        keywords: ["tower", "triggerTolerance"],
        displayMethod: "triggerTolerance",
        initialValue: BASE_TOWER_STATS.triggerTolerance,
    },
    [HOMOGENEOUS_VALUE_IDS.towerWeight]: {
        id: HOMOGENEOUS_VALUE_IDS.towerWeight,
        label: "Tower Weight",
        keywords: ["tower", "weight"],
        displayMethod: "default",
        initialValue: BASE_TOWER_STATS.weight,
    },
} as const satisfies Record<HomogeneousValueId, HomogeneousValueDefinition>;

const natureBalanceSourceValueIds = [
    HOMOGENEOUS_VALUE_IDS.resourcePlants,
    HOMOGENEOUS_VALUE_IDS.resourceFungi,
    HOMOGENEOUS_VALUE_IDS.resourceAnimals,
] as const;

export const HOMOGENEOUS_VALUE_DERIVED_RESOLUTION_CONFIG: Partial<Record<HomogeneousValueId, HomogeneousValueDerivedResolutionConfig>> = {
    [HOMOGENEOUS_VALUE_IDS.naturePlantsDomination]: {
        sourceValueIds: natureBalanceSourceValueIds,
        resolveValue: (sourceValues) => getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourcePlants) - getNatureBalanceMinimum(sourceValues),
    },
    [HOMOGENEOUS_VALUE_IDS.natureShroomsDomination]: {
        sourceValueIds: natureBalanceSourceValueIds,
        resolveValue: (sourceValues) => getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourceFungi) - getNatureBalanceMinimum(sourceValues),
    },
    [HOMOGENEOUS_VALUE_IDS.natureAnimalsDomination]: {
        sourceValueIds: natureBalanceSourceValueIds,
        resolveValue: (sourceValues) => getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourceAnimals) - getNatureBalanceMinimum(sourceValues),
    },
    [HOMOGENEOUS_VALUE_IDS.natureBioComplexity]: {
        sourceValueIds: natureBalanceSourceValueIds,
        resolveValue: getNatureBalanceMinimum,
    },
    [HOMOGENEOUS_VALUE_IDS.natureBioDisbalance]: {
        sourceValueIds: natureBalanceSourceValueIds,
        resolveValue: (sourceValues) => getNatureBalanceMaximum(sourceValues) - getNatureBalanceMinimum(sourceValues),
    },
};

export const HOMOGENEOUS_VALUE_DEFINITION_LIST = Object.values(HOMOGENEOUS_VALUE_DEFINITIONS);

validateHomogeneousValueDefinitions(HOMOGENEOUS_VALUE_DEFINITION_LIST);

export function getHomogeneousValueDefinition(valueId: HomogeneousValueId): HomogeneousValueDefinition {
    return (HOMOGENEOUS_VALUE_DEFINITIONS as Record<HomogeneousValueId, HomogeneousValueDefinition>)[valueId];
}

function validateHomogeneousValueDefinitions(definitions: readonly HomogeneousValueDefinition[]): void {
    for (const definition of definitions) {
        const displayKeywords = definition.keywords.filter((keyword) => keyword.startsWith("display."));
        if (displayKeywords.length > 0) {
            throw new Error(`Homogeneous value ${definition.id} must use displayMethod instead of display keywords: ${displayKeywords.join(", ")}`);
        }

        if (definition.resolutionMethod === "diminishingReturn") {
            if (definition.diminishingReturnPower === undefined) {
                throw new Error(`Homogeneous value ${definition.id} must define diminishingReturnPower when using diminishingReturn resolution.`);
            }

            if (!Number.isFinite(definition.diminishingReturnPower) || definition.diminishingReturnPower <= 0) {
                throw new Error(`Homogeneous value ${definition.id} must define a positive finite diminishingReturnPower.`);
            }
        }
    }
}

function getNatureBalanceMinimum(sourceValues: Record<HomogeneousValueId, number>): number {
    return Math.min(
        getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourcePlants),
        getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourceFungi),
        getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourceAnimals),
    );
}

function getNatureBalanceMaximum(sourceValues: Record<HomogeneousValueId, number>): number {
    return Math.max(
        getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourcePlants),
        getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourceFungi),
        getNatureBalanceValue(sourceValues, HOMOGENEOUS_VALUE_IDS.resourceAnimals),
    );
}

function getNatureBalanceValue(sourceValues: Record<HomogeneousValueId, number>, valueId: HomogeneousValueId): number {
    return sourceValues[valueId] ?? 0;
}

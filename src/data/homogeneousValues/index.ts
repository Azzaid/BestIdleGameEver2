import type {
    HomogeneousValueDerivedResolutionConfig,
    HomogeneousValueDefinition,
    HomogeneousValueId,
    HomogeneousValueResolutionConfig,
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
        keywords: ["resource", "support", "output", "spendable", "display_bar", "medieval", "people", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceGold]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceGold,
        label: "Gold",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "medieval", "gold", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourcePower]: {
        id: HOMOGENEOUS_VALUE_IDS.resourcePower,
        label: "Power",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "tech", "power", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceCompute]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceCompute,
        label: "Compute",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "tech", "compute", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceVeil]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceVeil,
        label: "Veil",
        keywords: ["resource", "atmosphere", "output", "display_orb", "aether", "veil", "display.damaged"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceManaFlows]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceManaFlows,
        label: "Mana Flows",
        keywords: ["resource", "atmosphere", "output", "display_orb", "aether", "manaFlows", "display.damaged"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceDeath]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceDeath,
        label: "Death",
        keywords: ["resource", "atmosphere", "output", "display_orb", "aether", "death", "display.damaged"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceFungi]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceFungi,
        label: "Fungi",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "nature", "fungi", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourcePlants]: {
        id: HOMOGENEOUS_VALUE_IDS.resourcePlants,
        label: "Plants",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "nature", "plants", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.resourceAnimals]: {
        id: HOMOGENEOUS_VALUE_IDS.resourceAnimals,
        label: "Animals",
        keywords: ["resource", "support", "output", "spendable", "display_bar", "nature", "animals", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.naturePlantsDomination]: {
        id: HOMOGENEOUS_VALUE_IDS.naturePlantsDomination,
        label: "Plants Domination",
        keywords: ["nature", "derived", "plants", "domination", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.natureShroomsDomination]: {
        id: HOMOGENEOUS_VALUE_IDS.natureShroomsDomination,
        label: "Shrooms Domination",
        keywords: ["nature", "derived", "shrooms", "fungi", "domination", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.natureAnimalsDomination]: {
        id: HOMOGENEOUS_VALUE_IDS.natureAnimalsDomination,
        label: "Animals Domination",
        keywords: ["nature", "derived", "animals", "domination", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.natureBioComplexity]: {
        id: HOMOGENEOUS_VALUE_IDS.natureBioComplexity,
        label: "Bio Complexity",
        keywords: ["nature", "derived", "bioComplexity", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.natureBioDisbalance]: {
        id: HOMOGENEOUS_VALUE_IDS.natureBioDisbalance,
        label: "Bio Disbalance",
        keywords: ["nature", "derived", "bioDisbalance", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.citySignature]: {
        id: HOMOGENEOUS_VALUE_IDS.citySignature,
        label: "City Signature",
        keywords: ["city", "signature", "display.kilometers"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.cityControlledTerritory]: {
        id: HOMOGENEOUS_VALUE_IDS.cityControlledTerritory,
        label: "Controlled Territory",
        keywords: ["city", "territory", "display.kilometers"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.cityControlledTerritoryGrowthStep]: {
        id: HOMOGENEOUS_VALUE_IDS.cityControlledTerritoryGrowthStep,
        label: "Controlled Territory Growth Step",
        keywords: ["city", "territory", "growth", "display.multiplier"],
        initialValue: 1.2,
    },
    [HOMOGENEOUS_VALUE_IDS.cityFootprint]: {
        id: HOMOGENEOUS_VALUE_IDS.cityFootprint,
        label: "City Footprint",
        keywords: ["city", "footprint", "display.kilometers"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterHpFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterHpFlat,
        label: "Monster HP",
        keywords: ["monster", "hp", "flat", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterHpMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterHpMultiplier,
        label: "Monster HP Multiplier",
        keywords: ["monster", "hp", "multiplier", "display.multiplier"],
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterSpeedFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterSpeedFlat,
        label: "Monster Speed",
        keywords: ["monster", "speed", "flat", "display.default"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterSpeedMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterSpeedMultiplier,
        label: "Monster Speed Multiplier",
        keywords: ["monster", "speed", "multiplier", "display.multiplier"],
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceFlat,
        label: "Monster Threat Distance",
        keywords: ["monster", "threatDistance", "flat", "display.distance"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterThreatDistanceMultiplier,
        label: "Monster Threat Distance Multiplier",
        keywords: ["monster", "threatDistance", "multiplier", "display.multiplier"],
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterRegenAmountFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterRegenAmountFlat,
        label: "Monster Regen Amount",
        keywords: ["monster", "regen", "amount", "flat", "display.default"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterRegenAmountMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterRegenAmountMultiplier,
        label: "Monster Regen Amount Multiplier",
        keywords: ["monster", "regen", "amount", "multiplier", "display.multiplier"],
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedFlat,
        label: "Monster Regen Speed",
        keywords: ["monster", "regen", "speed", "flat", "display.seconds"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.monsterRegenSpeedMultiplier,
        label: "Monster Regen Speed Multiplier",
        keywords: ["monster", "regen", "speed", "multiplier", "display.multiplier"],
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeThreatFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeThreatFlat,
        label: "Siege Threat",
        keywords: ["siege", "threat", "flat", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeThreatMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeThreatMultiplier,
        label: "Siege Threat Multiplier",
        keywords: ["siege", "threat", "multiplier", "display.multiplier"],
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeLengthFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeLengthFlat,
        label: "Siege Length",
        keywords: ["siege", "length", "flat", "display.seconds"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeLengthMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeLengthMultiplier,
        label: "Siege Length Multiplier",
        keywords: ["siege", "length", "multiplier", "display.multiplier"],
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitFlat]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitFlat,
        label: "Simultaneous Monsters",
        keywords: ["siege", "simultaneousMonsters", "limit", "flat", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitMultiplier]: {
        id: HOMOGENEOUS_VALUE_IDS.siegeSimultaneousMonstersLimitMultiplier,
        label: "Simultaneous Monsters Multiplier",
        keywords: ["siege", "simultaneousMonsters", "limit", "multiplier", "display.multiplier"],
        initialValue: 1,
    },
    [HOMOGENEOUS_VALUE_IDS.wallResilience]: {
        id: HOMOGENEOUS_VALUE_IDS.wallResilience,
        label: "Wall Resilience",
        keywords: ["wall", "resilience", "display.integer"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.wallThreatSuppression]: {
        id: HOMOGENEOUS_VALUE_IDS.wallThreatSuppression,
        label: "Wall Threat Suppression",
        keywords: ["wall", "threat", "suppression", "display.default"],
        initialValue: 0,
    },
    [HOMOGENEOUS_VALUE_IDS.towerRotationSpeed]: {
        id: HOMOGENEOUS_VALUE_IDS.towerRotationSpeed,
        label: "Tower Rotation Speed",
        keywords: ["tower", "rotationSpeed", "display.default"],
        initialValue: BASE_TOWER_STATS.rotationSpeed,
    },
    [HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond]: {
        id: HOMOGENEOUS_VALUE_IDS.towerShotsPerSecond,
        label: "Tower Shots Per Second",
        keywords: ["tower", "shotsPerSecond", "display.default"],
        initialValue: BASE_TOWER_STATS.shotsPerSecond,
    },
    [HOMOGENEOUS_VALUE_IDS.towerBurstCount]: {
        id: HOMOGENEOUS_VALUE_IDS.towerBurstCount,
        label: "Tower Burst Count",
        keywords: ["tower", "burstCount", "display.integer"],
        initialValue: BASE_TOWER_STATS.burstCount,
    },
    [HOMOGENEOUS_VALUE_IDS.towerProjectileDamage]: {
        id: HOMOGENEOUS_VALUE_IDS.towerProjectileDamage,
        label: "Tower Projectile Damage",
        keywords: ["tower", "projectileDamage", "display.integer"],
        initialValue: BASE_TOWER_STATS.projectileDamage,
    },
    [HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed]: {
        id: HOMOGENEOUS_VALUE_IDS.towerProjectileSpeed,
        label: "Tower Projectile Speed",
        keywords: ["tower", "projectileSpeed", "display.distance"],
        initialValue: BASE_TOWER_STATS.projectileSpeed,
    },
    [HOMOGENEOUS_VALUE_IDS.towerProjectileRadius]: {
        id: HOMOGENEOUS_VALUE_IDS.towerProjectileRadius,
        label: "Tower Projectile Radius",
        keywords: ["tower", "projectileRadius", "display.distance"],
        initialValue: BASE_TOWER_STATS.projectileRadius,
    },
    [HOMOGENEOUS_VALUE_IDS.towerProjectileSpread]: {
        id: HOMOGENEOUS_VALUE_IDS.towerProjectileSpread,
        label: "Tower Projectile Spread",
        keywords: ["tower", "projectileSpread", "display.default"],
        initialValue: BASE_TOWER_STATS.projectileSpread,
    },
    [HOMOGENEOUS_VALUE_IDS.towerAoeRadius]: {
        id: HOMOGENEOUS_VALUE_IDS.towerAoeRadius,
        label: "Tower AOE Radius",
        keywords: ["tower", "aoeRadius", "display.distance"],
        initialValue: BASE_TOWER_STATS.aoeRadius,
    },
    [HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit]: {
        id: HOMOGENEOUS_VALUE_IDS.towerTargetingDistanceLimit,
        label: "Tower Targeting Distance Limit",
        keywords: ["tower", "targetingDistanceLimit", "display.distance"],
        initialValue: BASE_TOWER_STATS.targetingDistanceLimit,
    },
    [HOMOGENEOUS_VALUE_IDS.towerMaximumRange]: {
        id: HOMOGENEOUS_VALUE_IDS.towerMaximumRange,
        label: "Tower Maximum Range",
        keywords: ["tower", "maximumRange", "display.distance"],
        initialValue: BASE_TOWER_STATS.maximumRange,
    },
    [HOMOGENEOUS_VALUE_IDS.towerMinimumRange]: {
        id: HOMOGENEOUS_VALUE_IDS.towerMinimumRange,
        label: "Tower Minimum Range",
        keywords: ["tower", "minimumRange", "display.distance"],
        initialValue: BASE_TOWER_STATS.minimumRange,
    },
    [HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle]: {
        id: HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle,
        label: "Tower Maximum Rotation Angle",
        keywords: ["tower", "maximumRotationAngle", "display.default"],
        initialValue: BASE_TOWER_STATS.maximumRotationAngle,
    },
    [HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds]: {
        id: HOMOGENEOUS_VALUE_IDS.towerRetargetCooldownSeconds,
        label: "Tower Retarget Cooldown",
        keywords: ["tower", "retargetCooldownSeconds", "display.seconds"],
        initialValue: BASE_TOWER_STATS.retargetCooldownSeconds,
    },
    [HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance]: {
        id: HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance,
        label: "Tower Trigger Tolerance",
        keywords: ["tower", "triggerTolerance", "display.triggerTolerance"],
        initialValue: BASE_TOWER_STATS.triggerTolerance,
    },
    [HOMOGENEOUS_VALUE_IDS.towerWeight]: {
        id: HOMOGENEOUS_VALUE_IDS.towerWeight,
        label: "Tower Weight",
        keywords: ["tower", "weight", "display.default"],
        initialValue: BASE_TOWER_STATS.weight,
    },
} as const satisfies Record<HomogeneousValueId, HomogeneousValueDefinition>;

export const HOMOGENEOUS_VALUE_RESOLUTION_CONFIG: Partial<Record<HomogeneousValueId, HomogeneousValueResolutionConfig>> = {
    [HOMOGENEOUS_VALUE_IDS.towerMaximumRange]: {
        resolveType: "minimum",
    },
    [HOMOGENEOUS_VALUE_IDS.towerMinimumRange]: {
        resolveType: "maximum",
    },
    [HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle]: {
        resolveType: "minimum",
    },
};

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
        if (displayKeywords.length > 1) {
            throw new Error(`Homogeneous value ${definition.id} has multiple display keywords: ${displayKeywords.join(", ")}`);
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

// /battle/core/Types.ts
export type EntityId = number;

export type Vector2 = { x: number; y: number };

export type DamageType = 'physical' | 'arcane' | 'frost' | 'poison';

export type StatusKind = 'freeze' | 'slow' | 'poison';

export interface Transform {
    position: Vector2;
    rotationRadians: number; // world rotation
}

export interface Movement {
    speedPixelsPerSecond: number;
    path: Vector2[];           // waypoints
    currentWaypointIndex: number;
}

export interface Health {
    maxHitPoints: number;
    hitPoints: number;
    armor: number;             // simple flat reduction or % applied in DamageSystem
}

export interface Enemy {
    kind: string;
    bountyGold: number;
    signatureValue: number;    // for target priority if needed
}

export interface Tower {
    turnSpeedRadPerSec: number;
    rangePixels: number;
    currentTarget?: EntityId;
    weaponEntity: EntityId;    // separate weapon component for modularity
}

export type FireMode = 'projectile' | 'ray' | 'aoe';

export interface Weapon {
    fireMode: FireMode;
    fireCooldownSeconds: number;
    timeUntilReadySeconds: number;
    projectileBlueprintKey?: string;
    rayDamagePerSecond?: number;
    aoeRadiusPixels?: number;
    statusOnHit?: Partial<Record<StatusKind, number>>; // duration seconds or intensity
}

export interface Projectile {
    damage: number;
    damageType: DamageType;
    speedPixelsPerSecond: number;
    areaOfEffectRadiusPixels?: number;
    lifespanSeconds: number;
    elapsedSeconds: number;
    sourceTowerId: EntityId;
    targetEntityId?: EntityId; // optional: lead disabled by spec, so straight travel ok
    directionUnit: Vector2;    // normalized forward vector at fire time
}

export interface AoE {
    radiusPixels: number;
    damagePerSecond: number;
    damageType: DamageType;
    statusOnTick?: Partial<Record<StatusKind, number>>;
    durationSeconds: number;
    elapsedSeconds: number;
}

export interface Status {
    slowMultiplier?: number;        // 0.0–1.0
    poisonDps?: number;
    freezeRemainingSeconds?: number;
    slowRemainingSeconds?: number;
    poisonRemainingSeconds?: number;
}

export interface Sprite {
    textureKey: string;             // id in atlas or img cache
    pivot: Vector2;                 // for rotation around gun joint
    zIndex: number;
    playing?: boolean;              // minor looped anim
}

import type { Vector2 } from './common.ts';

/** Generic movement controller (attach ONE per entity). */
export type MovementKind = 'wobble' | 'polyline' | 'wander' | 'flee' | 'blink' | 'linear';

export interface MovementBase { kind: MovementKind; }

export interface MovementWobble extends MovementBase {
  kind: 'wobble';
  baseSpeedPixelsPerSecond: number;
  wobbleAmplitudePixels: number;
  wobbleFrequencyHz: number;
  timeAliveSeconds: number;
  goalY: number;
  initialX: number;
}

export interface MovementPolyline extends MovementBase {
  kind: 'polyline';
  speedPixelsPerSecond: number;
  waypoints: Vector2[];
  currentIndex: number;
}

export interface MovementWander extends MovementBase {
  kind: 'wander';
  speedPixelsPerSecond: number;
  jitterRadius: number;
  retargetCooldownSeconds: number;
  retargetRemainingSeconds: number;
  currentTarget: Vector2 | null;
}

export interface MovementFlee extends MovementBase {
  kind: 'flee';
  speedPixelsPerSecond: number;
  threatPoint: Vector2;
}

export interface MovementBlink extends MovementBase {
  kind: 'blink';
  driftVelocity: Vector2;
  blinkDistancePixels: number;
  blinkCooldownSeconds: number;
  blinkRemainingSeconds: number;
  bounds?: { x0: number; y0: number; x1: number; y1: number };
}

export interface MovementLinear extends MovementBase {
  kind: 'linear';
  velocityPixelsPerSecond: Vector2; // used for prediction
}

export type MovementController =
  | MovementWobble
  | MovementPolyline
  | MovementWander
  | MovementFlee
  | MovementBlink
  | MovementLinear;

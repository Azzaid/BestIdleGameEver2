import type { TowerVisualSize } from "./towerVisual.ts";

export interface EnemyVisualMetadata {
  sourceSpriteSize?: TowerVisualSize;
  targetSpriteSize?: TowerVisualSize;
  rotationDegrees?: number;
  animationFrames?: string[];
  fps?: number;
}

import type { TowerVisualPoint, TowerVisualSize } from './towerVisual.ts';

export interface TowerPartVisualMetadata {
  inputSocket: TowerVisualPoint;
  outputSockets: Record<string, TowerVisualPoint>;
  sourceSpriteSize?: TowerVisualSize;
  targetSpriteSize?: TowerVisualSize;
  rotationDegrees?: number;
}

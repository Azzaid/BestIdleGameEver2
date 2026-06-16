import type { TowerVisualPoint, TowerVisualSize } from './towerVisual.ts';

export interface TowerPartVisualMetadata {
  id: string;
  spriteId: string;
  inputSocket: TowerVisualPoint;
  outputSockets: Record<string, TowerVisualPoint>;
  sourceSpriteSize?: TowerVisualSize;
  targetSpriteSize?: TowerVisualSize;
  rotationDegrees?: number;
}

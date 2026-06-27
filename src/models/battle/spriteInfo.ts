import type { TowerVisualSize } from "./towerVisual.ts";

export interface SpriteInfo {
  textureKey: string;        // TODO: supply via your asset loader
  animated?: boolean;
  animationFrames?: string[]; // TODO: atlas frame keys
  fps?: number;
  targetSpriteSize?: TowerVisualSize;
  rotationDegrees?: number;
}

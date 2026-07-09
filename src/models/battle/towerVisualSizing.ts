import type { TowerVisualSize } from './towerVisual.ts';

export interface TowerVisualSizingMetadata {
  sourceSpriteSize: TowerVisualSize;
  zoom: number;
}

export function getTowerVisualRenderedSize(metadata: TowerVisualSizingMetadata): TowerVisualSize {
  return {
    width: metadata.sourceSpriteSize.width * metadata.zoom,
    height: metadata.sourceSpriteSize.height * metadata.zoom,
  };
}

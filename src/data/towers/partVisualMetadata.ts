import medievalBarrelSlingCrudeBaseMetadata from '../../assets/battle/gunParts/medieval/medieval_barrel_sling-crude-base.json';
import medievalBarrelSlingCrudeBaseUrl from '../../assets/battle/gunParts/medieval/medieval_barrel_sling-crude-base.png';
import type { TowerPartVisualMetadata } from '../../models/battle/towerPartVisualMetadata.ts';
import type { TowerVisualPoint, TowerVisualSize } from '../../models/battle/towerVisual.ts';

export interface TowerPartVisualAsset {
  metadata: TowerPartVisualMetadata;
  src: string;
}

function scalePoint(
  point: TowerVisualPoint,
  sourceSpriteSize: TowerVisualSize,
  targetSpriteSize: TowerVisualSize
): TowerVisualPoint {
  return {
    x: (point.x - sourceSpriteSize.width / 2) * (targetSpriteSize.width / sourceSpriteSize.width),
    y: (point.y - sourceSpriteSize.height / 2) * (targetSpriteSize.height / sourceSpriteSize.height),
  };
}

function normalizeMetadata(metadata: TowerPartVisualMetadata): TowerPartVisualMetadata {
  if (!metadata.sourceSpriteSize || !metadata.targetSpriteSize) return metadata;

  return {
    ...metadata,
    inputSocket: scalePoint(metadata.inputSocket, metadata.sourceSpriteSize, metadata.targetSpriteSize),
    outputSockets: Object.fromEntries(
      Object.entries(metadata.outputSockets).map(([socketName, point]) => [
        socketName,
        scalePoint(point, metadata.sourceSpriteSize!, metadata.targetSpriteSize!),
      ])
    ),
  };
}

export const TOWER_PART_VISUAL_ASSETS: Record<string, TowerPartVisualAsset> = {
  [medievalBarrelSlingCrudeBaseMetadata.id]: {
    metadata: normalizeMetadata(medievalBarrelSlingCrudeBaseMetadata),
    src: medievalBarrelSlingCrudeBaseUrl,
  },
};

export const TOWER_PART_VISUAL_METADATA = Object.fromEntries(
  Object.entries(TOWER_PART_VISUAL_ASSETS).map(([partId, asset]) => [partId, asset.metadata])
) as Record<string, TowerPartVisualMetadata>;

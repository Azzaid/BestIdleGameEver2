import type { TowerPartVisualMetadata } from '../../models/battle/towerPartVisualMetadata.ts';
import type { TowerVisualPoint, TowerVisualSize } from '../../models/battle/towerVisual.ts';
import { getTowerVisualRenderedSize } from '../../models/battle/towerVisualSizing.ts';
import type { SpriteAsset } from '../../models/sprites/SpriteAtlas.ts';
import {ENTITY_VISUAL_ASSETS, type GunPartVisualAssetOption} from "../entityVisualAssets.ts";

export type TowerPartVisualAsset = SpriteAsset<TowerPartVisualMetadata> & {
  metadata: TowerPartVisualMetadata;
};

function scalePoint(
  point: TowerVisualPoint,
  sourceSpriteSize: TowerVisualSize,
  renderedSize: TowerVisualSize
): TowerVisualPoint {
  return {
    x: (point.x - sourceSpriteSize.width / 2) * (renderedSize.width / sourceSpriteSize.width),
    y: (point.y - sourceSpriteSize.height / 2) * (renderedSize.height / sourceSpriteSize.height),
  };
}

function rotatePoint(point: TowerVisualPoint, rotationDegrees = 0): TowerVisualPoint {
  const radians = rotationDegrees * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  };
}

function normalizePoint(
  point: TowerVisualPoint,
  sourceSpriteSize: TowerVisualSize,
  renderedSize: TowerVisualSize,
  rotationDegrees = 0
): TowerVisualPoint {
  return rotatePoint(scalePoint(point, sourceSpriteSize, renderedSize), rotationDegrees);
}

function normalizeMetadata(metadata: TowerPartVisualMetadata): TowerPartVisualMetadata {
  const renderedSize = getTowerVisualRenderedSize(metadata);

  return {
    ...metadata,
    inputSocket: normalizePoint(
      metadata.inputSocket,
      metadata.sourceSpriteSize,
      renderedSize,
      metadata.rotationDegrees
    ),
    outputSockets: Object.fromEntries(
      Object.entries(metadata.outputSockets).map(([socketName, point]) => [
        socketName,
        normalizePoint(point, metadata.sourceSpriteSize, renderedSize, metadata.rotationDegrees),
      ])
    ),
  };
}

export const TOWER_PART_VISUAL_ASSETS: Record<string, TowerPartVisualAsset> = Object.fromEntries(
  ENTITY_VISUAL_ASSETS
    .filter((asset): asset is GunPartVisualAssetOption => asset.kind === "gunPart")
    .map(asset => [
      asset.id,
      {
        metadata: normalizeMetadata(asset.metadata),
        src: asset.src,
      },
    ]),
) as Record<string, TowerPartVisualAsset>;

export const TOWER_PART_VISUAL_METADATA = Object.fromEntries(
  Object.entries(TOWER_PART_VISUAL_ASSETS).map(([partId, asset]) => [partId, asset.metadata])
) as Record<string, TowerPartVisualMetadata>;

import medievalBaseCrudeWoodMetadata from '../../assets/battle/towerParts/medieval/medieval_base_crude-wood.json';
import medievalBaseCrudeWoodUrl from '../../assets/battle/towerParts/medieval/medieval_base_crude-wood.png';
import medievalAmmoCrudeStoneMetadata from '../../assets/battle/towerParts/medieval/medieval_ammo_crude-stone.json';
import medievalAmmoCrudeStoneUrl from '../../assets/battle/towerParts/medieval/medieval_ammo_crude-stone.png';
import medievalLauncherCrudeSlingMetadata from '../../assets/battle/towerParts/medieval/medieval_launcher_crude-sling.json';
import medievalLauncherCrudeSlingUrl from '../../assets/battle/towerParts/medieval/medieval_launcher_crude-sling.png';
import type { TowerPartVisualMetadata } from '../../models/battle/towerPartVisualMetadata.ts';
import type { TowerVisualPoint, TowerVisualSize } from '../../models/battle/towerVisual.ts';
import type { SpriteAsset } from '../../models/sprites/SpriteAtlas.ts';
import { gunparts } from '../identificators/index.ts';

export type TowerPartVisualAsset = SpriteAsset<TowerPartVisualMetadata> & {
  metadata: TowerPartVisualMetadata;
};

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
  targetSpriteSize: TowerVisualSize,
  rotationDegrees = 0
): TowerVisualPoint {
  return rotatePoint(scalePoint(point, sourceSpriteSize, targetSpriteSize), rotationDegrees);
}

function normalizeMetadata(metadata: TowerPartVisualMetadata): TowerPartVisualMetadata {
  if (!metadata.sourceSpriteSize || !metadata.targetSpriteSize) return metadata;

  return {
    ...metadata,
    inputSocket: normalizePoint(
      metadata.inputSocket,
      metadata.sourceSpriteSize,
      metadata.targetSpriteSize,
      metadata.rotationDegrees
    ),
    outputSockets: Object.fromEntries(
      Object.entries(metadata.outputSockets).map(([socketName, point]) => [
        socketName,
        normalizePoint(point, metadata.sourceSpriteSize!, metadata.targetSpriteSize!, metadata.rotationDegrees),
      ])
    ),
  };
}

export const TOWER_PART_VISUAL_ASSETS: Record<string, TowerPartVisualAsset> = {
  [gunparts.bases.medieval.crudeWoodFrame]: {
    metadata: normalizeMetadata(medievalBaseCrudeWoodMetadata),
    src: medievalBaseCrudeWoodUrl,
  },
  [gunparts.ammo.medieval.stoneBasket]: {
    metadata: normalizeMetadata(medievalAmmoCrudeStoneMetadata),
    src: medievalAmmoCrudeStoneUrl,
  },
  [gunparts.launchSystems.medieval.crudeSling]: {
    metadata: normalizeMetadata(medievalLauncherCrudeSlingMetadata),
    src: medievalLauncherCrudeSlingUrl,
  },
};

export const TOWER_PART_VISUAL_METADATA = Object.fromEntries(
  Object.entries(TOWER_PART_VISUAL_ASSETS).map(([partId, asset]) => [partId, asset.metadata])
) as Record<string, TowerPartVisualMetadata>;

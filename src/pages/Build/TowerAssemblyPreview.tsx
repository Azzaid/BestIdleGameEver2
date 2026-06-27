import { Application, Container, Sprite, Texture, TilingSprite } from 'pixi.js';
import { useEffect, useMemo, useRef } from 'react';
import type { TowerAssemblyPreviewProps } from '../../models/build/towerAssemblyPreview.ts';
import { createTowerVisualDefinitionFromAssembly } from '../../data/gunParts/visuals.ts';
import { loadBattleAssets } from '../Battle/assets/assetLoader.ts';
import { buildTowerVisualContainer } from '../Battle/factories/towerVisualRenderer.ts';
import { INITIAL_TOWER_AIM_RADIANS } from '../../models/battle/tower.ts';
import { DEVELOPMENT_VECTORS } from '../../models/DevlopmentVector.ts';
import { wallSpriteMetadataAtlas } from '../../models/sprites/walls/wallsSpriteAtlas.ts';
import { wallTopSpriteMetadataAtlas } from '../../models/sprites/wallTops/wallTopSpriteAtlas.ts';
import { superstructures, walls } from '../../data/ids.ts';
import type { BattleWallSegment } from '../../models/battle/wallSegment.ts';
import { CITY_HEX_SIZE } from '../../data/constants.ts';
import { DEFAULT_BATTLE_BACKGROUND_ID } from '../../models/battle/backgrounds.ts';
import { BATTLE_BACKGROUNDS } from '../Battle/assets/backgrounds.ts';

const previewWallSegment: BattleWallSegment = {
  cellKey: 'tower-preview-wall',
  wallKey: walls.medieval.scrapBarricade,
  wallDevelopmentVector: DEVELOPMENT_VECTORS.medieval,
  wallTopKey: superstructures.medieval.oldStump,
  wallTopDevelopmentVector: DEVELOPMENT_VECTORS.medieval,
};

const wallMetadata = wallSpriteMetadataAtlas[DEVELOPMENT_VECTORS.medieval][walls.medieval.scrapBarricade];
const wallTopMetadata = wallTopSpriteMetadataAtlas[DEVELOPMENT_VECTORS.medieval][superstructures.medieval.oldStump];
const previewSegmentSize = 190;
const previewCityToBattleScale = previewSegmentSize / CITY_HEX_SIZE;

function createMountedTowerPreview(towerVisualDefinition: ReturnType<typeof createTowerVisualDefinitionFromAssembly>) {
  const scene = new Container();
  scene.sortableChildren = true;

  const wall = new Sprite(Texture.from(walls.medieval.scrapBarricade));
  wall.anchor.set(0.5);
  wall.width = wallMetadata.targetSpriteSize.width * previewCityToBattleScale;
  wall.height = wallMetadata.targetSpriteSize.height * previewCityToBattleScale;
  wall.position.set(0, 0);
  wall.zIndex = 1;
  scene.addChild(wall);

  const towerBase = new Sprite(Texture.from(superstructures.medieval.oldStump));
  towerBase.anchor.set(0.5);
  towerBase.width = wallTopMetadata.targetSpriteSize.width * previewCityToBattleScale;
  towerBase.height = wallTopMetadata.targetSpriteSize.height * previewCityToBattleScale;
  towerBase.position.set(0, 0);
  towerBase.zIndex = 2;
  scene.addChild(towerBase);

  const { container: tower } = buildTowerVisualContainer(towerVisualDefinition);
  tower.position.set(0, 0);
  tower.rotation = INITIAL_TOWER_AIM_RADIANS;
  tower.scale.set(1.35);
  tower.zIndex = 3;
  scene.addChild(tower);

  return scene;
}

export function TowerAssemblyPreview({ resolvedTower }: TowerAssemblyPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const towerVisualDefinition = useMemo(
    () => createTowerVisualDefinitionFromAssembly(resolvedTower),
    [resolvedTower]
  );

  useEffect(() => {
    const hostElement = hostRef.current;
    if (!hostElement) return;

    let disposed = false;
    let app: Application | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const mountPreview = async () => {
      const initialWidth = Math.max(1, hostElement.clientWidth);
      const initialHeight = Math.max(1, hostElement.clientHeight);

      const previewApp = new Application();
      await previewApp.init({
        width: initialWidth,
        height: initialHeight,
        backgroundAlpha: 0,
        antialias: true,
      });

      if (disposed) {
        previewApp.destroy(true);
        return;
      }

      app = previewApp;
      hostElement.appendChild(previewApp.canvas);
      await loadBattleAssets({
        backgroundId: DEFAULT_BATTLE_BACKGROUND_ID,
        wallSegments: [previewWallSegment],
      });

      if (disposed || !app) return;

      app.stage.sortableChildren = true;

      const backgroundDefinition = BATTLE_BACKGROUNDS[DEFAULT_BATTLE_BACKGROUND_ID];
      const background = new TilingSprite({
        texture: Texture.from(backgroundDefinition.textureAlias),
        width: app.renderer.width,
        height: app.renderer.height,
      });
      background.zIndex = -10;
      app.stage.addChild(background);

      const scene = createMountedTowerPreview(towerVisualDefinition);
      scene.zIndex = 1;
      app.stage.addChild(scene);

      const resizePreview = () => {
        if (!app) return;
        const width = Math.max(1, hostElement.clientWidth);
        const height = Math.max(1, hostElement.clientHeight);
        const scale = Math.min(1.8, Math.max(1.25, Math.min(width / 320, height / 300) * 1.5));

        app.renderer.resize(width, height);
        background.width = width;
        background.height = height;
        background.tileScale.set(scale * 0.45);
        background.tilePosition.set(width * 0.08, height * 0.1);
        scene.position.set(width / 2, height * 0.6);
        scene.scale.set(scale);
      };

      resizePreview();
      resizeObserver = new ResizeObserver(resizePreview);
      resizeObserver.observe(hostElement);
    };

    void mountPreview();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      if (app) {
        app.destroy(true, { children: true, texture: false, textureSource: false, context: true });
      }
    };
  }, [towerVisualDefinition]);

  return <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} aria-label="Tower assembly preview" />;
}

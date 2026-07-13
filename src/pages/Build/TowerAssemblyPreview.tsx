import { Application, Container } from 'pixi.js';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import type { TowerAssemblyPreviewProps } from '../../models/build/towerAssemblyPreview.ts';
import { createTowerVisualDefinitionFromAssembly } from '../../data/gunParts/visuals.ts';
import { loadBattleAssets } from '../Battle/assets/assetLoader.ts';
import { buildTowerVisualContainer } from '../Battle/factories/towerVisualRenderer.ts';
import { INITIAL_TOWER_AIM_RADIANS } from '../../models/battle/tower.ts';
import { CITY_HEX_WIDTH } from '../../data/constants.ts';
import {
  createBattlefieldTerrainLayer,
  createBattleWallLayer,
} from '../Battle/ui/BattleStage.tsx';

function createMountedTowerPreview(
  towerVisualDefinition: ReturnType<typeof createTowerVisualDefinitionFromAssembly>,
  towerWorldPosition: { x: number; y: number },
) {
  const scene = new Container();
  scene.sortableChildren = true;

  const { container: tower } = buildTowerVisualContainer(towerVisualDefinition);
  tower.position.set(towerWorldPosition.x, towerWorldPosition.y);
  tower.rotation = INITIAL_TOWER_AIM_RADIANS;
  tower.scale.set(1.35);
  tower.zIndex = 30;
  scene.addChild(tower);

  return scene;
}

function getPreviewZoom(width: number) {
  return Math.max(0.1, width / CITY_HEX_WIDTH);
}

export function TowerAssemblyPreview({
  resolvedTower,
  wallSegments,
  terrainHexes,
  towerWorldPosition,
  wallY,
}: TowerAssemblyPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldLayerRef = useRef<Container | null>(null);
  const towerSceneRef = useRef<Container | null>(null);
  const resizePreviewRef = useRef<(() => void) | null>(null);
  const towerWorldPositionRef = useRef(towerWorldPosition);
  const towerVisualDefinition = useMemo(
    () => createTowerVisualDefinitionFromAssembly(resolvedTower),
    [resolvedTower]
  );
  const towerVisualDefinitionRef = useRef(towerVisualDefinition);

  towerWorldPositionRef.current = towerWorldPosition;
  towerVisualDefinitionRef.current = towerVisualDefinition;

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
        wallSegments,
        terrainHexes,
      });

      if (disposed || !app) return;

      app.stage.sortableChildren = true;

      const worldLayer = new Container();
      worldLayer.sortableChildren = true;
      app.stage.addChild(worldLayer);

      const terrainLayer = createBattlefieldTerrainLayer(terrainHexes);
      terrainLayer.zIndex = -100;
      worldLayer.addChild(terrainLayer);

      const wallLayer = createBattleWallLayer({
        wallSegments,
        wallY,
        segmentSize: CITY_HEX_WIDTH,
        battlefieldWidth: Math.max(1, wallSegments.length) * CITY_HEX_WIDTH,
      });
      wallLayer.zIndex = 15;
      worldLayer.addChild(wallLayer);

      worldLayerRef.current = worldLayer;
      replaceTowerPreview(
        worldLayer,
        towerSceneRef,
        towerVisualDefinitionRef.current,
        towerWorldPositionRef.current,
      );

      const resizePreview = () => {
        if (!app) return;
        const width = Math.max(1, hostElement.clientWidth);
        const height = Math.max(1, hostElement.clientHeight);
        const scale = getPreviewZoom(width);
        const towerScreenY = height * 0.58;
        const currentTowerWorldPosition = towerWorldPositionRef.current;

        app.renderer.resize(width, height);
        worldLayer.position.set(
          width / 2 - currentTowerWorldPosition.x * scale,
          towerScreenY - currentTowerWorldPosition.y * scale,
        );
        worldLayer.scale.set(scale);
      };

      resizePreview();
      resizePreviewRef.current = resizePreview;
      resizeObserver = new ResizeObserver(resizePreview);
      resizeObserver.observe(hostElement);
    };

    void mountPreview();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      worldLayerRef.current = null;
      towerSceneRef.current = null;
      resizePreviewRef.current = null;
      if (app) {
        app.destroy(true, { children: true, texture: false, textureSource: false, context: true });
      }
    };
  }, [terrainHexes, wallSegments, wallY]);

  useEffect(() => {
    const worldLayer = worldLayerRef.current;
    if (!worldLayer) return;

    replaceTowerPreview(
      worldLayer,
      towerSceneRef,
      towerVisualDefinition,
      towerWorldPosition,
    );
    resizePreviewRef.current?.();
  }, [towerVisualDefinition, towerWorldPosition]);

  return <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} aria-label="Tower assembly preview" />;
}

function replaceTowerPreview(
  worldLayer: Container,
  towerSceneRef: MutableRefObject<Container | null>,
  towerVisualDefinition: ReturnType<typeof createTowerVisualDefinitionFromAssembly>,
  towerWorldPosition: { x: number; y: number },
) {
  const previousScene = towerSceneRef.current;
  if (previousScene) {
    worldLayer.removeChild(previousScene);
    previousScene.destroy({ children: true });
  }

  const scene = createMountedTowerPreview(towerVisualDefinition, towerWorldPosition);
  scene.zIndex = 30;
  worldLayer.addChild(scene);
  towerSceneRef.current = scene;
}

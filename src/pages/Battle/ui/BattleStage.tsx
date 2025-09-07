import * as PIXI from 'pixi.js';
import { useEffect, useRef } from 'react';
import { createWorld, createEntityId } from '../core/world';
import { runSystems } from '../systems/runSystems';
import { createCamera, computeMinZoomForWall, zoomAtScreenPoint, applyCameraTransform, setCameraScale } from '../core/camera';
import { loadBattleAssets } from '../assets/assetLoader';

/** Drop-in React component hosting the battle canvas.
 */
export function BattleStage(props: {
  wallLogicalWidth: number;   // TODO: derive from city hex row width (Redux)
  battlefieldWidth: number;   // TODO: logical width in world units
  battlefieldHeight: number;  // TODO: logical height in world units
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new PIXI.Application({
      resizeTo: hostRef.current!,
      backgroundColor: 0x0b0e13,
      antialias: true,
      powerPreference: 'high-performance',
    });
    hostRef.current!.appendChild(app.view as HTMLCanvasElement);

    // Load assets (noop by default)
    loadBattleAssets();

    const viewportWidth = app.renderer.width;
    const viewportHeight = app.renderer.height;
    const minZoom = computeMinZoomForWall({ wallLogicalWidth: props.wallLogicalWidth, viewportWidth });
    const camera = createCamera({
      worldWidth: props.battlefieldWidth,
      worldHeight: props.battlefieldHeight,
      viewportWidth,
      viewportHeight,
      minZoom,
      maxZoom: 2.0, // 32->64 limit
    });
    app.stage.addChild(camera.container);

    const world = createWorld({
      battlefieldWidth: props.battlefieldWidth,
      battlefieldHeight: props.battlefieldHeight,
      wallY: props.battlefieldHeight - 40, // TODO: align with visual wall
      app,
    });
    camera.container.addChild(world.worldLayer);

    // Tower with target hold
    const baseId = createEntityId(world);
    const gunId = createEntityId(world);
    world.transforms.set(baseId, { position: { x: props.battlefieldWidth / 2, y: props.battlefieldHeight - 80 }, rotationRadians: 0 });
    world.transforms.set(gunId,  { position: { x: props.battlefieldWidth / 2, y: props.battlefieldHeight - 80 }, rotationRadians: 0 });
    world.towersData.set(baseId, {
      rotationSpeed: 3.2,
      reloadSpeed: 1.5,
      burstCount: 1,
      projectileDamage: 18,
      projectileSpeed: 520,
      aoeRadius: 0,
      keywords: new Set(['projectile']),
      targetingDistanceLimit: 360,
      rangePixels: 320,
      currentTarget: undefined,
      gunEntity: gunId,
      targetingStrategyKey: 'medieval', // TODO: choose per vector
      retargetCooldownSeconds: 0.35,
      retargetRemainingSeconds: 0,
    });

    let prev = performance.now();
    app.ticker.add(() => {
      const now = performance.now();
      const dt = Math.min(0.25, (now - prev) / 1000);
      prev = now;
      runSystems(world, dt);
    });

    // Camera input
    const view = app.view as HTMLCanvasElement;
    let dragging = false;
    let dragStart = { x: 0, y: 0 };
    let camStart = { x: 0, y: 0 };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = view.getBoundingClientRect();
      zoomAtScreenPoint(camera, e.clientX - rect.left, e.clientY - rect.top, e.deltaY);
    };
    const down = (e: PointerEvent) => {
      dragging = true;
      const rect = view.getBoundingClientRect();
      dragStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      camStart = { x: camera.position.x, y: camera.position.y };
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const rect = view.getBoundingClientRect();
      const dx = (e.clientX - rect.left) - dragStart.x;
      const dy = (e.clientY - rect.top) - dragStart.y;
      camera.position.x = camStart.x - dx / camera.scale;
      camera.position.y = camStart.y - dy / camera.scale;
      applyCameraTransform(camera);
    };
    const up = () => { dragging = false; };

    view.addEventListener('wheel', wheel, { passive: false });
    view.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    const onResize = () => {
      const vw = app.renderer.width;
      const vh = app.renderer.height;
      camera.config.viewportWidth = vw;
      camera.config.viewportHeight = vh;
      camera.config.minZoom = computeMinZoomForWall({ wallLogicalWidth: props.wallLogicalWidth, viewportWidth: vw });
      setCameraScale(camera, camera.scale);
      applyCameraTransform(camera);
    };
    app.renderer.on('resize', onResize);

    return () => {
      view.removeEventListener('wheel', wheel);
      view.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      app.destroy(true, { children: true, texture: true, baseTexture: true });
    };
  }, [props.wallLogicalWidth, props.battlefieldWidth, props.battlefieldHeight]);

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
}

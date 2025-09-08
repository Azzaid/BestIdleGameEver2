import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';
import { createWorld, createEntityId } from '../core/world';
import { runSystems } from '../systems/runSystems';
import {
    createCamera,
    computeMinZoomForWall,
    zoomAtScreenPoint,
    applyCameraTransform,
    setCameraScale,
} from '../core/camera';
import { loadBattleAssets } from '../assets/assetLoader';

/** Drop-in React component hosting the battle canvas (Pixi v8). */
export function BattleStage(props: {
    wallLogicalWidth: number;   // TODO: derive from city hex row width (Redux)
    battlefieldWidth: number;   // TODO: logical width in world units
    battlefieldHeight: number;  // TODO: logical height in world units
}) {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let app: Application | null = null;

        (async () => {
            app = new Application();

            // v8: init() is async; use canvas via app.canvas; resize plugin via resizeTo.
            await app.init({
                resizeTo: hostRef.current!,               // auto-resize to the host <div>
                backgroundColor: 0x0b0e13,
                antialias: true,
                webgl: { powerPreference: 'high-performance' }, // was powerPreference in v7
            }); // :contentReference[oaicite:0]{index=0}

            hostRef.current!.appendChild(app.canvas);

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
                retargetCooldownSeconds: 0.35,
                retargetRemainingSeconds: 0,
                aimKeywords: ['closestToWall'],
            });

            // Ticker stays the same in v8 (TickerPlugin is built-in)
            let previousTimeMs = performance.now();
            app.ticker.add(() => {
                const nowMs = performance.now();
                const dt = Math.min(0.25, (nowMs - previousTimeMs) / 1000);
                previousTimeMs = nowMs;
                runSystems(world, dt);
            }); // :contentReference[oaicite:1]{index=1}

            // Camera input
            const canvas = app.canvas;
            let isDragging = false;
            let dragStartScreen = { x: 0, y: 0 };
            let cameraStartWorld = { x: 0, y: 0 };

            const onWheel = (e: WheelEvent) => {
                e.preventDefault();
                const rect = canvas.getBoundingClientRect();
                zoomAtScreenPoint(camera, e.clientX - rect.left, e.clientY - rect.top, e.deltaY);
            };

            const onPointerDown = (e: PointerEvent) => {
                isDragging = true;
                const rect = canvas.getBoundingClientRect();
                dragStartScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                cameraStartWorld = { x: camera.position.x, y: camera.position.y };
            };

            const onPointerMove = (e: PointerEvent) => {
                if (!isDragging) return;
                const rect = canvas.getBoundingClientRect();
                const deltaX = (e.clientX - rect.left) - dragStartScreen.x;
                const deltaY = (e.clientY - rect.top) - dragStartScreen.y;
                camera.position.x = cameraStartWorld.x - deltaX / camera.scale;
                camera.position.y = cameraStartWorld.y - deltaY / camera.scale;
                applyCameraTransform(camera);
            };

            const onPointerUp = () => { isDragging = false; };

            canvas.addEventListener('wheel', onWheel, { passive: false });
            canvas.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);

            // v8 renderer still emits 'resize'
            const onResize = () => {
                const vw = app!.renderer.width;
                const vh = app!.renderer.height;
                camera.config.viewportWidth = vw;
                camera.config.viewportHeight = vh;
                camera.config.minZoom = computeMinZoomForWall({ wallLogicalWidth: props.wallLogicalWidth, viewportWidth: vw });
                setCameraScale(camera, camera.scale);
                applyCameraTransform(camera);
            };
            app.renderer.on('resize', onResize); // :contentReference[oaicite:2]{index=2}
        })();

        return () => {
            if (!app) return;
            const canvas = app.canvas;
            canvas.removeEventListener('wheel', () => {});
            canvas.removeEventListener('pointerdown', () => {});
            window.removeEventListener('pointermove', () => {});
            window.removeEventListener('pointerup', () => {});
            // v8 destroy accepts boolean or options object
            app.destroy({ children: true, texture: true, textureSource: true, context: true }); // :contentReference[oaicite:3]{index=3}
        };
    }, [props.wallLogicalWidth, props.battlefieldWidth, props.battlefieldHeight, hostRef.current]);

    return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
}

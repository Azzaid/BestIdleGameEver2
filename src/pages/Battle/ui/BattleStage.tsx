import { Application, Container, Graphics } from 'pixi.js';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import type { TowerAssemblyResolved } from '../../../models/battle/towerParts.ts';
import { buildTowerVisualContainer } from '../factories/towerVisualRenderer.ts';
import { createTowerVisualDefinitionFromAssembly } from '../../../data/towers/visuals.ts';
import type { BattleMetrics, BattleResult } from '../../../models/battle/world.ts';

/** Drop-in React component hosting the battle canvas (Pixi v8). */
export function BattleStage(props: {
    wallLogicalWidth: number;   // TODO: derive from city hex row width (Redux)
    battlefieldWidth: number;   // TODO: logical width in world units
    battlefieldHeight: number;  // TODO: logical height in world units
    wallY: number;
    resolvedTower: TowerAssemblyResolved;
    initialThreat: number;
    targetThreat: number;
    threatGrowthPerSecond: number;
    completesWhenThreatTargetReached: boolean;
    wallResilience: number;
    wallIgnoredThreat: number;
    onBattleMetrics?: (metrics: BattleMetrics) => void;
    onBattleEnded?: (result: BattleResult) => void;
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hostRef = useRef<HTMLDivElement>(null);
    const aspectRatio = props.battlefieldWidth / props.battlefieldHeight;
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const updateCanvasSize = () => {
            const { width, height } = wrapper.getBoundingClientRect();
            if (width <= 0 || height <= 0) return;

            const heightLimitedWidth = height * aspectRatio;
            if (heightLimitedWidth <= width) {
                setCanvasSize({ width: heightLimitedWidth, height });
                return;
            }

            setCanvasSize({ width, height: width / aspectRatio });
        };

        updateCanvasSize();
        const resizeObserver = new ResizeObserver(updateCanvasSize);
        resizeObserver.observe(wrapper);

        return () => {
            resizeObserver.disconnect();
        };
    }, [aspectRatio]);

    const hostStyle = useMemo(() => ({
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`,
    }), [canvasSize.height, canvasSize.width]);

    useEffect(() => {
        let app: Application | null = null;
        let cleanupInput = () => {};
        let cleanupResize = () => {};

        (async () => {
            if (!hostRef.current || canvasSize.width <= 0 || canvasSize.height <= 0) return;

            app = new Application();

            // v8: init() is async; use canvas via app.canvas; resize plugin via resizeTo.
            await app.init({
                resizeTo: hostRef.current,               // auto-resize to the host <div>
                backgroundColor: 0x0b0e13,
                antialias: true,
                webgl: { powerPreference: 'high-performance' }, // was powerPreference in v7
            }); // :contentReference[oaicite:0]{index=0}

            hostRef.current.appendChild(app.canvas);

            // Load assets (noop by default)
            await loadBattleAssets();

            const viewportWidth = app.renderer.width;
            const viewportHeight = app.renderer.height;
            const minZoom = computeMinZoomForWall({
                wallLogicalWidth: props.wallLogicalWidth,
                viewportWidth,
                battlefieldHeight: props.battlefieldHeight,
                viewportHeight,
            });

            const camera = createCamera({
                worldWidth: props.battlefieldWidth,
                worldHeight: props.battlefieldHeight,
                viewportWidth,
                viewportHeight,
                minZoom,
                maxZoom: minZoom * 2,
            });
            camera.position.y = props.battlefieldHeight - viewportHeight / camera.scale;
            applyCameraTransform(camera);
            app.stage.addChild(camera.container);

            const wallY = props.wallY;
            const world = createWorld({
                battlefieldWidth: props.battlefieldWidth,
                battlefieldHeight: props.battlefieldHeight,
                wallY,
                app,
                initialThreat: props.initialThreat,
                targetThreat: props.targetThreat,
                threatGrowthPerSecond: props.threatGrowthPerSecond,
                completesWhenThreatTargetReached: props.completesWhenThreatTargetReached,
                wallResilience: props.wallResilience,
                wallIgnoredThreat: props.wallIgnoredThreat,
                onBattleMetrics: props.onBattleMetrics,
                onBattleEnded: props.onBattleEnded,
            });
            camera.container.addChild(world.worldLayer);

            const fullBoundsPlaceholder = new Graphics();
            fullBoundsPlaceholder
                .rect(0, 0, props.battlefieldWidth, props.battlefieldHeight)
                .stroke({ color: 0x45d0ff, width: 3 });
            fullBoundsPlaceholder.zIndex = 200;
            world.worldLayer.addChild(fullBoundsPlaceholder);

            const activeBattlefieldPlaceholder = new Graphics();
            activeBattlefieldPlaceholder
                .rect(0, 0, props.battlefieldWidth, wallY)
                .stroke({ color: 0xffd166, width: 2 });
            activeBattlefieldPlaceholder.zIndex = 201;
            world.worldLayer.addChild(activeBattlefieldPlaceholder);

            const wallPlaceholder = new Graphics();
            wallPlaceholder
                .rect(0, wallY - 8, props.battlefieldWidth, 16)
                .fill(0x6f7787)
                .stroke({ color: 0xd9e2ff, width: 2 });
            wallPlaceholder.zIndex = 15;
            world.worldLayer.addChild(wallPlaceholder);

            // Tower with target hold
            const baseId = createEntityId(world);
            const gunId = createEntityId(world);
            world.transforms.set(baseId, { position: { x: props.battlefieldWidth / 2, y: wallY }, rotationRadians: 0 });
            world.transforms.set(gunId,  { position: { x: props.battlefieldWidth / 2, y: wallY }, rotationRadians: -Math.PI / 2 });
            const towerVisual = buildTowerVisualContainer(
                createTowerVisualDefinitionFromAssembly(props.resolvedTower),
                { warn: () => {} }
            );
            towerVisual.container.zIndex = 30;
            world.worldLayer.addChild(towerVisual.container);
            world.sprites.set(baseId, towerVisual.container);

            const gunAimPivot = new Container();
            world.worldLayer.addChild(gunAimPivot);
            world.sprites.set(gunId, gunAimPivot);

            world.towersData.set(baseId, {
                rotationSpeed: props.resolvedTower.stats.rotationSpeed,
                reloadSpeed: props.resolvedTower.stats.reloadSpeed,
                burstCount: props.resolvedTower.stats.burstCount,
                projectileDamage: props.resolvedTower.stats.projectileDamage,
                projectileSpeed: props.resolvedTower.stats.projectileSpeed,
                aoeRadius: props.resolvedTower.stats.aoeRadius,
                keywords: new Set(props.resolvedTower.keywords),
                targetingDistanceLimit: props.resolvedTower.stats.targetingDistanceLimit,
                rangePixels: props.resolvedTower.stats.targetingDistanceLimit,
                currentTarget: undefined,
                gunEntity: gunId,
                retargetCooldownSeconds: props.resolvedTower.stats.retargetCooldownSeconds,
                retargetRemainingSeconds: 0,
                aimKeywords: props.resolvedTower.aimKeywords,
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
            cleanupInput = () => {
                canvas.removeEventListener('wheel', onWheel);
                canvas.removeEventListener('pointerdown', onPointerDown);
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            };

            // v8 renderer still emits 'resize'
            const onResize = () => {
                const vw = app!.renderer.width;
                const vh = app!.renderer.height;
                camera.config.viewportWidth = vw;
                camera.config.viewportHeight = vh;
                camera.config.minZoom = computeMinZoomForWall({
                    wallLogicalWidth: props.wallLogicalWidth,
                    viewportWidth: vw,
                    battlefieldHeight: props.battlefieldHeight,
                    viewportHeight: vh,
                });
                camera.config.maxZoom = camera.config.minZoom * 2;
                setCameraScale(camera, camera.scale);
                applyCameraTransform(camera);
            };
            app.renderer.on('resize', onResize); // :contentReference[oaicite:2]{index=2}
            cleanupResize = () => {
                app?.renderer.off('resize', onResize);
            };
        })();

        return () => {
            cleanupInput();
            cleanupResize();
            if (!app) return;

            app.destroy(true, { children: true, texture: true, textureSource: true, context: true }); // :contentReference[oaicite:3]{index=3}
        };
    }, [
        canvasSize.height,
        canvasSize.width,
        props.wallLogicalWidth,
        props.battlefieldWidth,
        props.battlefieldHeight,
        props.wallY,
        props.resolvedTower,
        props.initialThreat,
        props.targetThreat,
        props.threatGrowthPerSecond,
        props.completesWhenThreatTargetReached,
        props.wallResilience,
        props.wallIgnoredThreat,
        props.onBattleMetrics,
        props.onBattleEnded,
    ]);

    return (
        <div ref={wrapperRef} style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
            <div ref={hostRef} style={hostStyle} />
        </div>
    );
}

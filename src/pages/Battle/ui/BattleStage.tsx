import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
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
import type { TowerAssemblyResolved, TowerStatsResolved } from '../../../models/battle/towerParts.ts';
import type { TowerDamageProfiles } from '../../../models/battle/damage.ts';
import { buildTowerVisualContainer } from '../factories/towerVisualRenderer.ts';
import { createTowerVisualDefinitionFromAssembly, findTowerVisualSocketOffset } from '../../../data/gunParts/visuals.ts';
import type { BattleMetrics, BattleResult, MonsterMovementModifiers, WallZoneEffects } from '../../../models/battle/world.ts';
import type { BattleWallSegment } from '../../../models/battle/wallSegment.ts';
import type { StandaloneTowerDefense, TowerData } from '../../../models/battle/tower.ts';
import { CITY_HEX_RADIUS, CITY_HEX_WIDTH } from '../../../data/constants.ts';
import { wallSpriteMetadataAtlas } from '../../../models/sprites/walls/wallsSpriteAtlas.ts';
import { wallTopSpriteMetadataAtlas } from '../../../models/sprites/wallTops/wallTopSpriteAtlas.ts';
import { getWallContactY } from '../core/wallGeometry.ts';
import { WALL_SEGMENT_BUILDINGS } from '../../../data/wallSegments/index.ts';
import { WALL_SUPERSTRUCTURE_BUILDINGS } from '../../../data/wallSuperstructures/index.ts';
import type { BattlefieldTerrainHex } from '../../../models/battle/battlefieldTerrain.ts';

/** Drop-in React component hosting the battle canvas (Pixi v8). */
export function BattleStage(props: {
    wallLogicalWidth: number;   // TODO: derive from city hex row width (Redux)
    wallSegments: BattleWallSegment[];
    terrainHexes: BattlefieldTerrainHex[];
    standaloneTowerDefenses: StandaloneTowerDefense[];
    battlefieldWidth: number;   // TODO: logical width in world units
    battlefieldHeight: number;  // TODO: logical height in world units
    wallY: number;
    resolvedTowers: TowerAssemblyResolved[];
    initialThreat: number;
    targetThreat: number;
    threatGrowthPerSecond: number;
    waveThreatToCityThreatRatio: number;
    simultaneousMonstersLimit: number;
    timeBetweenWavesSeconds: number;
    fastForwardWavesWhenCleared: boolean;
    completesWhenThreatTargetReached: boolean;
    wallResilience: number;
    wallIgnoredThreat: number;
    monsterMovementModifiers: MonsterMovementModifiers;
    wallZoneEffects: WallZoneEffects;
    showDebugOutlines: boolean;
    showSiegeOutline: boolean;
    onBattleMetrics?: (metrics: BattleMetrics) => void;
    onBattleEnded?: (result: BattleResult) => void;
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hostRef = useRef<HTMLDivElement>(null);
    const worldRef = useRef<ReturnType<typeof createWorld> | null>(null);
    const siegeOutlineRef = useRef<Graphics | null>(null);
    const lastCompletesWhenThreatTargetReachedRef = useRef(props.completesWhenThreatTargetReached);
    const runtimePropsRef = useRef({
        initialThreat: props.initialThreat,
        targetThreat: props.targetThreat,
        threatGrowthPerSecond: props.threatGrowthPerSecond,
        waveThreatToCityThreatRatio: props.waveThreatToCityThreatRatio,
        simultaneousMonstersLimit: props.simultaneousMonstersLimit,
        timeBetweenWavesSeconds: props.timeBetweenWavesSeconds,
        fastForwardWavesWhenCleared: props.fastForwardWavesWhenCleared,
        completesWhenThreatTargetReached: props.completesWhenThreatTargetReached,
        wallResilience: props.wallResilience,
        wallIgnoredThreat: props.wallIgnoredThreat,
        monsterMovementModifiers: props.monsterMovementModifiers,
        wallZoneEffects: props.wallZoneEffects,
        showSiegeOutline: props.showSiegeOutline,
        onBattleMetrics: props.onBattleMetrics,
        onBattleEnded: props.onBattleEnded,
    });
    const aspectRatio = props.battlefieldWidth / props.battlefieldHeight;
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [stageError, setStageError] = useState<string | null>(null);
    const canvasIsReady = canvasSize.width > 0 && canvasSize.height > 0;

    useEffect(() => {
        runtimePropsRef.current = {
            initialThreat: props.initialThreat,
            targetThreat: props.targetThreat,
            threatGrowthPerSecond: props.threatGrowthPerSecond,
            waveThreatToCityThreatRatio: props.waveThreatToCityThreatRatio,
            simultaneousMonstersLimit: props.simultaneousMonstersLimit,
            timeBetweenWavesSeconds: props.timeBetweenWavesSeconds,
            fastForwardWavesWhenCleared: props.fastForwardWavesWhenCleared,
            completesWhenThreatTargetReached: props.completesWhenThreatTargetReached,
            wallResilience: props.wallResilience,
            wallIgnoredThreat: props.wallIgnoredThreat,
            monsterMovementModifiers: props.monsterMovementModifiers,
            wallZoneEffects: props.wallZoneEffects,
            showSiegeOutline: props.showSiegeOutline,
            onBattleMetrics: props.onBattleMetrics,
            onBattleEnded: props.onBattleEnded,
        };
    }, [
        props.initialThreat,
        props.targetThreat,
        props.threatGrowthPerSecond,
        props.waveThreatToCityThreatRatio,
        props.simultaneousMonstersLimit,
        props.timeBetweenWavesSeconds,
        props.fastForwardWavesWhenCleared,
        props.completesWhenThreatTargetReached,
        props.wallResilience,
        props.wallIgnoredThreat,
        props.monsterMovementModifiers,
        props.wallZoneEffects,
        props.showSiegeOutline,
        props.onBattleMetrics,
        props.onBattleEnded,
    ]);

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
        let disposed = false;
        let cleanupInput = () => {};
        let cleanupResize = () => {};

        const destroyApp = () => {
            const currentApp = app;
            app = null;
            if (!currentApp) return;

            currentApp.destroy({ removeView: true }, { children: true, texture: false, textureSource: false, context: true });
        };

        (async () => {
            try {
                if (!hostRef.current || !canvasIsReady) return;

                setStageError(null);

                const nextApp = new Application();

                await nextApp.init({
                    resizeTo: hostRef.current,
                    backgroundColor: 0x0b0e13,
                    antialias: true,
                    preference: 'webgl',
                    powerPreference: 'default',
                    failIfMajorPerformanceCaveat: false,
                });

                if (disposed || !hostRef.current) {
                    nextApp.destroy({ removeView: true }, { children: true, texture: false, textureSource: false, context: true });
                    return;
                }

                app = nextApp;
                hostRef.current.appendChild(nextApp.canvas);

                await loadBattleAssets({
                    wallSegments: props.wallSegments,
                    terrainHexes: props.terrainHexes,
                });

                if (disposed || app !== nextApp) return;
            const runtimeProps = runtimePropsRef.current;

            const viewportWidth = nextApp.renderer.width;
            const viewportHeight = nextApp.renderer.height;
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
            nextApp.stage.addChild(camera.container);

            const wallY = props.wallY;
            const wallContactY = getWallContactY({
                wallY,
                wallSegments: props.wallSegments,
                segmentSize: CITY_HEX_WIDTH,
            });
            const world = createWorld({
                battlefieldWidth: props.battlefieldWidth,
                battlefieldHeight: props.battlefieldHeight,
                wallY,
                wallContactY,
                app: nextApp,
                initialThreat: runtimeProps.initialThreat,
                targetThreat: runtimeProps.targetThreat,
                threatGrowthPerSecond: runtimeProps.threatGrowthPerSecond,
                waveThreatToCityThreatRatio: runtimeProps.waveThreatToCityThreatRatio,
                simultaneousMonstersLimit: runtimeProps.simultaneousMonstersLimit,
                timeBetweenWavesSeconds: runtimeProps.timeBetweenWavesSeconds,
                fastForwardWavesWhenCleared: runtimeProps.fastForwardWavesWhenCleared,
                completesWhenThreatTargetReached: runtimeProps.completesWhenThreatTargetReached,
                wallResilience: runtimeProps.wallResilience,
                wallIgnoredThreat: runtimeProps.wallIgnoredThreat,
                monsterMovementModifiers: runtimeProps.monsterMovementModifiers,
                wallZoneEffects: runtimeProps.wallZoneEffects,
                onBattleMetrics: runtimeProps.onBattleMetrics,
                onBattleEnded: runtimeProps.onBattleEnded,
            });
            worldRef.current = world;
            camera.container.addChild(world.worldLayer);

            const battlefieldBackground = createBattlefieldTerrainLayer(props.terrainHexes);
            battlefieldBackground.zIndex = -100;
            world.worldLayer.addChild(battlefieldBackground);

            if (props.showDebugOutlines) {
                const fullBoundsPlaceholder = new Graphics();
                fullBoundsPlaceholder
                    .rect(0, 0, props.battlefieldWidth, props.battlefieldHeight)
                    .stroke({ color: 0x45d0ff, width: 3 });
                fullBoundsPlaceholder.zIndex = 200;
                world.worldLayer.addChild(fullBoundsPlaceholder);

                const activeBattlefieldPlaceholder = new Graphics();
                activeBattlefieldPlaceholder
                    .rect(0, 0, props.battlefieldWidth, wallContactY)
                    .stroke({ color: 0xffd166, width: 2 });
                activeBattlefieldPlaceholder.zIndex = 201;
                activeBattlefieldPlaceholder.visible = runtimeProps.showSiegeOutline;
                world.worldLayer.addChild(activeBattlefieldPlaceholder);
                siegeOutlineRef.current = activeBattlefieldPlaceholder;
            }

            const wallLayer = createBattleWallLayer({
                wallSegments: props.wallSegments,
                wallY,
                segmentSize: CITY_HEX_WIDTH,
                battlefieldWidth: props.battlefieldWidth,
            });
            wallLayer.zIndex = 15;
            world.worldLayer.addChild(wallLayer);

            const standaloneTowerWallCellKeys = new Set(
                props.standaloneTowerDefenses.flatMap((defense) => defense.wallCellKey ? [defense.wallCellKey] : []),
            );

            props.resolvedTowers.forEach((resolvedTower, index) => {
                const baseId = createEntityId(world);
                const gunId = createEntityId(world);
                const towerPosition = getTowerAnchorPosition({
                    towerIndex: index,
                    towerCount: props.resolvedTowers.length,
                    wallSegments: props.wallSegments,
                    excludedWallCellKeys: standaloneTowerWallCellKeys,
                    segmentSize: CITY_HEX_WIDTH,
                    battlefieldWidth: props.battlefieldWidth,
                    wallY,
                });
                const zeroRotationRadians = getTowerZeroRotationRadians({
                    towerPosition,
                    battlefieldWidth: props.battlefieldWidth,
                    battlefieldHeight: props.battlefieldHeight,
                });
                world.transforms.set(baseId, { position: towerPosition, rotationRadians: zeroRotationRadians });
                world.transforms.set(gunId,  { position: towerPosition, rotationRadians: zeroRotationRadians });
                const towerVisualDefinition = createTowerVisualDefinitionFromAssembly(resolvedTower);
                const towerVisual = buildTowerVisualContainer(towerVisualDefinition, { warn: () => {} });
                towerVisual.container.zIndex = 30;
                world.worldLayer.addChild(towerVisual.container);
                world.sprites.set(baseId, towerVisual.container);

                const gunAimPivot = new Container();
                world.worldLayer.addChild(gunAimPivot);
                world.sprites.set(gunId, gunAimPivot);

                const launchSystemId = resolvedTower.selectedParts.launchSystem?.id;
                const projectileSpawnOffset = launchSystemId
                    ? findTowerVisualSocketOffset(towerVisualDefinition, launchSystemId, 'muzzle') ?? { x: 0, y: 0 }
                    : { x: 0, y: 0 };
                world.towersData.set(baseId, createTowerData({
                    stats: resolvedTower.stats,
                    damageProfiles: resolvedTower.damageProfiles,
                    projectileSprite: resolvedTower.selectedParts.ammo?.projectileSprite,
                    keywords: new Set(resolvedTower.keywords),
                    zeroRotationRadians,
                    gunEntity: gunId,
                    projectileSpawnOffset,
                    aimKeywords: resolvedTower.aimKeywords,
                }));
            });

            props.standaloneTowerDefenses.forEach((defense) => {
                const baseId = createEntityId(world);
                const towerPosition = getStandaloneTowerDefensePosition({
                    defense,
                    wallSegments: props.wallSegments,
                    segmentSize: CITY_HEX_WIDTH,
                    battlefieldWidth: props.battlefieldWidth,
                    wallY,
                });
                const zeroRotationRadians = getTowerZeroRotationRadians({
                    towerPosition,
                    battlefieldWidth: props.battlefieldWidth,
                    battlefieldHeight: props.battlefieldHeight,
                });

                world.transforms.set(baseId, { position: towerPosition, rotationRadians: zeroRotationRadians });
                world.towersData.set(baseId, createTowerData({
                    stats: defense.stats,
                    damageProfiles: defense.damageProfiles,
                    keywords: new Set(defense.keywords),
                    zeroRotationRadians,
                    gunEntity: baseId,
                    projectileSpawnOffset: { x: 0, y: 0 },
                    aimKeywords: defense.aimKeywords,
                }));
            });

            // Ticker stays the same in v8 (TickerPlugin is built-in)
            let previousTimeMs = performance.now();
            nextApp.ticker.add(() => {
                const nowMs = performance.now();
                const dt = Math.min(0.25, (nowMs - previousTimeMs) / 1000);
                previousTimeMs = nowMs;
                runSystems(world, dt);
            }); // :contentReference[oaicite:1]{index=1}

            // Camera input
            const canvas = nextApp.canvas;
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
                const vw = nextApp.renderer.width;
                const vh = nextApp.renderer.height;
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
            nextApp.renderer.on('resize', onResize); // :contentReference[oaicite:2]{index=2}
            cleanupResize = () => {
                if (app === nextApp) {
                    nextApp.renderer.off('resize', onResize);
                }
            };
            } catch (error) {
                if (disposed) return;

                const message = error instanceof Error
                    ? error.message
                    : String(error);
                setStageError(message || "Unknown Battle renderer error");
                destroyApp();
            }
        })();

        return () => {
            disposed = true;
            worldRef.current = null;
            siegeOutlineRef.current = null;
            cleanupInput();
            cleanupResize();
            destroyApp();
        };
    }, [
        canvasIsReady,
        props.wallLogicalWidth,
        props.wallSegments,
        props.terrainHexes,
        props.battlefieldWidth,
        props.battlefieldHeight,
        props.wallY,
        props.resolvedTowers,
        props.standaloneTowerDefenses,
        props.showDebugOutlines,
    ]);

    useEffect(() => {
        const world = worldRef.current;
        if (!world) return;

        const wasCompletingAtThreatTarget = lastCompletesWhenThreatTargetReachedRef.current;
        lastCompletesWhenThreatTargetReachedRef.current = props.completesWhenThreatTargetReached;

        world.config.initialThreat = props.initialThreat;
        world.config.targetThreat = props.targetThreat;
        world.config.threatGrowthPerSecond = props.threatGrowthPerSecond;
        world.config.waveThreatToCityThreatRatio = props.waveThreatToCityThreatRatio;
        world.config.simultaneousMonstersLimit = props.simultaneousMonstersLimit;
        world.config.timeBetweenWavesSeconds = props.timeBetweenWavesSeconds;
        world.config.fastForwardWavesWhenCleared = props.fastForwardWavesWhenCleared;
        world.config.completesWhenThreatTargetReached = props.completesWhenThreatTargetReached;
        world.config.wallResilience = props.wallResilience;
        world.config.wallIgnoredThreat = props.wallIgnoredThreat;
        world.config.monsterMovementModifiers = props.monsterMovementModifiers;
        world.config.wallZoneEffects = props.wallZoneEffects;
        world.config.onBattleMetrics = props.onBattleMetrics;
        world.config.onBattleEnded = props.onBattleEnded;
        world.waveScheduler.config.timeBetweenWavesSeconds = props.timeBetweenWavesSeconds;

        if (siegeOutlineRef.current) {
            siegeOutlineRef.current.visible = props.showSiegeOutline;
        }

        if (world.currentThreat > props.targetThreat) {
            world.currentThreat = props.targetThreat;
        }

        if (wasCompletingAtThreatTarget && !props.completesWhenThreatTargetReached) {
            world.battleEnded = false;
            world.lastBattleEndWasHandled = false;
            world.waveScheduler.state.enabled = true;
            world.waveScheduler.state.timeUntilNextWaveSeconds = Math.min(
                world.waveScheduler.state.timeUntilNextWaveSeconds,
                props.timeBetweenWavesSeconds
            );
        }
    }, [
        props.initialThreat,
        props.targetThreat,
        props.threatGrowthPerSecond,
        props.waveThreatToCityThreatRatio,
        props.simultaneousMonstersLimit,
        props.timeBetweenWavesSeconds,
        props.fastForwardWavesWhenCleared,
        props.completesWhenThreatTargetReached,
        props.wallResilience,
        props.wallIgnoredThreat,
        props.monsterMovementModifiers,
        props.wallZoneEffects,
        props.showSiegeOutline,
        props.onBattleMetrics,
        props.onBattleEnded,
    ]);

    return (
        <div
            ref={wrapperRef}
            data-nav-scroll-ignore="true"
            style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}
        >
            <div ref={hostRef} style={hostStyle} />
            {stageError && (
                <div
                    role="alert"
                    style={{
                        position: 'absolute',
                        inset: 12,
                        zIndex: 20,
                        display: 'grid',
                        placeItems: 'center',
                        padding: 12,
                        border: '1px solid #ff8a8a',
                        borderRadius: 4,
                        background: 'rgba(20, 8, 10, 0.92)',
                        color: '#ffe4e4',
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: 'center',
                    }}
                >
                    Battle renderer failed: {stageError}
                </div>
            )}
        </div>
    );
}

function createBattleWallLayer({
    wallSegments,
    wallY,
    segmentSize,
    battlefieldWidth,
}: {
    wallSegments: BattleWallSegment[];
    wallY: number;
    segmentSize: number;
    battlefieldWidth: number;
}) {
    const wallLayer = new Container();
    wallLayer.sortableChildren = true;
    const wallTopAnchorY = getWallTopAnchorY(wallY);

    if (wallSegments.length === 0) {
        const fallbackWall = new Graphics();
        fallbackWall
            .rect(0, wallY - 8, battlefieldWidth, 16)
            .fill(0x6f7787)
            .stroke({ color: 0xd9e2ff, width: 2 });
        wallLayer.addChild(fallbackWall);
        return wallLayer;
    }

    wallSegments.forEach((segment, index) => {
        const segmentCenterX = getBattleWallSegmentCenterX(segment, wallSegments, index, segmentSize);
        const textureAlias = segment.wallKey ? getWallSpriteLookupKey(segment.wallKey) : undefined;
        const wallSpriteMetadata = textureAlias && segment.wallDevelopmentVector
            ? wallSpriteMetadataAtlas[segment.wallDevelopmentVector][textureAlias]
            : undefined;

        if (wallSpriteMetadata && textureAlias && Assets.cache.has(textureAlias)) {
            const sprite = new Sprite(Texture.from(textureAlias));
            const spriteWidth = wallSpriteMetadata.targetSpriteSize.width;
            const spriteHeight = wallSpriteMetadata.targetSpriteSize.height;
            sprite.anchor.set(0.5);
            sprite.x = segmentCenterX;
            sprite.y = wallY;
            sprite.width = spriteWidth;
            sprite.height = spriteHeight;
            sprite.rotation = (wallSpriteMetadata.rotationDegrees ?? 0) * Math.PI / 180;
            wallLayer.addChild(sprite);
            return;
        }

        const fallbackSegment = new Graphics();
        fallbackSegment
            .rect(segmentCenterX - segmentSize / 2, wallY - segmentSize / 2, segmentSize, segmentSize)
            .fill(0x6f7787)
            .stroke({ color: 0xd9e2ff, width: 2 });
        wallLayer.addChild(fallbackSegment);
    });

    wallSegments.forEach((segment, index) => {
        const segmentCenterX = getBattleWallSegmentCenterX(segment, wallSegments, index, segmentSize);
        const textureAlias = segment.wallTopKey ? getWallTopSpriteLookupKey(segment.wallTopKey) : undefined;
        const wallTopSpriteMetadata = textureAlias && segment.wallTopDevelopmentVector
            ? wallTopSpriteMetadataAtlas[segment.wallTopDevelopmentVector][textureAlias]
            : undefined;

        if (wallTopSpriteMetadata && textureAlias && Assets.cache.has(textureAlias)) {
            const sprite = new Sprite(Texture.from(textureAlias));
            const spriteWidth = wallTopSpriteMetadata.targetSpriteSize.width;
            const spriteHeight = wallTopSpriteMetadata.targetSpriteSize.height;
            sprite.anchor.set(0.5);
            sprite.x = segmentCenterX;
            sprite.y = wallTopAnchorY;
            sprite.width = spriteWidth;
            sprite.height = spriteHeight;
            sprite.rotation = (wallTopSpriteMetadata.rotationDegrees ?? 0) * Math.PI / 180;
            sprite.zIndex = 1;
            wallLayer.addChild(sprite);
            return;
        }

        if (!segment.wallTopKey) return;

        const fallbackWallTop = new Graphics();
        fallbackWallTop
            .rect(segmentCenterX - segmentSize * 0.28, wallTopAnchorY - segmentSize * 0.18, segmentSize * 0.56, segmentSize * 0.36)
            .fill(0x8b7654)
            .stroke({ color: 0xf4d58d, width: 2 });
        fallbackWallTop.zIndex = 1;
        wallLayer.addChild(fallbackWallTop);
    });

    return wallLayer;
}

function createBattlefieldTerrainLayer(terrainHexes: readonly BattlefieldTerrainHex[]) {
    const terrainLayer = new Container();
    terrainLayer.sortableChildren = true;

    terrainHexes.forEach((terrainHex) => {
        const fallbackHex = createTerrainHexShape(terrainHex.fallbackFill);
        fallbackHex.x = terrainHex.centerX;
        fallbackHex.y = terrainHex.centerY;
        terrainLayer.addChild(fallbackHex);

        if (!terrainHex.backgroundSpriteSrc) return;

        const texture = Assets.cache.has(terrainHex.backgroundSpriteId)
            ? Texture.from(terrainHex.backgroundSpriteId)
            : Texture.from(terrainHex.backgroundSpriteSrc);
        const texturedHex = createTexturedTerrainHex(texture);
        texturedHex.x = terrainHex.centerX;
        texturedHex.y = terrainHex.centerY;
        terrainLayer.addChild(texturedHex);
    });

    return terrainLayer;
}

function createTerrainHexShape(fill: number) {
    const hex = new Graphics();
    const points = getBattlefieldHexPoints();

    hex.poly(points).fill(fill);

    return hex;
}

function createTexturedTerrainHex(texture: Texture) {
    const hex = new Graphics();
    const points = getBattlefieldHexPoints();

    hex.poly(points).fill(texture);

    return hex;
}

function getBattlefieldHexPoints() {
    const points: number[] = [];

    for (let index = 0; index < 6; index++) {
        const angleRadians = (Math.PI / 180) * (60 * index - 30);
        points.push(
            CITY_HEX_RADIUS * Math.cos(angleRadians),
            CITY_HEX_RADIUS * Math.sin(angleRadians),
        );
    }

    return points;
}

function getSegmentCenterX(index: number, segmentSize: number) {
    return index * segmentSize + segmentSize / 2;
}

function getBattleWallSegmentCenterX(
    segment: BattleWallSegment,
    wallSegments: BattleWallSegment[],
    index: number,
    segmentSize: number,
) {
    const offsets = wallSegments.map(getWallSegmentAxialHorizontalOffset);
    const minOffset = Math.min(...offsets);
    const offset = getWallSegmentAxialHorizontalOffset(segment);

    return Number.isFinite(offset) && Number.isFinite(minOffset)
        ? (offset - minOffset) * segmentSize + segmentSize / 2
        : getSegmentCenterX(index, segmentSize);
}

function getWallSegmentAxialHorizontalOffset(segment: Pick<BattleWallSegment, "column" | "row">) {
    return segment.column + segment.row / 2;
}

function getWallTopAnchorY(wallY: number) {
    return wallY;
}

function getWallSpriteLookupKey(wallKey: string) {
    return WALL_SEGMENT_BUILDINGS[wallKey]?.visualAssetId ?? wallKey;
}

function getWallTopSpriteLookupKey(wallTopKey: string) {
    return WALL_SUPERSTRUCTURE_BUILDINGS[wallTopKey]?.visualAssetId ?? wallTopKey;
}

function getTowerAnchorPosition({
    towerIndex,
    towerCount,
    wallSegments,
    excludedWallCellKeys,
    segmentSize,
    battlefieldWidth,
    wallY,
}: {
    towerIndex: number;
    towerCount: number;
    wallSegments: BattleWallSegment[];
    excludedWallCellKeys: Set<string>;
    segmentSize: number;
    battlefieldWidth: number;
    wallY: number;
}) {
    const anchorSegment = getTowerAnchorWallSegment({
        towerIndex,
        wallSegments,
        excludedWallCellKeys,
    });
    if (anchorSegment) {
        return {
            x: getBattleWallSegmentCenterX(anchorSegment.segment, wallSegments, anchorSegment.index, segmentSize),
            y: getWallTopAnchorY(wallY),
        };
    }

    return {
        x: battlefieldWidth * (towerIndex + 1) / (towerCount + 1),
        y: getWallTopAnchorY(wallY),
    };
}

function getTowerAnchorWallSegment({
    towerIndex,
    wallSegments,
    excludedWallCellKeys,
}: {
    towerIndex: number;
    wallSegments: BattleWallSegment[];
    excludedWallCellKeys: Set<string>;
}) {
    const wallTopSegments = wallSegments
        .map((segment, index) => ({ segment, index }))
        .filter(({ segment }) => Boolean(segment.wallTopKey) && !excludedWallCellKeys.has(segment.cellKey));

    return wallTopSegments[towerIndex % Math.max(1, wallTopSegments.length)];
}

function getStandaloneTowerDefensePosition({
    defense,
    wallSegments,
    segmentSize,
    battlefieldWidth,
    wallY,
}: {
    defense: StandaloneTowerDefense;
    wallSegments: BattleWallSegment[];
    segmentSize: number;
    battlefieldWidth: number;
    wallY: number;
}) {
    const segmentIndex = wallSegments.findIndex((segment) => segment.cellKey === defense.wallCellKey);
    if (segmentIndex >= 0) {
        const segment = wallSegments[segmentIndex];
        return {
            x: segment
                ? getBattleWallSegmentCenterX(segment, wallSegments, segmentIndex, segmentSize)
                : getSegmentCenterX(segmentIndex, segmentSize),
            y: getWallTopAnchorY(wallY),
        };
    }

    if (defense.wallColumn !== undefined) {
        const matchingSegmentIndex = wallSegments.findIndex((segment) => segment.column === defense.wallColumn);
        const matchingSegment = matchingSegmentIndex >= 0 ? wallSegments[matchingSegmentIndex] : undefined;

        return {
            x: matchingSegment
                ? getBattleWallSegmentCenterX(matchingSegment, wallSegments, matchingSegmentIndex, segmentSize)
                : battlefieldWidth / 2,
            y: getWallTopAnchorY(wallY),
        };
    }

    return {
        x: battlefieldWidth / 2,
        y: getWallTopAnchorY(wallY),
    };
}

function createTowerData({
    stats,
    damageProfiles,
    projectileSprite,
    keywords,
    zeroRotationRadians,
    gunEntity,
    projectileSpawnOffset,
    aimKeywords,
}: {
    stats: TowerStatsResolved;
    damageProfiles: TowerDamageProfiles;
    projectileSprite?: TowerData['projectileSprite'];
    keywords: Set<string>;
    zeroRotationRadians: number;
    gunEntity: number;
    projectileSpawnOffset: { x: number; y: number };
    aimKeywords: string[];
}): TowerData {
    return {
        rotationSpeed: stats.rotationSpeed,
        shotsPerSecond: stats.shotsPerSecond,
        burstCount: stats.burstCount,
        projectileDamageProfile: damageProfiles.projectile,
        projectileSpeed: stats.projectileSpeed,
        projectileRadius: stats.projectileRadius,
        projectileSpread: stats.projectileSpread,
        projectileSprite,
        aoeRadius: stats.aoeRadius,
        keywords,
        targetingDistanceLimit: stats.targetingDistanceLimit,
        maximumRange: stats.maximumRange,
        minimumRange: stats.minimumRange,
        maximumRotationAngle: stats.maximumRotationAngle,
        zeroRotationRadians,
        triggerTolerance: stats.triggerTolerance,
        zonePushBackDistance: stats.zonePushBackDistance,
        zonePushBacksPerSecond: stats.zonePushBacksPerSecond,
        zonePushBackZoneSize: stats.zonePushBackZoneSize,
        zoneFleeDuration: stats.zoneFleeDuration,
        zoneFleesPerSecond: stats.zoneFleesPerSecond,
        zoneFleeZoneSize: stats.zoneFleeZoneSize,
        zoneCircleDuration: stats.zoneCircleDuration,
        zoneCirclesPerSecond: stats.zoneCirclesPerSecond,
        zoneCircleZoneSize: stats.zoneCircleZoneSize,
        zoneDotDamageProfile: damageProfiles.zoneDot,
        zoneDotTicksPerSecond: stats.zoneDotTicksPerSecond,
        zoneDotZoneSize: stats.zoneDotZoneSize,
        zoneStunDuration: stats.zoneStunDuration,
        zoneStunsPerSecond: stats.zoneStunsPerSecond,
        zoneStunZoneSize: stats.zoneStunZoneSize,
        singleTargetPushBackDistance: stats.singleTargetPushBackDistance,
        singleTargetPushBacksPerSecond: stats.singleTargetPushBacksPerSecond,
        singleTargetPushBackRange: stats.singleTargetPushBackRange,
        singleTargetFleeDuration: stats.singleTargetFleeDuration,
        singleTargetFleesPerSecond: stats.singleTargetFleesPerSecond,
        singleTargetFleeRange: stats.singleTargetFleeRange,
        singleTargetCircleDuration: stats.singleTargetCircleDuration,
        singleTargetCirclesPerSecond: stats.singleTargetCirclesPerSecond,
        singleTargetCircleRange: stats.singleTargetCircleRange,
        singleTargetDotDamageProfile: damageProfiles.singleTargetDot,
        singleTargetDotTicksPerSecond: stats.singleTargetDotTicksPerSecond,
        singleTargetDotRange: stats.singleTargetDotRange,
        singleTargetStunDuration: stats.singleTargetStunDuration,
        singleTargetStunsPerSecond: stats.singleTargetStunsPerSecond,
        singleTargetStunRange: stats.singleTargetStunRange,
        rangeCityPixels: stats.targetingDistanceLimit,
        currentTarget: undefined,
        gunEntity,
        projectileSpawnOffset,
        retargetCooldownSeconds: stats.retargetCooldownSeconds,
        retargetRemainingSeconds: 0,
        aimKeywords,
    };
}

function getTowerZeroRotationRadians({
    towerPosition,
    battlefieldWidth,
    battlefieldHeight,
}: {
    towerPosition: { x: number; y: number };
    battlefieldWidth: number;
    battlefieldHeight: number;
}) {
    return Math.atan2(
        battlefieldHeight / 2 - towerPosition.y,
        battlefieldWidth / 2 - towerPosition.x,
    );
}

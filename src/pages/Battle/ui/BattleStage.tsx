import { Application, Assets, Container, Graphics, Sprite, Texture, TilingSprite } from 'pixi.js';
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
import { BATTLE_BACKGROUNDS } from '../../../data/battle/backgrounds.ts';
import type { BattleBackgroundId } from '../../../data/battle/backgrounds.ts';
import type { TowerAssemblyResolved } from '../../../models/battle/towerParts.ts';
import { buildTowerVisualContainer } from '../factories/towerVisualRenderer.ts';
import { createTowerVisualDefinitionFromAssembly, findTowerVisualSocketOffset } from '../../../data/towers/visuals.ts';
import type { BattleMetrics, BattleResult, MonsterMovementModifiers, WallZoneEffects } from '../../../models/battle/world.ts';
import type { BattleWallSegment } from '../../../models/battle/wallSegment.ts';
import { BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX, CITY_HEX_SIZE } from '../../../data/constants.ts';
import { wallSpriteMetadataAtlas } from '../../../models/sprites/walls/wallsSpriteAtlas.ts';
import { wallTopSpriteMetadataAtlas } from '../../../models/sprites/wallTops/wallTopSpriteAtlas.ts';
import { getWallContactY } from '../core/wallGeometry.ts';

/** Drop-in React component hosting the battle canvas (Pixi v8). */
export function BattleStage(props: {
    wallLogicalWidth: number;   // TODO: derive from city hex row width (Redux)
    wallSegments: BattleWallSegment[];
    battlefieldWidth: number;   // TODO: logical width in world units
    battlefieldHeight: number;  // TODO: logical height in world units
    wallY: number;
    backgroundId: BattleBackgroundId;
    resolvedTowers: TowerAssemblyResolved[];
    initialThreat: number;
    targetThreat: number;
    threatGrowthPerSecond: number;
    waveThreatToCityThreatRatio: number;
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

            await loadBattleAssets({
                backgroundId: props.backgroundId,
                wallSegments: props.wallSegments,
            });

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
            const wallContactY = getWallContactY({
                wallY,
                wallSegments: props.wallSegments,
                segmentSize: BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX,
            });
            const world = createWorld({
                battlefieldWidth: props.battlefieldWidth,
                battlefieldHeight: props.battlefieldHeight,
                wallY,
                wallContactY,
                app,
                initialThreat: props.initialThreat,
                targetThreat: props.targetThreat,
                threatGrowthPerSecond: props.threatGrowthPerSecond,
                waveThreatToCityThreatRatio: props.waveThreatToCityThreatRatio,
                timeBetweenWavesSeconds: props.timeBetweenWavesSeconds,
                fastForwardWavesWhenCleared: props.fastForwardWavesWhenCleared,
                completesWhenThreatTargetReached: props.completesWhenThreatTargetReached,
                wallResilience: props.wallResilience,
                wallIgnoredThreat: props.wallIgnoredThreat,
                monsterMovementModifiers: props.monsterMovementModifiers,
                wallZoneEffects: props.wallZoneEffects,
                onBattleMetrics: props.onBattleMetrics,
                onBattleEnded: props.onBattleEnded,
            });
            camera.container.addChild(world.worldLayer);

            const backgroundDefinition = BATTLE_BACKGROUNDS[props.backgroundId];
            const battlefieldBackground = new TilingSprite({
                texture: Texture.from(backgroundDefinition.textureAlias),
                width: props.battlefieldWidth,
                height: props.battlefieldHeight,
            });
            battlefieldBackground.zIndex = -100;
            world.worldLayer.addChild(battlefieldBackground);

            if (props.showDebugOutlines) {
                const fullBoundsPlaceholder = new Graphics();
                fullBoundsPlaceholder
                    .rect(0, 0, props.battlefieldWidth, props.battlefieldHeight)
                    .stroke({ color: 0x45d0ff, width: 3 });
                fullBoundsPlaceholder.zIndex = 200;
                world.worldLayer.addChild(fullBoundsPlaceholder);

                if (props.showSiegeOutline) {
                    const activeBattlefieldPlaceholder = new Graphics();
                    activeBattlefieldPlaceholder
                        .rect(0, 0, props.battlefieldWidth, wallContactY)
                        .stroke({ color: 0xffd166, width: 2 });
                    activeBattlefieldPlaceholder.zIndex = 201;
                    world.worldLayer.addChild(activeBattlefieldPlaceholder);
                }
            }

            const wallLayer = createBattleWallLayer({
                wallSegments: props.wallSegments,
                wallY,
                segmentSize: BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX,
                battlefieldWidth: props.battlefieldWidth,
            });
            wallLayer.zIndex = 15;
            world.worldLayer.addChild(wallLayer);

            props.resolvedTowers.forEach((resolvedTower, index) => {
                const baseId = createEntityId(world);
                const gunId = createEntityId(world);
                const towerPosition = getTowerAnchorPosition({
                    towerIndex: index,
                    towerCount: props.resolvedTowers.length,
                    wallSegments: props.wallSegments,
                    segmentSize: BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX,
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

                world.towersData.set(baseId, {
                    rotationSpeed: resolvedTower.stats.rotationSpeed,
                    shotsPerSecond: resolvedTower.stats.shotsPerSecond,
                    burstCount: resolvedTower.stats.burstCount,
                    projectileDamage: resolvedTower.stats.projectileDamage,
                    projectileSpeed: resolvedTower.stats.projectileSpeed,
                    projectileRadius: resolvedTower.stats.projectileRadius,
                    projectileSpread: resolvedTower.stats.projectileSpread,
                    aoeRadius: resolvedTower.stats.aoeRadius,
                    keywords: new Set(resolvedTower.keywords),
                    targetingDistanceLimit: resolvedTower.stats.targetingDistanceLimit,
                    maximumRange: resolvedTower.stats.maximumRange,
                    minimumRange: resolvedTower.stats.minimumRange,
                    maximumRotationAngle: resolvedTower.stats.maximumRotationAngle,
                    zeroRotationRadians,
                    triggerTolerance: resolvedTower.stats.triggerTolerance,
                    rangePixels: resolvedTower.stats.targetingDistanceLimit,
                    currentTarget: undefined,
                    gunEntity: gunId,
                    projectileSpawnOffset,
                    retargetCooldownSeconds: resolvedTower.stats.retargetCooldownSeconds,
                    retargetRemainingSeconds: 0,
                    aimKeywords: resolvedTower.aimKeywords,
                });
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

            app.destroy(true, { children: true, texture: false, textureSource: false, context: true }); // :contentReference[oaicite:3]{index=3}
        };
    }, [
        canvasSize.height,
        canvasSize.width,
        props.wallLogicalWidth,
        props.wallSegments,
        props.battlefieldWidth,
        props.battlefieldHeight,
        props.wallY,
        props.backgroundId,
        props.resolvedTowers,
        props.initialThreat,
        props.targetThreat,
        props.threatGrowthPerSecond,
        props.waveThreatToCityThreatRatio,
        props.timeBetweenWavesSeconds,
        props.fastForwardWavesWhenCleared,
        props.completesWhenThreatTargetReached,
        props.wallResilience,
        props.wallIgnoredThreat,
        props.monsterMovementModifiers,
        props.wallZoneEffects,
        props.showDebugOutlines,
        props.showSiegeOutline,
        props.onBattleMetrics,
        props.onBattleEnded,
    ]);

    return (
        <div ref={wrapperRef} style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
            <div ref={hostRef} style={hostStyle} />
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
    const cityToBattleScale = segmentSize / CITY_HEX_SIZE;
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
        const segmentCenterX = getSegmentCenterX(index, segmentSize);
        const wallSpriteMetadata = segment.wallKey && segment.wallDevelopmentVector
            ? wallSpriteMetadataAtlas[segment.wallDevelopmentVector][segment.wallKey]
            : undefined;
        const textureAlias = wallSpriteMetadata ? segment.wallKey : undefined;

        if (textureAlias && Assets.cache.has(textureAlias)) {
            const sprite = new Sprite(Texture.from(textureAlias));
            const spriteWidth = wallSpriteMetadata.targetSpriteSize.width * cityToBattleScale;
            const spriteHeight = wallSpriteMetadata.targetSpriteSize.height * cityToBattleScale;
            sprite.x = segmentCenterX - spriteWidth / 2;
            sprite.y = wallY - spriteHeight / 2;
            sprite.width = spriteWidth;
            sprite.height = spriteHeight;
            wallLayer.addChild(sprite);
            return;
        }

        const fallbackSegment = new Graphics();
        fallbackSegment
            .rect(index * segmentSize, wallY - segmentSize / 2, segmentSize, segmentSize)
            .fill(0x6f7787)
            .stroke({ color: 0xd9e2ff, width: 2 });
        wallLayer.addChild(fallbackSegment);
    });

    wallSegments.forEach((segment, index) => {
        const segmentCenterX = getSegmentCenterX(index, segmentSize);
        const wallTopSpriteMetadata = segment.wallTopKey && segment.wallTopDevelopmentVector
            ? wallTopSpriteMetadataAtlas[segment.wallTopDevelopmentVector][segment.wallTopKey]
            : undefined;
        const textureAlias = wallTopSpriteMetadata ? segment.wallTopKey : undefined;

        if (textureAlias && Assets.cache.has(textureAlias)) {
            const sprite = new Sprite(Texture.from(textureAlias));
            const spriteWidth = wallTopSpriteMetadata.targetSpriteSize.width * cityToBattleScale;
            const spriteHeight = wallTopSpriteMetadata.targetSpriteSize.height * cityToBattleScale;
            sprite.x = segmentCenterX - spriteWidth / 2;
            sprite.y = wallTopAnchorY - spriteHeight / 2;
            sprite.width = spriteWidth;
            sprite.height = spriteHeight;
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

function getSegmentCenterX(index: number, segmentSize: number) {
    return index * segmentSize + segmentSize / 2;
}

function getWallTopAnchorY(wallY: number) {
    return wallY;
}

function getTowerAnchorPosition({
    towerIndex,
    towerCount,
    wallSegments,
    segmentSize,
    battlefieldWidth,
    wallY,
}: {
    towerIndex: number;
    towerCount: number;
    wallSegments: BattleWallSegment[];
    segmentSize: number;
    battlefieldWidth: number;
    wallY: number;
}) {
    const wallTopSegments = wallSegments
        .map((segment, index) => ({ segment, index }))
        .filter(({ segment }) => Boolean(segment.wallTopKey));

    const anchorSegment = wallTopSegments[towerIndex % Math.max(1, wallTopSegments.length)];
    if (anchorSegment) {
        return {
            x: getSegmentCenterX(anchorSegment.index, segmentSize),
            y: getWallTopAnchorY(wallY),
        };
    }

    return {
        x: battlefieldWidth * (towerIndex + 1) / (towerCount + 1),
        y: getWallTopAnchorY(wallY),
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

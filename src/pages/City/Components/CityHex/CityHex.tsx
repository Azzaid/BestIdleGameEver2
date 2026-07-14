import {Application, Assets, Container, Graphics, Sprite, Text, Texture, type FederatedPointerEvent} from "pixi.js";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {buildingsSpriteAtlas} from "../../../../models/sprites/buildings/buildingsSpriteAtlas.ts";
import {wallSpriteMetadataAtlas, wallSpritesAtlas} from "../../../../models/sprites/walls/wallsSpriteAtlas.ts";
import {wallTopSpriteMetadataAtlas, wallTopSpritesAtlas} from "../../../../models/sprites/wallTops/wallTopSpriteAtlas.ts";
import type {HexCell} from "../../../../models/city/HexGrid.ts";
import {CITY_HEX_BACKGROUND_SPRITES_BY_ID} from "../../../../data/cityHexBackgrounds.ts";
import {selectBaseClaimedTerrainBackground} from "../../../../data/cityTerrainBackgrounds.ts";
import {getDevelopmentVectorKey, type CityBiome} from "../../../../models/city/hexBackgrounds.ts";
import {
    axialCoordinateToPixelPosition,
    axialDistance,
    clampPan,
    computeCityBounds,
    minZoomThatCovers,
    pixelPositionToAxialCoordinate,
    coordKey,
} from "./hexUtils.ts";
import {BUILDINGS_ATLAS, STRUCTURES_BY_ID} from "../../../../data/buildings/index.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../../../data/wallSegments/index.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS} from "../../../../data/wallSuperstructures/index.ts";
import {CITY_HEX_RADIUS} from "../../../../data/constants.ts";
import type {CityExpansionOption, CityExpansionSideId} from "../../../../models/city/expansion.ts";
import type {BattlefieldTerrainHex} from "../../../../models/battle/battlefieldTerrain.ts";
import {mountCityBattleRuntime, type CityBattleRuntimeConfig, type MountedCityBattleRuntime} from "../../../Battle/battleRuntime.ts";

const HEX_RADIUS_PX = CITY_HEX_RADIUS;
const HEX_STROKE_WIDTH = 3;
const HEX_EDGE_GAP_PX = 0;
const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS_PX;
const SPRITE_PADDING = 0.98;
const SPRITE_WIDTH = HEX_WIDTH * SPRITE_PADDING;
const SPRITE_HEIGHT = SPRITE_WIDTH;
const HEX_BACKGROUND_WIDTH = HEX_WIDTH * 1.04;
const HEX_BACKGROUND_HEIGHT = HEX_RADIUS_PX * 2.08;
const EXPANSION_ARROW_HALF_WIDTH = HEX_WIDTH;
const EXPANSION_ARROW_HALF_HEIGHT = HEX_RADIUS_PX / 2;
const MIN_EXPANSION_ARROW_SCALE = 0.56;
const EXPANSION_ARROW_SCALE_PER_RADIUS = 0.14;
const MAX_EXPANSION_ARROW_SCALE = 1.26;
const TOP_EXPANSION_ARROW_WALL_PROXIMITY = 0.46;
const AVAILABLE_EXPANSION_ARROW_OPACITY = 0.42;
const DISABLED_EXPANSION_ARROW_OPACITY = 0.18;
const UNCLAIMED_LAND_SHADE_OPACITY = 0.5;
const OUTER_UNCLAIMED_LAND_SHADE_OPACITY = 0.75;
const INITIAL_ZOOM_FACTOR = 1.35;
const CAMERA_FOCUS_ZOOM_FACTOR = 2.1;
const CAMERA_FOCUS_ANIMATION_MS = 520;
const WHEEL_ZOOM_IN_FACTOR = 1.12;
const WHEEL_ZOOM_OUT_FACTOR = 0.88;
const DRAG_CLICK_TOLERANCE_PX = 4;
const HEX_ROW_CENTER_SPACING_PX = HEX_RADIUS_PX * 1.5;
const CITY_CAMERA_SHADED_RING_COUNT = 2;
const CITY_CAMERA_BATTLEFIELD_SIDE_HEX_COUNT = 2;

const HEX_SIDE_DEFINITIONS = [
    {columnDelta: 1, rowDelta: 0, startVertexIndex: 0, endVertexIndex: 1},
    {columnDelta: 0, rowDelta: 1, startVertexIndex: 1, endVertexIndex: 2},
    {columnDelta: -1, rowDelta: 1, startVertexIndex: 2, endVertexIndex: 3},
    {columnDelta: -1, rowDelta: 0, startVertexIndex: 3, endVertexIndex: 4},
    {columnDelta: 0, rowDelta: -1, startVertexIndex: 4, endVertexIndex: 5},
    {columnDelta: 1, rowDelta: -1, startVertexIndex: 5, endVertexIndex: 0},
] as const;

type PreparedHexCell = HexCell & {
    centerX: number;
    centerY: number;
};

type CameraState = {
    zoom: number;
    offsetX: number;
    offsetY: number;
};

type Viewport = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type Bounds = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};

type CameraRuleId = "city" | "battle" | "tower";

type StageTransform = {
    scale: number;
    offsetX: number;
    offsetY: number;
};

export default function CityHex({
    cells,
    biome,
    expansionOptions = [],
    getExpansionDisabledReason,
    onExpandSide,
    showDebugAxes = false,
    topInsetPx = 0,
    battlefieldHexes = [],
    battleRuntime,
    cameraFocusRequest,
    clearSelectionSignal = 0,
    onSelect = () => {},
}: {
    cells: HexCell[];
    biome: CityBiome;
    expansionOptions?: readonly CityExpansionOption[];
    getExpansionDisabledReason?: (option: CityExpansionOption) => string | undefined;
    onExpandSide?: (sideId: CityExpansionSideId) => void;
    showDebugAxes?: boolean;
    topInsetPx?: number;
    battlefieldHexes?: readonly BattlefieldTerrainHex[];
    battleRuntime?: CityBattleRuntimeConfig | null;
    cameraFocusRequest?: {target: CameraRuleId; id: number; focusCellKey?: string | null};
    clearSelectionSignal?: number;
    onSelect?: (cell: HexCell | null) => void;
}) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const appRef = useRef<Application | null>(null);
    const rootLayerRef = useRef<Container | null>(null);
    const cameraLayerRef = useRef<Container | null>(null);
    const sceneLayerRef = useRef<Container | null>(null);
    const battleLayerRef = useRef<Container | null>(null);
    const battleRuntimeRef = useRef<MountedCityBattleRuntime | null>(null);
    const latestRenderRef = useRef<(() => void) | null>(null);
    const stageTransformRef = useRef<StageTransform>({scale: 1, offsetX: 0, offsetY: 0});
    const cameraOffsetRef = useRef({x: 0, y: 0});
    const zoomFactorRef = useRef(INITIAL_ZOOM_FACTOR);
    const isDraggingRef = useRef(false);
    const didDragRef = useRef(false);
    const suppressNextClickRef = useRef(false);
    const pointerStartRef = useRef({x: 0, y: 0});
    const cameraStartRef = useRef({x: 0, y: 0});
    const cameraAnimationFrameRef = useRef<number | null>(null);
    const cameraClampRulesDisabledRef = useRef(false);
    const handledCameraFocusRequestKeyRef = useRef<string | null>(null);
    const previousCityInteractionsEnabledRef = useRef(true);
    const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
    const [pixiSceneReadyId, setPixiSceneReadyId] = useState(0);
    const canvasIsReady = canvasSize.width > 0 && canvasSize.height > 0;
    const [camera, setCamera] = useState<CameraState>({
        zoom: INITIAL_ZOOM_FACTOR,
        offsetX: 0,
        offsetY: 0,
    });
    const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);
    const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
    const [activeCameraRule, setActiveCameraRule] = useState<CameraRuleId>("city");
    const requestedCameraRule = cameraFocusRequest?.target ?? activeCameraRule;
    const cityInteractionsEnabled = requestedCameraRule !== "battle";

    const preparedCells = useMemo<PreparedHexCell[]>(() => cells.map(cell => {
        const {x, y} = axialCoordinateToPixelPosition(cell, HEX_RADIUS_PX, HEX_EDGE_GAP_PX);

        return {
            ...cell,
            centerX: x,
            centerY: y,
        };
    }), [cells]);

    const cellsByKey = useMemo(() => new Map(cells.map(cell => [cell.cellKey, cell])), [cells]);
    const preparedCellsByKey = useMemo(() => new Map(preparedCells.map(cell => [cell.cellKey, cell])), [preparedCells]);
    const claimedRadius = useMemo(
        () => preparedCells.reduce((radius, cell) => (
            cell.isUnclaimed
                ? radius
                : Math.max(radius, axialDistance({column: 0, row: 0}, cell))
        ), 0),
        [preparedCells],
    );
    const cameraCells = useMemo(
        () => preparedCells.filter(cell => axialDistance({column: 0, row: 0}, cell) <= claimedRadius + 1),
        [claimedRadius, preparedCells],
    );
    const cityRuleCells = useMemo(
        () => preparedCells.filter(cell => axialDistance({column: 0, row: 0}, cell) <= claimedRadius + CITY_CAMERA_SHADED_RING_COUNT),
        [claimedRadius, preparedCells],
    );
    const viewBounds = useMemo(
        () => computeCityBounds(
            [...(cityRuleCells.length ? cityRuleCells : cameraCells.length ? cameraCells : preparedCells), ...battlefieldHexes],
            HEX_RADIUS_PX,
        ),
        [battlefieldHexes, cameraCells, cityRuleCells, preparedCells],
    );
    const cityCameraBounds = useMemo(
        () => getCityCameraRuleBounds(
            cityRuleCells.length ? cityRuleCells : cameraCells.length ? cameraCells : preparedCells,
            preparedCells,
            viewBounds,
        ),
        [cameraCells, cityRuleCells, preparedCells, viewBounds],
    );
    const battleFocusBounds = useMemo(
        () => battlefieldHexes.length
            ? computeCityBounds(battlefieldHexes, HEX_RADIUS_PX)
            : null,
        [battlefieldHexes],
    );
    const battleCameraBounds = useMemo(
        () => battleRuntime
            ? mergeVerticalBounds(getBattleCameraRuleBounds(battleRuntime), battleFocusBounds)
            : battleFocusBounds ?? cityCameraBounds,
        [battleFocusBounds, battleRuntime, cityCameraBounds],
    );
    const towerCameraBounds = useMemo(() => {
        const focusCellKey = cameraFocusRequest?.target === "tower"
            ? cameraFocusRequest.focusCellKey
            : null;
        const focusCell = focusCellKey ? preparedCellsByKey.get(focusCellKey) : undefined;

        return focusCell
            ? getSingleHexCameraBounds(focusCell)
            : cityCameraBounds;
    }, [cameraFocusRequest, cityCameraBounds, preparedCellsByKey]);
    const battlefieldCellKeys = useMemo(
        () => new Set(battlefieldHexes.map(hex => hex.cellKey)),
        [battlefieldHexes],
    );
    const viewExtent = getViewExtent(viewBounds);
    const viewport = useMemo<Viewport>(() => ({
        x: -viewExtent,
        y: -viewExtent,
        width: viewExtent * 2,
        height: viewExtent * 2,
    }), [viewExtent]);
    const cameraClampViewport = useMemo(
        () => getCameraClampViewport(viewport, canvasSize, topInsetPx),
        [canvasSize, topInsetPx, viewport],
    );
    const maxZoomFactor = useMemo(
        () => getMaxZoomForNaturalHexSize(canvasSize.width, canvasSize.height, viewport),
        [canvasSize.height, canvasSize.width, viewport],
    );
    const topExpansionPreviewCellKeys = useMemo(
        () => new Set(
            expansionOptions
                .filter(option => option.side.id === "north-west")
                .flatMap(option => option.hexes.map(hex => hex.cellKey)),
        ),
        [expansionOptions],
    );
    const expansionControls = useMemo(
        () => getExpansionControls(expansionOptions, preparedCells),
        [expansionOptions, preparedCells],
    );
    const selectedPreparedCell = selectedCellKey ? preparedCellsByKey.get(selectedCellKey) : undefined;
    const hoveredPreparedCell = hoveredCellKey ? preparedCellsByKey.get(hoveredCellKey) : undefined;
    const selectedOutlineCells = useMemo(
        () => getOutlineCells(selectedPreparedCell, preparedCells),
        [preparedCells, selectedPreparedCell],
    );
    const hoveredOutlineCells = useMemo(
        () => getOutlineCells(hoveredPreparedCell, preparedCells),
        [hoveredPreparedCell, preparedCells],
    );
    const selectedOutlineKey = selectedPreparedCell ? getOutlineKey(selectedPreparedCell) : null;
    const hoveredOutlineKey = hoveredPreparedCell ? getOutlineKey(hoveredPreparedCell) : null;
    const hexagonPoints = useMemo(() => getHexagonPoints(HEX_RADIUS_PX), []);
    const hexagonVertexPoints = useMemo(() => getHexagonVertexPoints(HEX_RADIUS_PX), []);
    const debugAxisLines = useMemo(
        () => getDebugAxisLines(preparedCells),
        [preparedCells],
    );

    const applyCamera = useCallback((nextCamera: CameraState) => {
        zoomFactorRef.current = nextCamera.zoom;
        cameraOffsetRef.current = {
            x: nextCamera.offsetX,
            y: nextCamera.offsetY,
        };
        setCamera(nextCamera);
    }, []);

    const cancelCameraAnimation = useCallback(() => {
        if (cameraAnimationFrameRef.current === null) return;

        cancelAnimationFrame(cameraAnimationFrameRef.current);
        cameraAnimationFrameRef.current = null;
        cameraClampRulesDisabledRef.current = false;
    }, []);

    const animateCamera = useCallback((targetCamera: CameraState, onComplete?: () => void) => {
        cancelCameraAnimation();
        cameraClampRulesDisabledRef.current = true;

        const startCamera = {
            zoom: zoomFactorRef.current,
            offsetX: cameraOffsetRef.current.x,
            offsetY: cameraOffsetRef.current.y,
        };
        const startedAt = performance.now();

        const step = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / CAMERA_FOCUS_ANIMATION_MS);
            const eased = easeInOutCubic(progress);

            applyCamera({
                zoom: lerp(startCamera.zoom, targetCamera.zoom, eased),
                offsetX: lerp(startCamera.offsetX, targetCamera.offsetX, eased),
                offsetY: lerp(startCamera.offsetY, targetCamera.offsetY, eased),
            });

            if (progress < 1) {
                cameraAnimationFrameRef.current = requestAnimationFrame(step);
                return;
            }

            cameraAnimationFrameRef.current = null;
            cameraClampRulesDisabledRef.current = false;
            onComplete?.();
        };

        cameraAnimationFrameRef.current = requestAnimationFrame(step);
    }, [applyCamera, cancelCameraAnimation]);

    const clampZoomForRule = useCallback((zoom: number, rule: CameraRuleId = activeCameraRule) => {
        if (rule === "tower") {
            return Math.max(0.1, Math.min(maxZoomFactor, zoom));
        }

        const ruleBounds = getCameraRuleBounds(rule, cityCameraBounds, battleCameraBounds, towerCameraBounds);
        const minZoomThatCoversViewport = minZoomThatCovers(ruleBounds, cameraClampViewport.width, cameraClampViewport.height);

        return Math.max(minZoomThatCoversViewport, Math.min(maxZoomFactor, zoom));
    }, [activeCameraRule, battleCameraBounds, cameraClampViewport.height, cameraClampViewport.width, cityCameraBounds, maxZoomFactor, towerCameraBounds]);

    const clampCamera = useCallback((
        offsetX: number,
        offsetY: number,
        zoom: number,
        rule: CameraRuleId = activeCameraRule,
    ): CameraState => {
        if (cameraClampRulesDisabledRef.current || rule === "tower") {
            return {zoom, offsetX, offsetY};
        }

        const ruleBounds = getCameraRuleBounds(rule, cityCameraBounds, battleCameraBounds, towerCameraBounds);
        const clamped = clampPan(
            offsetX,
            offsetY,
            zoom,
            ruleBounds,
            cameraClampViewport.x,
            cameraClampViewport.y,
            cameraClampViewport.width,
            cameraClampViewport.height,
        );

        return {
            zoom,
            offsetX: clamped.tx,
            offsetY: clamped.ty,
        };
    }, [activeCameraRule, battleCameraBounds, cameraClampViewport, cityCameraBounds, towerCameraBounds]);

    const zoomAtViewPoint = useCallback((viewPoint: {x: number; y: number}, targetZoom: number) => {
        const zoom = clampZoomForRule(targetZoom);
        const currentZoom = zoomFactorRef.current;
        const currentOffset = cameraOffsetRef.current;
        const worldX = (viewPoint.x - currentOffset.x) / currentZoom;
        const worldY = (viewPoint.y - currentOffset.y) / currentZoom;
        const nextOffsetX = viewPoint.x - worldX * zoom;
        const nextOffsetY = viewPoint.y - worldY * zoom;
        const clampedCamera = clampCamera(nextOffsetX, nextOffsetY, zoom);

        applyCamera(clampedCamera);
    }, [applyCamera, clampCamera, clampZoomForRule]);

    const getViewPointFromPointerEvent = useCallback((event: PointerEvent | WheelEvent | FederatedPointerEvent) => {
        const app = appRef.current;
        if (!app) return null;

        const rect = app.canvas.getBoundingClientRect();
        return screenToViewPoint(
            event.clientX - rect.left,
            event.clientY - rect.top,
            stageTransformRef.current,
            viewport,
        );
    }, [viewport]);

    const getWorldPointFromPointerEvent = useCallback((event: PointerEvent | FederatedPointerEvent) => {
        const viewPoint = getViewPointFromPointerEvent(event);
        if (!viewPoint) return null;

        return viewToWorldPoint(viewPoint, zoomFactorRef.current, cameraOffsetRef.current);
    }, [getViewPointFromPointerEvent]);

    const selectWorldPoint = useCallback((worldPoint: {x: number; y: number}) => {
        if (!cityInteractionsEnabled) return;

        const {column, row} = pixelPositionToAxialCoordinate(worldPoint.x, worldPoint.y, HEX_RADIUS_PX);
        const cellKey = coordKey({column, row});
        const selectedCell = cellsByKey.get(cellKey);
        if (!selectedCell || selectedCell.isUnclaimed) return;

        const selectedCoreCell = selectedCell.partOfStructureId && !selectedCell.isLost
            ? cellsByKey.get(selectedCell.structureCoreCellKey ?? selectedCell.cellKey) ?? selectedCell
            : selectedCell;

        if (selectedCoreCell.cellKey === selectedCellKey) {
            onSelect(null);
            setSelectedCellKey(null);
            return;
        }

        onSelect(selectedCoreCell);
        setSelectedCellKey(selectedCoreCell.cellKey);
    }, [cellsByKey, cityInteractionsEnabled, onSelect, selectedCellKey]);

    const inputHandlersRef = useRef({
        applyCamera,
        cancelCameraAnimation,
        cityInteractionsEnabled,
        clampCamera,
        getViewPointFromPointerEvent,
        getWorldPointFromPointerEvent,
        selectWorldPoint,
        zoomAtViewPoint,
    });

    useEffect(() => {
        inputHandlersRef.current = {
            applyCamera,
            cancelCameraAnimation,
            cityInteractionsEnabled,
            clampCamera,
            getViewPointFromPointerEvent,
            getWorldPointFromPointerEvent,
            selectWorldPoint,
            zoomAtViewPoint,
        };
    }, [
        applyCamera,
        cancelCameraAnimation,
        cityInteractionsEnabled,
        clampCamera,
        getViewPointFromPointerEvent,
        getWorldPointFromPointerEvent,
        selectWorldPoint,
        zoomAtViewPoint,
    ]);

    useEffect(() => {
        setSelectedCellKey(null);
    }, [clearSelectionSignal]);

    useEffect(() => {
        if (cityInteractionsEnabled) {
            previousCityInteractionsEnabledRef.current = true;
            return;
        }

        if (!previousCityInteractionsEnabledRef.current) return;

        previousCityInteractionsEnabledRef.current = false;
        setHoveredCellKey(null);
        setSelectedCellKey(null);
        onSelect(null);
    }, [cityInteractionsEnabled, onSelect]);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        const updateCanvasSize = () => {
            const {width, height} = host.getBoundingClientRect();
            if (width <= 0 || height <= 0) return;

            setCanvasSize({width, height});
        };

        updateCanvasSize();
        const resizeObserver = new ResizeObserver(updateCanvasSize);
        resizeObserver.observe(host);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        let app: Application | null = null;
        let disposed = false;
        let cleanupInput = () => {};

        (async () => {
            if (!hostRef.current || !canvasIsReady) return;

            const nextApp = new Application();
            await nextApp.init({
                resizeTo: hostRef.current,
                backgroundColor: 0x0f0f13,
                antialias: true,
                preference: "webgl",
                failIfMajorPerformanceCaveat: false,
            });

            if (disposed || !hostRef.current) {
                nextApp.destroy({removeView: true}, {children: true, texture: false, textureSource: false, context: true});
                return;
            }

            app = nextApp;
            appRef.current = nextApp;
            hostRef.current.appendChild(nextApp.canvas);
            nextApp.canvas.style.width = "100%";
            nextApp.canvas.style.height = "100%";
            nextApp.canvas.style.imageRendering = "pixelated";
            nextApp.canvas.style.touchAction = "none";
            nextApp.canvas.style.cursor = "grab";

            const rootLayer = new Container();
            const cameraLayer = new Container();
            const sceneLayer = new Container();
            const battleLayer = new Container();
            cameraLayer.sortableChildren = true;
            sceneLayer.zIndex = 0;
            battleLayer.zIndex = 50;
            battleLayer.sortableChildren = true;
            cameraLayer.addChild(sceneLayer, battleLayer);
            rootLayer.addChild(cameraLayer);
            nextApp.stage.addChild(rootLayer);
            rootLayerRef.current = rootLayer;
            cameraLayerRef.current = cameraLayer;
            sceneLayerRef.current = sceneLayer;
            battleLayerRef.current = battleLayer;
            setPixiSceneReadyId(id => id + 1);

            const onWheel = (event: WheelEvent) => {
                inputHandlersRef.current.cancelCameraAnimation();
                event.preventDefault();
                const viewPoint = inputHandlersRef.current.getViewPointFromPointerEvent(event);
                if (!viewPoint) return;

                const zoomStep = event.deltaY < 0 ? WHEEL_ZOOM_IN_FACTOR : WHEEL_ZOOM_OUT_FACTOR;
                inputHandlersRef.current.zoomAtViewPoint(viewPoint, zoomFactorRef.current * zoomStep);
            };

            const onPointerDown = (event: PointerEvent) => {
                if (event.button !== 0) return;

                inputHandlersRef.current.cancelCameraAnimation();
                isDraggingRef.current = true;
                didDragRef.current = false;
                pointerStartRef.current = {x: event.clientX, y: event.clientY};
                cameraStartRef.current = {...cameraOffsetRef.current};
                nextApp.canvas.style.cursor = "grabbing";
            };

            const onPointerMove = (event: PointerEvent) => {
                if (isDraggingRef.current) {
                    const dx = event.clientX - pointerStartRef.current.x;
                    const dy = event.clientY - pointerStartRef.current.y;
                    if (Math.hypot(dx, dy) > DRAG_CLICK_TOLERANCE_PX) {
                        didDragRef.current = true;
                    }

                    const stageScale = stageTransformRef.current.scale || 1;
                    inputHandlersRef.current.applyCamera(inputHandlersRef.current.clampCamera(
                        cameraStartRef.current.x + dx / stageScale,
                        cameraStartRef.current.y + dy / stageScale,
                        zoomFactorRef.current,
                    ));
                    return;
                }

                const worldPoint = inputHandlersRef.current.getWorldPointFromPointerEvent(event);
                if (!worldPoint) return;
                if (!inputHandlersRef.current.cityInteractionsEnabled) {
                    setHoveredCellKey(null);
                    return;
                }

                const {column, row} = pixelPositionToAxialCoordinate(worldPoint.x, worldPoint.y, HEX_RADIUS_PX);
                setHoveredCellKey(coordKey({column, row}));
            };

            const onPointerUp = (event: PointerEvent) => {
                if (!isDraggingRef.current) return;

                isDraggingRef.current = false;
                nextApp.canvas.style.cursor = "grab";
                if (didDragRef.current) {
                    suppressNextClickRef.current = true;
                    return;
                }

                const worldPoint = inputHandlersRef.current.getWorldPointFromPointerEvent(event);
                if (!worldPoint) return;
                if (suppressNextClickRef.current) {
                    suppressNextClickRef.current = false;
                    return;
                }

                inputHandlersRef.current.selectWorldPoint(worldPoint);
            };

            nextApp.canvas.addEventListener("wheel", onWheel, {passive: false});
            nextApp.canvas.addEventListener("pointerdown", onPointerDown);
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
            cleanupInput = () => {
                nextApp.canvas.removeEventListener("wheel", onWheel);
                nextApp.canvas.removeEventListener("pointerdown", onPointerDown);
                window.removeEventListener("pointermove", onPointerMove);
                window.removeEventListener("pointerup", onPointerUp);
            };

            latestRenderRef.current?.();
        })();

        return () => {
            disposed = true;
            cleanupInput();
            rootLayerRef.current = null;
            cameraLayerRef.current = null;
            sceneLayerRef.current = null;
            battleRuntimeRef.current?.destroy();
            battleRuntimeRef.current = null;
            cancelCameraAnimation();
            battleLayerRef.current = null;
            appRef.current = null;
            if (app) {
                app.destroy({removeView: true}, {children: true, texture: false, textureSource: false, context: true});
            }
        };
    }, [cancelCameraAnimation, canvasIsReady]);

    useEffect(() => {
        const app = appRef.current;
        const battleLayer = battleLayerRef.current;
        if (!pixiSceneReadyId || !app || !battleLayer || !battleRuntime) {
            battleRuntimeRef.current?.destroy();
            battleRuntimeRef.current = null;
            return;
        }

        let disposed = false;
        battleRuntimeRef.current?.destroy();
        battleRuntimeRef.current = null;
        battleLayer.removeChildren().forEach(child => child.destroy({children: true}));

        void mountCityBattleRuntime({
            app,
            parent: battleLayer,
            config: battleRuntime,
        }).then((runtime) => {
            if (disposed) {
                runtime.destroy();
                return;
            }

            battleRuntimeRef.current = runtime;
            if (battleRuntime.retreatEnemiesSignal > 0) {
                runtime.sendEnemiesToSideBorders();
            }
        });

        return () => {
            disposed = true;
            battleRuntimeRef.current?.destroy();
            battleRuntimeRef.current = null;
        };
    }, [battleRuntime, pixiSceneReadyId]);

    useEffect(() => {
        const assetUrls = getCityAssetUrls(preparedCells, biome, topExpansionPreviewCellKeys, battlefieldHexes);
        if (!assetUrls.length) return;

        void Assets.load(assetUrls).then(() => {
            latestRenderRef.current?.();
        });
    }, [battlefieldHexes, biome, preparedCells, topExpansionPreviewCellKeys]);

    useEffect(() => {
        if (cameraClampRulesDisabledRef.current) return;

        const clampedZoom = clampZoomForRule(zoomFactorRef.current);
        applyCamera(clampCamera(
            cameraOffsetRef.current.x,
            cameraOffsetRef.current.y,
            clampedZoom,
        ));
    }, [activeCameraRule, applyCamera, cells.length, clampCamera, clampZoomForRule]);

    useEffect(() => {
        if (!cameraFocusRequest) return;
        if (!canvasIsReady) return;

        const requestKey = [
            cameraFocusRequest.target,
            cameraFocusRequest.id,
            cameraFocusRequest.focusCellKey ?? "",
        ].join(":");
        if (handledCameraFocusRequestKeyRef.current === requestKey) return;
        handledCameraFocusRequestKeyRef.current = requestKey;

        const targetRule = cameraFocusRequest.target;
        const targetBounds = getCameraRuleBounds(targetRule, cityCameraBounds, battleCameraBounds, towerCameraBounds);
        const focusZoom = targetRule === "tower"
            ? maxZoomFactor
            : clampZoomForRule(Math.max(CAMERA_FOCUS_ZOOM_FACTOR, zoomFactorRef.current), targetRule);
        const towerFocusViewPoint = targetRule === "tower"
            ? getTowerOpeningCenterViewPoint(hostRef.current, canvasSize, viewport)
            : null;
        const targetCamera = towerFocusViewPoint
            ? getCameraFocusedOnBoundsAtViewPoint(targetBounds, towerFocusViewPoint, focusZoom)
            : getCameraCenteredOnBounds(targetBounds, cameraClampViewport, focusZoom);

        animateCamera(targetCamera, () => {
            applyCamera(clampCamera(
                cameraOffsetRef.current.x,
                cameraOffsetRef.current.y,
                clampZoomForRule(zoomFactorRef.current, targetRule),
                targetRule,
            ));
            setActiveCameraRule(targetRule);
        });
    }, [
        animateCamera,
        applyCamera,
        battleCameraBounds,
        cameraFocusRequest,
        cameraClampViewport,
        canvasIsReady,
        canvasSize,
        cityCameraBounds,
        clampCamera,
        clampZoomForRule,
        maxZoomFactor,
        towerCameraBounds,
        viewport,
    ]);

    useEffect(() => {
        const renderScene = () => {
            const app = appRef.current;
            const rootLayer = rootLayerRef.current;
            const cameraLayer = cameraLayerRef.current;
            const sceneLayer = sceneLayerRef.current;
            if (!app || !rootLayer || !cameraLayer || !sceneLayer) return;

            const transform = getStageTransform(app.renderer.width, app.renderer.height, viewport);
            stageTransformRef.current = transform;
            rootLayer.position.set(transform.offsetX - viewport.x * transform.scale, transform.offsetY - viewport.y * transform.scale);
            rootLayer.scale.set(transform.scale);
            cameraLayer.position.set(camera.offsetX, camera.offsetY);
            cameraLayer.scale.set(camera.zoom);
            sceneLayer.removeChildren().forEach(child => child.destroy({children: true}));

            drawCityScene({
                sceneLayer,
                battlefieldHexes,
                cells: preparedCells,
                biome,
                cellsByKey,
                battlefieldCellKeys,
                claimedRadius,
                hoveredCellKey: cityInteractionsEnabled ? hoveredCellKey : null,
                selectedCellKey: cityInteractionsEnabled ? selectedCellKey : null,
                hoveredOutlineCells: cityInteractionsEnabled ? hoveredOutlineCells : [],
                selectedOutlineCells: cityInteractionsEnabled ? selectedOutlineCells : [],
                hoveredOutlineKey: cityInteractionsEnabled ? hoveredOutlineKey : null,
                selectedOutlineKey: cityInteractionsEnabled ? selectedOutlineKey : null,
                topExpansionPreviewCellKeys,
                expansionControls: cityInteractionsEnabled ? expansionControls : [],
                getExpansionDisabledReason,
                onExpandSide: cityInteractionsEnabled ? onExpandSide : undefined,
                showDebugAxes,
                debugAxisLines,
                hexagonPoints,
                hexagonVertexPoints,
            });
        };

        latestRenderRef.current = renderScene;
        renderScene();
    }, [
        biome,
        battlefieldHexes,
        battlefieldCellKeys,
        camera.offsetX,
        camera.offsetY,
        camera.zoom,
        cellsByKey,
        claimedRadius,
        cityInteractionsEnabled,
        debugAxisLines,
        expansionControls,
        getExpansionDisabledReason,
        hexagonPoints,
        hexagonVertexPoints,
        hoveredCellKey,
        hoveredOutlineCells,
        hoveredOutlineKey,
        onExpandSide,
        preparedCells,
        selectedCellKey,
        selectedOutlineCells,
        selectedOutlineKey,
        showDebugAxes,
        topExpansionPreviewCellKeys,
        viewport,
    ]);

    return (
        <div
            ref={hostRef}
            data-nav-scroll-ignore="true"
            style={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                background: "#0f0f13",
                overflow: "hidden",
                touchAction: "none",
            }}
        />
    );
}

function drawCityScene({
    sceneLayer,
    battlefieldHexes,
    cells,
    biome,
    cellsByKey,
    battlefieldCellKeys,
    claimedRadius,
    hoveredCellKey,
    selectedCellKey,
    hoveredOutlineCells,
    selectedOutlineCells,
    hoveredOutlineKey,
    selectedOutlineKey,
    topExpansionPreviewCellKeys,
    expansionControls,
    getExpansionDisabledReason,
    onExpandSide,
    showDebugAxes,
    debugAxisLines,
    hexagonPoints,
    hexagonVertexPoints,
}: {
    sceneLayer: Container;
    battlefieldHexes: readonly BattlefieldTerrainHex[];
    cells: readonly PreparedHexCell[];
    biome: CityBiome;
    cellsByKey: ReadonlyMap<string, HexCell>;
    battlefieldCellKeys: ReadonlySet<string>;
    claimedRadius: number;
    hoveredCellKey: string | null;
    selectedCellKey: string | null;
    hoveredOutlineCells: readonly PreparedHexCell[];
    selectedOutlineCells: readonly PreparedHexCell[];
    hoveredOutlineKey: string | null;
    selectedOutlineKey: string | null;
    topExpansionPreviewCellKeys: ReadonlySet<string>;
    expansionControls: ReturnType<typeof getExpansionControls>;
    getExpansionDisabledReason?: (option: CityExpansionOption) => string | undefined;
    onExpandSide?: (sideId: CityExpansionSideId) => void;
    showDebugAxes: boolean;
    debugAxisLines: ReturnType<typeof getDebugAxisLines>;
    hexagonPoints: readonly number[];
    hexagonVertexPoints: readonly {x: number; y: number}[];
}) {
    for (const terrainHex of battlefieldHexes) {
        drawBattlefieldTerrainHex(sceneLayer, terrainHex, hexagonPoints);
    }

    for (const cell of cells) {
        if (cell.isUnclaimed && battlefieldCellKeys.has(cell.cellKey)) continue;

        const cellLayer = new Container();
        cellLayer.x = cell.centerX;
        cellLayer.y = cell.centerY;
        sceneLayer.addChild(cellLayer);
        drawHexCell({
            cellLayer,
            cell,
            biome,
            claimedRadius,
            cellsByKey,
            hexagonPoints,
            hexagonVertexPoints,
            hoveredCellKey,
            selectedCellKey,
            topExpansionPreviewCellKeys,
        });
    }

    if (hoveredOutlineKey !== selectedOutlineKey) {
        drawStructureOutline(sceneLayer, hoveredOutlineCells, cellsByKey, hexagonVertexPoints, "#8f909c");
    }
    drawStructureOutline(sceneLayer, selectedOutlineCells, cellsByKey, hexagonVertexPoints, "#57d77a");

    if (showDebugAxes) {
        drawDebugAxes(sceneLayer, debugAxisLines);
    }

    if (onExpandSide) {
        drawExpansionControls(sceneLayer, expansionControls, getExpansionDisabledReason, onExpandSide);
    }
}

function drawBattlefieldTerrainHex(
    parent: Container,
    terrainHex: BattlefieldTerrainHex,
    hexagonPoints: readonly number[],
) {
    const cellLayer = new Container();
    cellLayer.x = terrainHex.centerX;
    cellLayer.y = terrainHex.centerY;
    parent.addChild(cellLayer);

    cellLayer.addChild(createHexShape(hexagonPoints, terrainHex.fallbackFill));

    if (terrainHex.backgroundSpriteSrc) {
        addMaskedSprite({
            parent: cellLayer,
            src: terrainHex.backgroundSpriteSrc,
            width: HEX_BACKGROUND_WIDTH,
            height: HEX_BACKGROUND_HEIGHT,
            maskPoints: hexagonPoints,
        });
    }

    if (terrainHex.shadeOpacity) {
        cellLayer.addChild(createHexShape(hexagonPoints, 0x050508, terrainHex.shadeOpacity));
    }
}

function drawHexCell({
    cellLayer,
    cell,
    biome,
    claimedRadius,
    cellsByKey,
    hexagonPoints,
    hexagonVertexPoints,
    hoveredCellKey,
    selectedCellKey,
    topExpansionPreviewCellKeys,
}: {
    cellLayer: Container;
    cell: PreparedHexCell;
    biome: CityBiome;
    claimedRadius: number;
    cellsByKey: ReadonlyMap<string, HexCell>;
    hexagonPoints: readonly number[];
    hexagonVertexPoints: readonly {x: number; y: number}[];
    hoveredCellKey: string | null;
    selectedCellKey: string | null;
    topExpansionPreviewCellKeys: ReadonlySet<string>;
}) {
    const isHovered = !cell.isUnclaimed && cell.cellKey === hoveredCellKey;
    const isSelected = !cell.isUnclaimed && cell.cellKey === selectedCellKey;
    const isClaimedTerrainPreview = cell.isUnclaimed && topExpansionPreviewCellKeys.has(cell.cellKey);
    const fallbackBaseTerrainBackground = isClaimedTerrainPreview && !cell.baseTerrainSpriteId
        ? selectBaseClaimedTerrainBackground(biome, cell.backgroundDevelopmentVector, cell)
        : undefined;
    const visibleBackgroundSpriteId = isClaimedTerrainPreview
        ? cell.baseTerrainSpriteId ?? fallbackBaseTerrainBackground?.backgroundSpriteId ?? cell.backgroundSpriteId
        : cell.backgroundSpriteId;
    const visibleBackgroundDevelopmentVector = isClaimedTerrainPreview
        ? cell.baseTerrainDevelopmentVector ?? fallbackBaseTerrainBackground?.backgroundDevelopmentVector ?? cell.backgroundDevelopmentVector
        : cell.backgroundDevelopmentVector;
    const backgroundSprite = CITY_HEX_BACKGROUND_SPRITES_BY_ID[visibleBackgroundSpriteId];
    const backgroundFill = getHexBackgroundFallbackFill(biome, visibleBackgroundDevelopmentVector, cell.kind);
    const fallbackBackground = createHexShape(hexagonPoints, backgroundFill);
    cellLayer.addChild(fallbackBackground);

    if (backgroundSprite?.src) {
        addMaskedSprite({
            parent: cellLayer,
            src: backgroundSprite.src,
            width: HEX_BACKGROUND_WIDTH,
            height: HEX_BACKGROUND_HEIGHT,
            maskPoints: hexagonPoints,
        });
    }

    const foreground = getForegroundSpriteInfo(cell);
    if (foreground) {
        const sprite = addMaskedSprite({
            parent: cellLayer,
            src: foreground.src,
            width: foreground.width,
            height: foreground.height,
            maskPoints: hexagonPoints,
        });
        sprite.x = foreground.shiftX;
        sprite.y = foreground.shiftY;
        sprite.rotation = foreground.rotationDegrees * Math.PI / 180;
    } else if (cell.kind === "city" && cell.buildingKey) {
        drawFallbackLabel(cellLayer, cell.buildingKey, cell.buildingKey, getFallbackFill(cell.buildingKey, cell.kind), hexagonPoints);
    } else if (cell.kind === "wall" && (cell.wallKey || cell.wallTopKey)) {
        const wallName = cell.wallKey ? WALL_SEGMENT_BUILDINGS[cell.wallKey]?.name ?? cell.wallKey : undefined;
        const wallTopName = cell.wallTopKey ? WALL_SUPERSTRUCTURE_BUILDINGS[cell.wallTopKey]?.name ?? cell.wallTopKey : undefined;
        const fallbackName = [wallName, wallTopName].filter(Boolean).join(" + ");
        const fallbackKey = [cell.wallKey, cell.wallTopKey].filter(Boolean).join("+");
        drawFallbackLabel(cellLayer, fallbackName, fallbackKey, getFallbackFill(fallbackName || cell.cellKey, cell.kind), hexagonPoints);
    }

    if (cell.kind === "wall") {
        const wallTop = getWallTopSpriteInfo(cell);
        if (wallTop) {
            const sprite = addMaskedSprite({
                parent: cellLayer,
                src: wallTop.src,
                width: wallTop.width,
                height: wallTop.height,
                maskPoints: hexagonPoints,
            });
            sprite.rotation = wallTop.rotationDegrees * Math.PI / 180;
        }
    }

    if (cell.isUnclaimed && !isClaimedTerrainPreview) {
        const shadeOpacity = axialDistance({column: 0, row: 0}, cell) > claimedRadius + 1
            ? OUTER_UNCLAIMED_LAND_SHADE_OPACITY
            : UNCLAIMED_LAND_SHADE_OPACITY;
        cellLayer.addChild(createHexShape(hexagonPoints, 0x050508, shadeOpacity));
    }

    if (cell.isLost) {
        cellLayer.addChild(createHexShape(hexagonPoints, 0x09090d, 0.46));
    }

    if (isHovered || isSelected) {
        const color = isSelected ? "#57d77a" : "#8f909c";
        const visibleHexSides = HEX_SIDE_DEFINITIONS.filter(side => !isSharedStructureSide(cell, side, cellsByKey));
        drawHexSideLines(cellLayer, visibleHexSides, hexagonVertexPoints, color, HEX_STROKE_WIDTH);
    }
}

function getForegroundSpriteInfo(cell: PreparedHexCell) {
    if (cell.kind === "city" && cell.buildingKey) {
        const citySpriteAtlas = buildingsSpriteAtlas[cell.developmentVector];
        const building = BUILDINGS_ATLAS[cell.developmentVector]?.[cell.buildingKey];
        const structureSpriteKey = cell.partOfStructureId && cell.initialBuildingKey
            ? STRUCTURES_BY_ID[cell.partOfStructureId]?.requiredBuildingSprites?.[cell.initialBuildingKey]
            : undefined;
        const spriteLookupKey = structureSpriteKey && citySpriteAtlas?.[structureSpriteKey]
            ? structureSpriteKey
            : cell.spriteKey && citySpriteAtlas?.[cell.spriteKey]
                ? cell.spriteKey
                : building?.visualAssetId && citySpriteAtlas?.[building.visualAssetId]
                    ? building.visualAssetId
                    : cell.buildingKey;
        const asset = spriteLookupKey ? citySpriteAtlas?.[spriteLookupKey] : undefined;
        if (!asset?.src) return null;

        const spriteZoom = Number.isFinite(asset.metadata?.zoom)
            ? Math.max(0.01, asset.metadata?.zoom ?? 1)
            : 1;
        const shift = asset.metadata?.shift ?? {x: 0, y: 0};

        return {
            src: asset.src,
            width: SPRITE_WIDTH * spriteZoom,
            height: SPRITE_HEIGHT * spriteZoom,
            shiftX: shift.x,
            shiftY: shift.y,
            rotationDegrees: 0,
        };
    }

    if (cell.kind === "wall" && cell.wallKey && cell.wallDevelopmentVector) {
        const lookupKey = getWallSpriteLookupKey(cell.wallKey);
        const asset = wallSpritesAtlas[cell.wallDevelopmentVector]?.[lookupKey];
        const metadata = wallSpriteMetadataAtlas[cell.wallDevelopmentVector]?.[lookupKey];
        if (!asset?.src) return null;

        return {
            src: asset.src,
            width: metadata?.targetSpriteSize.width ?? SPRITE_WIDTH,
            height: metadata?.targetSpriteSize.height ?? SPRITE_HEIGHT,
            shiftX: 0,
            shiftY: 0,
            rotationDegrees: metadata?.rotationDegrees ?? 0,
        };
    }

    return null;
}

function getWallTopSpriteInfo(cell: PreparedHexCell) {
    if (cell.kind !== "wall" || !cell.wallTopKey || !cell.wallTopDevelopmentVector) return null;

    const lookupKey = getWallTopSpriteLookupKey(cell.wallTopKey);
    const asset = wallTopSpritesAtlas[cell.wallTopDevelopmentVector]?.[lookupKey];
    const metadata = wallTopSpriteMetadataAtlas[cell.wallTopDevelopmentVector]?.[lookupKey];
    if (!asset?.src) return null;

    return {
        src: asset.src,
        width: metadata?.targetSpriteSize.width ?? SPRITE_WIDTH,
        height: metadata?.targetSpriteSize.height ?? SPRITE_HEIGHT,
        rotationDegrees: metadata?.rotationDegrees ?? 0,
    };
}

function addMaskedSprite({
    parent,
    src,
    width,
    height,
    maskPoints,
}: {
    parent: Container;
    src: string;
    width: number;
    height: number;
    maskPoints: readonly number[];
}) {
    const texture = Texture.from(src);
    const holder = new Container();
    const mask = createHexShape(maskPoints, 0xffffff);
    const sprite = new Sprite(texture);

    sprite.anchor.set(0.5);
    sprite.width = width;
    sprite.height = height;
    sprite.roundPixels = true;
    sprite.mask = mask;
    holder.addChild(mask, sprite);
    parent.addChild(holder);

    return sprite;
}

function createHexShape(points: readonly number[], fill: string | number, alpha = 1) {
    const graphics = new Graphics();
    graphics.poly([...points]).fill({color: fill, alpha});

    return graphics;
}

function drawFallbackLabel(
    parent: Container,
    name: string,
    key: string,
    fill: string,
    hexagonPoints: readonly number[],
) {
    parent.addChild(createHexShape(hexagonPoints, fill));
    const nameText = createOutlinedText(name, 8, 0xf5f1e8, 0, -4, "700");
    const keyText = createOutlinedText(key, 7, 0xf5f1e8, 0, 8, "500");
    parent.addChild(nameText, keyText);
}

function createOutlinedText(
    text: string,
    fontSize: number,
    fill: number,
    x: number,
    y: number,
    fontWeight: "500" | "700" | "800",
) {
    const label = new Text({
        text,
        style: {
            fill,
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize,
            fontWeight,
            stroke: {color: 0x111111, width: 2},
        },
    });
    label.anchor.set(0.5);
    label.x = x;
    label.y = y;

    return label;
}

function drawHexSideLines(
    parent: Container,
    sides: readonly typeof HEX_SIDE_DEFINITIONS[number][],
    hexagonVertexPoints: readonly {x: number; y: number}[],
    color: string,
    width: number,
) {
    const lines = new Graphics();
    for (const side of sides) {
        const start = hexagonVertexPoints[side.startVertexIndex];
        const end = hexagonVertexPoints[side.endVertexIndex];
        if (!start || !end) continue;

        lines.moveTo(start.x, start.y).lineTo(end.x, end.y);
    }
    lines.stroke({color, width});
    parent.addChild(lines);
}

function drawStructureOutline(
    parent: Container,
    cells: readonly PreparedHexCell[],
    cellsByKey: ReadonlyMap<string, HexCell>,
    hexagonVertexPoints: readonly {x: number; y: number}[],
    color: string,
) {
    for (const cell of cells) {
        const outline = new Container();
        outline.x = cell.centerX;
        outline.y = cell.centerY;
        parent.addChild(outline);
        drawHexSideLines(
            outline,
            HEX_SIDE_DEFINITIONS.filter(side => !isSharedStructureSide(cell, side, cellsByKey)),
            hexagonVertexPoints,
            color,
            HEX_STROKE_WIDTH,
        );
    }
}

function drawDebugAxes(parent: Container, axisLines: ReturnType<typeof getDebugAxisLines>) {
    for (const axis of axisLines) {
        const line = new Graphics();
        line
            .moveTo(axis.startPoint.x, axis.startPoint.y)
            .lineTo(axis.endPoint.x, axis.endPoint.y)
            .stroke({color: axis.color, width: 2});
        parent.addChild(line);

        const label = createOutlinedText(axis.label, 12, axis.color, axis.endPoint.x + 6, axis.endPoint.y - 6, "800");
        parent.addChild(label);
    }
}

function drawExpansionControls(
    parent: Container,
    expansionControls: ReturnType<typeof getExpansionControls>,
    getExpansionDisabledReason: ((option: CityExpansionOption) => string | undefined) | undefined,
    onExpandSide: (sideId: CityExpansionSideId) => void,
) {
    for (const control of expansionControls) {
        const disabledReason = getExpansionDisabledReason?.(control.option);
        const disabled = Boolean(disabledReason);
        const arrow = new Container();
        arrow.x = control.centerX;
        arrow.y = control.centerY;
        arrow.rotation = control.rotationDegrees * Math.PI / 180;
        arrow.scale.set(control.scale);
        arrow.alpha = disabled ? DISABLED_EXPANSION_ARROW_OPACITY : AVAILABLE_EXPANSION_ARROW_OPACITY;
        arrow.eventMode = "static";
        arrow.cursor = disabled ? "not-allowed" : "pointer";
        arrow.on("pointertap", (event) => {
            event.stopPropagation();
            if (!disabled) onExpandSide(control.option.side.id);
        });

        const shape = new Graphics();
        shape
            .poly([
                0, -EXPANSION_ARROW_HALF_HEIGHT,
                EXPANSION_ARROW_HALF_WIDTH, EXPANSION_ARROW_HALF_HEIGHT,
                -EXPANSION_ARROW_HALF_WIDTH, EXPANSION_ARROW_HALF_HEIGHT,
            ])
            .fill(0xd8f4ff)
            .stroke({color: 0x142a33, width: 2});
        const count = new Text({
            text: String(control.option.addedHexCount),
            style: {
                fill: 0x071014,
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 9,
                fontWeight: "800",
            },
        });
        count.anchor.set(0.5);
        count.y = 5;
        arrow.addChild(shape, count);
        parent.addChild(arrow);
    }
}

function getCityAssetUrls(
    cells: readonly PreparedHexCell[],
    biome: CityBiome,
    topExpansionPreviewCellKeys: ReadonlySet<string>,
    battlefieldHexes: readonly BattlefieldTerrainHex[],
) {
    const urls = new Set<string>();

    for (const hex of battlefieldHexes) {
        if (hex.backgroundSpriteSrc) urls.add(hex.backgroundSpriteSrc);
    }

    for (const cell of cells) {
        const isClaimedTerrainPreview = cell.isUnclaimed && topExpansionPreviewCellKeys.has(cell.cellKey);
        const fallbackBaseTerrainBackground = isClaimedTerrainPreview && !cell.baseTerrainSpriteId
            ? selectBaseClaimedTerrainBackground(biome, cell.backgroundDevelopmentVector, cell)
            : undefined;
        const visibleBackgroundSpriteId = isClaimedTerrainPreview
            ? cell.baseTerrainSpriteId ?? fallbackBaseTerrainBackground?.backgroundSpriteId ?? cell.backgroundSpriteId
            : cell.backgroundSpriteId;
        const backgroundSprite = CITY_HEX_BACKGROUND_SPRITES_BY_ID[visibleBackgroundSpriteId];
        if (backgroundSprite?.src) urls.add(backgroundSprite.src);

        const foreground = getForegroundSpriteInfo(cell);
        if (foreground?.src) urls.add(foreground.src);

        const wallTop = getWallTopSpriteInfo(cell);
        if (wallTop?.src) urls.add(wallTop.src);
    }

    return [...urls];
}

function getExpansionControls(
    expansionOptions: readonly CityExpansionOption[],
    preparedCells: readonly PreparedHexCell[],
) {
    const preparedCellsByKey = new Map(preparedCells.map(cell => [cell.cellKey, cell]));

    return expansionOptions.flatMap(option => {
        if (option.addedHexCount === 0) return [];
        const claimCells = option.boundaryHexes
            .map(hex => preparedCellsByKey.get(hex.cellKey))
            .filter((hex): hex is PreparedHexCell => Boolean(hex));
        if (claimCells.length === 0) return [];

        const arrowPosition = axialCoordinateToPixelPosition(
            option.arrowCoordinate,
            HEX_RADIUS_PX,
            HEX_EDGE_GAP_PX,
        );
        const boundaryCenter = getPointCenter(claimCells);
        const center = option.side.id === "north-west"
            ? {
                x: lerp(arrowPosition.x, boundaryCenter.x, TOP_EXPANSION_ARROW_WALL_PROXIMITY),
                y: lerp(arrowPosition.y, boundaryCenter.y, TOP_EXPANSION_ARROW_WALL_PROXIMITY),
            }
            : arrowPosition;

        return [{
            option,
            centerX: center.x,
            centerY: center.y,
            rotationDegrees: option.side.rotationDegrees,
            scale: getExpansionArrowScale(option.arrowRadius),
        }];
    });
}

function getExpansionArrowScale(radius: number): number {
    return Math.min(
        MAX_EXPANSION_ARROW_SCALE,
        MIN_EXPANSION_ARROW_SCALE + Math.max(0, radius - 2) * EXPANSION_ARROW_SCALE_PER_RADIUS,
    );
}

function getPointCenter(points: readonly {centerX: number; centerY: number}[]) {
    const total = points.reduce((sum, point) => ({
        x: sum.x + point.centerX,
        y: sum.y + point.centerY,
    }), {x: 0, y: 0});

    return {
        x: total.x / points.length,
        y: total.y / points.length,
    };
}

function getDebugAxisLines(preparedCells: readonly PreparedHexCell[]) {
    const axisRange = Math.max(
        2,
        ...preparedCells.map(cell => axialDistance({column: 0, row: 0}, cell) + 1),
    );
    const axes = [
        {
            id: "x",
            label: "x",
            color: 0xff5656,
            start: {column: -axisRange, row: 0},
            end: {column: axisRange, row: 0},
        },
        {
            id: "z",
            label: "z",
            color: 0x57a8ff,
            start: {column: 0, row: -axisRange},
            end: {column: 0, row: axisRange},
        },
        {
            id: "y",
            label: "y",
            color: 0x65e07d,
            start: {column: -axisRange, row: axisRange},
            end: {column: axisRange, row: -axisRange},
        },
    ] as const;

    return axes.map(axis => ({
        ...axis,
        startPoint: axialCoordinateToPixelPosition(axis.start, HEX_RADIUS_PX, HEX_EDGE_GAP_PX),
        endPoint: axialCoordinateToPixelPosition(axis.end, HEX_RADIUS_PX, HEX_EDGE_GAP_PX),
    }));
}

function getHexagonPoints(hexRadiusPx: number) {
    return getHexagonVertexPoints(hexRadiusPx).flatMap(point => [point.x, point.y]);
}

function getHexagonVertexPoints(hexRadiusPx: number) {
    return Array.from({length: 6}, (_, vertexIndex) => {
        const angleRadians = (Math.PI / 180) * (60 * vertexIndex - 30);

        return {
            x: hexRadiusPx * Math.cos(angleRadians),
            y: hexRadiusPx * Math.sin(angleRadians),
        };
    });
}

function getOutlineCells(
    targetCell: PreparedHexCell | undefined,
    preparedCells: readonly PreparedHexCell[],
): PreparedHexCell[] {
    if (!targetCell) return [];
    if (targetCell.kind !== "city" || !targetCell.partOfStructureId) return [targetCell];

    const targetCoreKey = targetCell.structureCoreCellKey ?? targetCell.cellKey;

    return preparedCells.filter(cell => (
        cell.kind === "city"
        && cell.partOfStructureId === targetCell.partOfStructureId
        && (cell.structureCoreCellKey ?? cell.cellKey) === targetCoreKey
    ));
}

function getOutlineKey(cell: PreparedHexCell): string {
    if (cell.kind !== "city" || !cell.partOfStructureId) return cell.cellKey;

    return `${cell.partOfStructureId}:${cell.structureCoreCellKey ?? cell.cellKey}`;
}

function getCityCameraRuleBounds(
    cameraCells: readonly PreparedHexCell[],
    preparedCells: readonly PreparedHexCell[],
    fallbackBounds: Bounds,
): Bounds {
    const bounds = cameraCells.length
        ? computeCityBounds(cameraCells, HEX_RADIUS_PX)
        : fallbackBounds;
    const topWallCenterY = preparedCells.reduce<number | null>((currentTop, cell) => {
        if (cell.kind !== "wall" || cell.isUnclaimed || cell.isLost) return currentTop;
        return currentTop === null ? cell.centerY : Math.min(currentTop, cell.centerY);
    }, null);

    if (topWallCenterY === null) return bounds;

    return {
        ...bounds,
        minY: Math.max(bounds.minY, topWallCenterY - HEX_ROW_CENTER_SPACING_PX),
    };
}

function getBattleCameraRuleBounds(battleRuntime: CityBattleRuntimeConfig): Bounds {
    const topY = battleRuntime.origin.y;
    const wallRowBottomCornerY = battleRuntime.origin.y + battleRuntime.wallY + HEX_RADIUS_PX;
    const horizontalBattlefieldPadding = CITY_CAMERA_BATTLEFIELD_SIDE_HEX_COUNT * HEX_WIDTH;

    return {
        minX: battleRuntime.origin.x - horizontalBattlefieldPadding,
        minY: topY,
        maxX: battleRuntime.origin.x + battleRuntime.battlefieldWidth + horizontalBattlefieldPadding,
        maxY: wallRowBottomCornerY,
    };
}

function getSingleHexCameraBounds(cell: PreparedHexCell): Bounds {
    return {
        minX: cell.centerX - HEX_WIDTH / 2,
        minY: cell.centerY - HEX_RADIUS_PX,
        maxX: cell.centerX + HEX_WIDTH / 2,
        maxY: cell.centerY + HEX_RADIUS_PX,
    };
}

function getCameraRuleBounds(
    rule: CameraRuleId,
    cityCameraBounds: Bounds,
    battleCameraBounds: Bounds,
    towerCameraBounds: Bounds,
): Bounds {
    if (rule === "battle") return battleCameraBounds;
    if (rule === "tower") return towerCameraBounds;
    return cityCameraBounds;
}

function mergeVerticalBounds(primary: Bounds, secondary: Bounds | null): Bounds {
    if (!secondary) return primary;

    return {
        minX: primary.minX,
        minY: Math.min(primary.minY, secondary.minY),
        maxX: primary.maxX,
        maxY: primary.maxY,
    };
}

function getViewExtent(bounds: Bounds): number {
    return Math.max(
        Math.abs(bounds.minX),
        Math.abs(bounds.minY),
        Math.abs(bounds.maxX),
        Math.abs(bounds.maxY),
        HEX_RADIUS_PX * 4,
    ) + HEX_RADIUS_PX * 2;
}

function getCameraCenteredOnBounds(bounds: Bounds, viewport: Viewport, zoom: number): CameraState {
    const targetCenterX = (bounds.minX + bounds.maxX) / 2;
    const targetCenterY = (bounds.minY + bounds.maxY) / 2;
    const viewportCenterX = viewport.x + viewport.width / 2;
    const viewportCenterY = viewport.y + viewport.height / 2;

    return {
        zoom,
        offsetX: viewportCenterX - targetCenterX * zoom,
        offsetY: viewportCenterY - targetCenterY * zoom,
    };
}

function getCameraFocusedOnBoundsAtViewPoint(
    bounds: Bounds,
    viewPoint: {x: number; y: number},
    zoom: number,
): CameraState {
    const targetCenterX = (bounds.minX + bounds.maxX) / 2;
    const targetCenterY = (bounds.minY + bounds.maxY) / 2;

    return {
        zoom,
        offsetX: viewPoint.x - targetCenterX * zoom,
        offsetY: viewPoint.y - targetCenterY * zoom,
    };
}

function getTowerOpeningCenterViewPoint(
    hostElement: HTMLElement | null,
    canvasSize: {width: number; height: number},
    viewport: Viewport,
) {
    const openingElement = document.querySelector('[data-tower-viewport-opening="true"]');
    if (!hostElement || !(openingElement instanceof HTMLElement)) return null;

    const hostRect = hostElement.getBoundingClientRect();
    const openingRect = openingElement.getBoundingClientRect();
    const transform = getStageTransform(canvasSize.width, canvasSize.height, viewport);

    return screenToViewPoint(
        openingRect.left + openingRect.width / 2 - hostRect.left,
        openingRect.top + openingRect.height / 2 - hostRect.top,
        transform,
        viewport,
    );
}

function lerp(start: number, end: number, progress: number) {
    return start + (end - start) * progress;
}

function easeInOutCubic(progress: number) {
    return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function getStageTransform(width: number, height: number, viewport: Viewport): StageTransform {
    const scale = Math.min(width / viewport.width, height / viewport.height);
    const renderedWidth = viewport.width * scale;
    const renderedHeight = viewport.height * scale;

    return {
        scale,
        offsetX: (width - renderedWidth) / 2,
        offsetY: (height - renderedHeight) / 2,
    };
}

function getCameraClampViewport(
    viewport: Viewport,
    canvasSize: {width: number; height: number},
    topInsetPx: number,
): Viewport {
    if (canvasSize.width <= 0 || canvasSize.height <= 0 || topInsetPx <= 0) {
        return viewport;
    }

    const transform = getStageTransform(canvasSize.width, canvasSize.height, viewport);
    const topInsetViewY = screenToViewPoint(0, topInsetPx, transform, viewport).y;
    const topY = Math.max(viewport.y, Math.min(topInsetViewY, viewport.y + viewport.height));
    const bottomY = viewport.y + viewport.height;

    return {
        x: viewport.x,
        y: topY,
        width: viewport.width,
        height: Math.max(1, bottomY - topY),
    };
}

function getMaxZoomForNaturalHexSize(width: number, height: number, viewport: Viewport) {
    if (width <= 0 || height <= 0) return 1;

    const stageScale = getStageTransform(width, height, viewport).scale;
    if (stageScale <= 0) return 1;

    return 1 / stageScale;
}

function screenToViewPoint(screenX: number, screenY: number, transform: StageTransform, viewport: Viewport) {
    const scale = transform.scale || 1;

    return {
        x: (screenX - transform.offsetX) / scale + viewport.x,
        y: (screenY - transform.offsetY) / scale + viewport.y,
    };
}

function viewToWorldPoint(
    viewPoint: {x: number; y: number},
    zoom: number,
    cameraOffset: {x: number; y: number},
) {
    return {
        x: (viewPoint.x - cameraOffset.x) / zoom,
        y: (viewPoint.y - cameraOffset.y) / zoom,
    };
}

function isSharedStructureSide(
    cell: HexCell,
    side: typeof HEX_SIDE_DEFINITIONS[number],
    cellsByKey: ReadonlyMap<string, HexCell>,
): boolean {
    if (cell.kind !== "city" || !cell.partOfStructureId) return false;

    const neighbor = cellsByKey.get(coordKey({
        column: cell.column + side.columnDelta,
        row: cell.row + side.rowDelta,
    }));
    if (!neighbor || neighbor.kind !== "city") return false;
    if (neighbor.partOfStructureId !== cell.partOfStructureId) return false;

    const cellCoreKey = cell.structureCoreCellKey ?? cell.cellKey;
    const neighborCoreKey = neighbor.structureCoreCellKey ?? neighbor.cellKey;
    return cellCoreKey === neighborCoreKey;
}

function getHexBackgroundFallbackFill(
    biome: CityBiome,
    vector: HexCell["backgroundDevelopmentVector"],
    kind: HexCell["kind"],
) {
    const vectorKey = getDevelopmentVectorKey(vector);
    const biomeHue: Record<CityBiome, number> = {
        alpine: 192,
        floodplain: 118,
        swamp: 86,
        steppe: 48,
        rocky: 210,
        volcanic: 8,
        coastal: 178,
        tundra: 204,
        ancientForest: 132,
    };
    const vectorHueOffset: Record<string, number> = {
        tech: 18,
        nature: -18,
        medieval: 0,
        aether: 42,
    };
    const hue = (biomeHue[biome] + (vectorHueOffset[vectorKey] ?? 0) + 360) % 360;
    const saturation = kind === "wall" ? 20 : vectorKey === "aether" ? 42 : 34;
    const lightness = kind === "wall" ? 22 : vectorKey === "tech" ? 30 : 27;

    return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function getFallbackFill(seed: string, kind: HexCell["kind"]) {
    let hash = 0;
    for (let index = 0; index < seed.length; index++) {
        hash = seed.charCodeAt(index) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    const saturation = kind === "wall" ? 22 : 46;
    const lightness = kind === "wall" ? 35 : 32;
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function getWallSpriteLookupKey(wallKey: string) {
    return WALL_SEGMENT_BUILDINGS[wallKey]?.visualAssetId ?? wallKey;
}

function getWallTopSpriteLookupKey(wallTopKey: string) {
    return WALL_SUPERSTRUCTURE_BUILDINGS[wallTopKey]?.visualAssetId ?? wallTopKey;
}

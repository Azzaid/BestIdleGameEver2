import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {buildingsSpriteAtlas} from "../../../../models/sprites/buildings/buildingsSpriteAtlas.ts";
import {wallSpriteMetadataAtlas, wallSpritesAtlas} from "../../../../models/sprites/walls/wallsSpriteAtlas.ts";
import {wallTopSpriteMetadataAtlas, wallTopSpritesAtlas} from "../../../../models/sprites/wallTops/wallTopSpriteAtlas.ts";
import type {HexCell} from "../../../../models/city/HexGrid.ts";
import {CITY_HEX_BACKGROUND_SPRITES_BY_ID} from "../../../../data/cityHexBackgrounds.ts";
import {
    CITY_BIOME_LABELS,
    getDevelopmentVectorKey,
    type CityBiome,
} from "../../../../models/city/hexBackgrounds.ts";
import {
    axialCoordinateToPixelPosition, axialDistance, clampPan,
    computeCityBounds,
    getHexagonPolygonPoints, maxZoomThatFits,
    pixelPositionToAxialCoordinate,
    coordKey
} from "./hexUtils.ts";
import {BUILDINGS_ATLAS, STRUCTURES_BY_ID} from "../../../../data/buildings/index.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../../../data/wallSegments/index.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS} from "../../../../data/wallSuperstructures/index.ts";
import {CITY_HEX_RADIUS} from "../../../../data/constants.ts";
import type {CityExpansionOption, CityExpansionSideId} from "../../../../models/city/expansion.ts";

const HEX_RADIUS_PX = CITY_HEX_RADIUS;
const HEX_STROKE_WIDTH = 3;
const HEX_EDGE_GAP_PX = 0;
const hexWidth = Math.sqrt(3) * HEX_RADIUS_PX; // flat-to-flat
const SPRITE_PADDING = 0.98; // tweak to taste (0.9–0.98)
const spriteSide = hexWidth * SPRITE_PADDING; // << correct scale now
const SPRITE_WIDTH = spriteSide;
const SPRITE_HEIGHT = spriteSide;
const HEX_BACKGROUND_PADDING = 1.04;
const HEX_BACKGROUND_WIDTH = hexWidth * HEX_BACKGROUND_PADDING;
const HEX_BACKGROUND_HEIGHT = HEX_RADIUS_PX * 2 * HEX_BACKGROUND_PADDING;
const EXPANSION_ARROW_HALF_WIDTH = hexWidth;
const EXPANSION_ARROW_HALF_HEIGHT = HEX_RADIUS_PX / 2;
const MIN_EXPANSION_ARROW_SCALE = 0.56;
const EXPANSION_ARROW_SCALE_PER_RADIUS = 0.14;
const MAX_EXPANSION_ARROW_SCALE = 1.26;
const AVAILABLE_EXPANSION_ARROW_OPACITY = 0.42;
const DISABLED_EXPANSION_ARROW_OPACITY = 0.18;
const UNCLAIMED_LAND_SHADE_OPACITY = 0.5;
const OUTER_UNCLAIMED_LAND_SHADE_OPACITY = 0.75;
const INITIAL_ZOOM_FACTOR = 1.35;
const MAX_ZOOM_FACTOR = 5;
const WHEEL_ZOOM_IN_FACTOR = 1.12;
const WHEEL_ZOOM_OUT_FACTOR = 0.88;
const DRAG_CLICK_TOLERANCE_PX = 4;

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

type SvgViewport = {
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

export default function CityHex({
                                             cells,
                                             biome,
                                             expansionOptions=[],
                                             getExpansionDisabledReason,
                                             onExpandSide,
                                             showDebugAxes=false,
                                    onSelect=()=>{}
                                         }: {
    cells: HexCell[];
    biome: CityBiome;
    expansionOptions?: readonly CityExpansionOption[];
    getExpansionDisabledReason?: (option: CityExpansionOption) => string | undefined;
    onExpandSide?: (sideId: CityExpansionSideId) => void;
    showDebugAxes?: boolean;
    onSelect?: (cell: HexCell) => void;
}) {
    // Precompute geometry
    const preparedCells = useMemo(() => {
        return cells.map((cell) => {
            const { x, y } = axialCoordinateToPixelPosition(cell, HEX_RADIUS_PX, HEX_EDGE_GAP_PX);
            return {
                ...cell,
                centerX: x,
                centerY: y,
            };
        });
    }, [cells]);

    const hexagonPolygonPoints = useMemo(() => {
        return getHexagonPolygonPoints(HEX_RADIUS_PX);
    }, []);

    const hexagonVertexPoints = useMemo(() => getHexagonVertexPoints(HEX_RADIUS_PX), []);

    const cellsByKey = useMemo(() => new Map(cells.map(cell => [cell.cellKey, cell])), [cells]);

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

    const viewBounds = useMemo(
        () => computeCityBounds(cameraCells.length ? cameraCells : preparedCells, HEX_RADIUS_PX),
        [cameraCells, preparedCells]
    );

    const cameraBounds = useMemo(
        () => computePointBounds(cameraCells) ?? viewBounds,
        [cameraCells, viewBounds],
    );

    // Camera state
    const [zoomFactor, setZoomFactor] = useState(INITIAL_ZOOM_FACTOR);
    const [cameraOffsetX, setCameraOffsetX] = useState(0);
    const [cameraOffsetY, setCameraOffsetY] = useState(0);
    const svgRef = useRef<SVGSVGElement>(null);
    const isDraggingRef = useRef(false);
    const didDragRef = useRef(false);
    const suppressNextClickRef = useRef(false);
    const startMouseRef = useRef({ x: 0, y: 0 });
    const startCameraOffsetRef = useRef({ x: 0, y: 0 });
    const cameraOffsetRef = useRef({ x: cameraOffsetX, y: cameraOffsetY });
    const zoomFactorRef = useRef(zoomFactor);
    const touchPanStartRef = useRef<{x: number; y: number} | null>(null);
    const touchPinchDistanceRef = useRef<number | null>(null);

    // Hover & selection
    const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);
    const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
    const selectedPreparedCell = useMemo<PreparedHexCell | undefined>(
        () => preparedCells.find(cell => !cell.isUnclaimed && cell.cellKey === selectedCellKey),
        [preparedCells, selectedCellKey],
    );
    const hoveredPreparedCell = useMemo<PreparedHexCell | undefined>(
        () => preparedCells.find(cell => !cell.isUnclaimed && cell.cellKey === hoveredCellKey),
        [hoveredCellKey, preparedCells],
    );
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
    const expansionControls = useMemo(
        () => getExpansionControls(expansionOptions, preparedCells),
        [expansionOptions, preparedCells],
    );
    const debugAxisLines = useMemo(
        () => getDebugAxisLines(preparedCells),
        [preparedCells],
    );

    const viewExtent = getViewExtent(viewBounds);
    const viewBoxX = -viewExtent;
    const viewBoxY = -viewExtent;
    const viewBoxW = viewExtent * 2;
    const viewBoxH = viewExtent * 2;
    const viewport = useMemo<SvgViewport>(() => ({
        x: viewBoxX,
        y: viewBoxY,
        width: viewBoxW,
        height: viewBoxH,
    }), [viewBoxH, viewBoxW, viewBoxX, viewBoxY]);

    const applyCamera = useCallback((camera: CameraState) => {
        zoomFactorRef.current = camera.zoom;
        cameraOffsetRef.current = {
            x: camera.offsetX,
            y: camera.offsetY,
        };
        setZoomFactor(camera.zoom);
        setCameraOffsetX(camera.offsetX);
        setCameraOffsetY(camera.offsetY);
    }, []);

    const clampZoomForCity = useCallback((zoom: number) => {
        const minZoomThatFits = maxZoomThatFits(cameraBounds, viewport.width, viewport.height);

        return Math.max(minZoomThatFits, Math.min(MAX_ZOOM_FACTOR, zoom));
    }, [cameraBounds, viewport.height, viewport.width]);

    const clampCamera = useCallback((offsetX: number, offsetY: number, zoom: number): CameraState => {
        const clamped = clampPan(
            offsetX,
            offsetY,
            zoom,
            cameraBounds,
            viewport.x,
            viewport.y,
            viewport.width,
            viewport.height,
        );

        return {
            zoom,
            offsetX: clamped.tx,
            offsetY: clamped.ty,
        };
    }, [cameraBounds, viewport]);

    const zoomAtSvgPoint = useCallback((svgPoint: {x: number; y: number}, targetZoom: number) => {
        const zoom = clampZoomForCity(targetZoom);
        const currentZoom = zoomFactorRef.current;
        const currentOffset = cameraOffsetRef.current;
        const worldX = (svgPoint.x - currentOffset.x) / currentZoom;
        const worldY = (svgPoint.y - currentOffset.y) / currentZoom;
        const nextOffsetX = svgPoint.x - worldX * zoom;
        const nextOffsetY = svgPoint.y - worldY * zoom;

        applyCamera(clampCamera(nextOffsetX, nextOffsetY, zoom));
    }, [applyCamera, clampCamera, clampZoomForCity]);

    const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
        if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            return;
        }
        if (!svgRef.current) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;

        const transformationMatrix = svgRef.current.getScreenCTM();
        if (!transformationMatrix) return;

        const { x, y } = svgPoint.matrixTransform(
            transformationMatrix.inverse()
        );

        const worldX = (x - cameraOffsetRef.current.x) / zoomFactorRef.current;
        const worldY = (y - cameraOffsetRef.current.y) / zoomFactorRef.current;

        const { column, row } = pixelPositionToAxialCoordinate(worldX, worldY, HEX_RADIUS_PX);
        const cellKey = coordKey({column, row});
        const selectedCell = cells.find((cell) => cell.cellKey === cellKey);
        if (!selectedCell || selectedCell.isUnclaimed) return;
        const selectedCoreCell = selectedCell.partOfStructureId
            ? cells.find((cell) => cell.cellKey === (selectedCell.structureCoreCellKey ?? selectedCell.cellKey)) ?? selectedCell
            : selectedCell;

        onSelect(selectedCoreCell)
        setSelectedCellKey(selectedCoreCell.cellKey);
    };

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (isDraggingRef.current) return;
        if (!svgRef.current) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;

        const transformationMatrix = svgRef.current.getScreenCTM();
        if (!transformationMatrix) return;

        const { x, y } = svgPoint.matrixTransform(
            transformationMatrix.inverse()
        );

        const worldX = (x - cameraOffsetRef.current.x) / zoomFactorRef.current;
        const worldY = (y - cameraOffsetRef.current.y) / zoomFactorRef.current;

        const { column, row } = pixelPositionToAxialCoordinate(worldX, worldY, HEX_RADIUS_PX);
        setHoveredCellKey(`${column},${row}`);
    };

    const handleWheelZoom = useCallback((event: WheelEvent) => {
        event.preventDefault();
        if (!svgRef.current) return;

        const svgPoint = getSvgPointFromClient(svgRef.current, event.clientX, event.clientY);
        if (!svgPoint) return;

        const zoomStep = event.deltaY < 0 ? WHEEL_ZOOM_IN_FACTOR : WHEEL_ZOOM_OUT_FACTOR;
        zoomAtSvgPoint(svgPoint, zoomFactorRef.current * zoomStep);
    }, [zoomAtSvgPoint]);

    // Drag to pan
    useEffect(() => {
        cameraOffsetRef.current = { x: cameraOffsetX, y: cameraOffsetY };
        zoomFactorRef.current = zoomFactor;
    }, [cameraOffsetX, cameraOffsetY, zoomFactor]);

    useEffect(() => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const onMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return; // left button only
            isDraggingRef.current = true;
            didDragRef.current = false;
            startMouseRef.current = { x: e.clientX, y: e.clientY };
            startCameraOffsetRef.current = { ...cameraOffsetRef.current };
            // optional: prevent text selection while dragging
            document.body.style.userSelect = "none";
            svgElement.style.cursor = "grabbing";
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const dx = e.clientX - startMouseRef.current.x;
            const dy = e.clientY - startMouseRef.current.y;
            if (Math.hypot(dx, dy) > DRAG_CLICK_TOLERANCE_PX) {
                didDragRef.current = true;
            }

            const nextTx = startCameraOffsetRef.current.x + dx;
            const nextTy = startCameraOffsetRef.current.y + dy;

            applyCamera(clampCamera(nextTx, nextTy, zoomFactorRef.current));
        };

        const onMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            if (didDragRef.current) {
                suppressNextClickRef.current = true;
            }
            document.body.style.userSelect = "";
            if (svgElement) svgElement.style.cursor = "grab";
        };

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                if (!touch) return;
                touchPanStartRef.current = {x: touch.clientX, y: touch.clientY};
                startCameraOffsetRef.current = {...cameraOffsetRef.current};
                didDragRef.current = false;
                touchPinchDistanceRef.current = null;
                return;
            }

            if (e.touches.length >= 2) {
                e.preventDefault();
                touchPanStartRef.current = null;
                touchPinchDistanceRef.current = getTouchDistance(e.touches);
                suppressNextClickRef.current = true;
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length >= 2) {
                e.preventDefault();
                const midpoint = getTouchMidpoint(e.touches);
                const svgPoint = getSvgPointFromClient(svgElement, midpoint.x, midpoint.y);
                const previousDistance = touchPinchDistanceRef.current;
                const nextDistance = getTouchDistance(e.touches);
                if (!svgPoint || !previousDistance || nextDistance <= 0) return;

                touchPinchDistanceRef.current = nextDistance;
                zoomAtSvgPoint(svgPoint, zoomFactorRef.current * (nextDistance / previousDistance));
                return;
            }

            if (e.touches.length === 1 && touchPanStartRef.current) {
                e.preventDefault();
                const touch = e.touches[0];
                if (!touch) return;
                const dx = touch.clientX - touchPanStartRef.current.x;
                const dy = touch.clientY - touchPanStartRef.current.y;
                if (Math.hypot(dx, dy) > DRAG_CLICK_TOLERANCE_PX) {
                    didDragRef.current = true;
                    suppressNextClickRef.current = true;
                }

                applyCamera(clampCamera(
                    startCameraOffsetRef.current.x + dx,
                    startCameraOffsetRef.current.y + dy,
                    zoomFactorRef.current,
                ));
            }
        };

        const onTouchEnd = () => {
            touchPanStartRef.current = null;
            touchPinchDistanceRef.current = null;
            if (didDragRef.current) {
                suppressNextClickRef.current = true;
            }
        };

        svgElement.addEventListener("mousedown", onMouseDown);
        svgElement.addEventListener("wheel", handleWheelZoom, { passive: false });
        svgElement.addEventListener("touchstart", onTouchStart, { passive: false });
        svgElement.addEventListener("touchmove", onTouchMove, { passive: false });
        svgElement.addEventListener("touchend", onTouchEnd);
        svgElement.addEventListener("touchcancel", onTouchEnd);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        // set initial cursor
        svgElement.style.cursor = "grab";

        return () => {
            svgElement.removeEventListener("mousedown", onMouseDown);
            svgElement.removeEventListener("wheel", handleWheelZoom)
            svgElement.removeEventListener("touchstart", onTouchStart);
            svgElement.removeEventListener("touchmove", onTouchMove);
            svgElement.removeEventListener("touchend", onTouchEnd);
            svgElement.removeEventListener("touchcancel", onTouchEnd);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            document.body.style.userSelect = "";
        };
    }, [applyCamera, clampCamera, handleWheelZoom, zoomAtSvgPoint]);

    useEffect(() => {
        applyCamera(clampCamera(
            cameraOffsetRef.current.x,
            cameraOffsetRef.current.y,
            clampZoomForCity(zoomFactorRef.current),
        ));
    }, [applyCamera, cells.length, clampCamera, clampZoomForCity]);


    return (
        <svg
            ref={svgRef}
            data-nav-scroll-ignore="true"
            viewBox={`${-viewExtent} ${-viewExtent} ${viewExtent * 2} ${viewExtent * 2}`}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            style={{
                width: "100%",
                height: "100%",
                background: "#0f0f13",
                imageRendering: "pixelated",
                shapeRendering: "crispEdges",
                touchAction: "none",
                userSelect: "none",
            }}
        >
            <defs>
                <polygon
                    id="hexagonPath"
                    points={hexagonPolygonPoints}
                />
            </defs>

            <g transform={`translate(${cameraOffsetX} ${cameraOffsetY}) scale(${zoomFactor})`}>
                {preparedCells.map((cell) => {
                    const {
                        centerX,
                        centerY,
                        cellKey,
                        isUnclaimed,
                        developmentVector,
                        backgroundSpriteId,
                        backgroundDevelopmentVector,
                        buildingKey,
                        spriteKey,
                        initialBuildingKey,
                        partOfStructureId,
                        kind,
                        wallKey,
                        wallDevelopmentVector,
                        wallTopKey,
                        wallTopDevelopmentVector,
                    } = cell;
                    const isHovered = !isUnclaimed && cellKey === hoveredCellKey;
                    const clipId = `clip-${cellKey}`;
                    const backgroundSprite = CITY_HEX_BACKGROUND_SPRITES_BY_ID[backgroundSpriteId];
                    const backgroundSpriteUrl = backgroundSprite?.src;
                    const backgroundFill = getHexBackgroundFallbackFill(biome, backgroundDevelopmentVector, kind);
                    const citySpriteAtlas = kind === "city" ? buildingsSpriteAtlas[developmentVector] : undefined;
                    const building = kind === "city" && buildingKey
                        ? BUILDINGS_ATLAS[developmentVector]?.[buildingKey]
                        : undefined;
                    const structureSpriteKey = kind === "city" && partOfStructureId && initialBuildingKey
                        ? STRUCTURES_BY_ID[partOfStructureId]?.requiredBuildingSprites?.[initialBuildingKey]
                        : undefined;
                    const spriteLookupKey = structureSpriteKey && citySpriteAtlas?.[structureSpriteKey]
                        ? structureSpriteKey
                        : spriteKey && citySpriteAtlas?.[spriteKey]
                            ? spriteKey
                            : building?.visualAssetId && citySpriteAtlas?.[building.visualAssetId]
                            ? building.visualAssetId
                            : buildingKey;
                    const citySpriteAsset = kind === "city" && spriteLookupKey
                        ? citySpriteAtlas?.[spriteLookupKey]
                        : undefined;
                    const spriteUrl = kind === "city" && spriteLookupKey
                        ? citySpriteAsset?.src
                        : undefined;
                    const buildingSpriteMetadata = citySpriteAsset?.metadata;
                    const buildingSpriteZoom = Number.isFinite(buildingSpriteMetadata?.zoom)
                        ? Math.max(0.01, buildingSpriteMetadata?.zoom ?? 1)
                        : 1;
                    const buildingSpriteShift = buildingSpriteMetadata?.shift ?? {x: 0, y: 0};
                    const buildingSpriteWidth = SPRITE_WIDTH * buildingSpriteZoom;
                    const buildingSpriteHeight = SPRITE_HEIGHT * buildingSpriteZoom;
                    const wallSpriteUrl = kind === "wall" && wallKey && wallDevelopmentVector
                        ? wallSpritesAtlas[wallDevelopmentVector]?.[getWallSpriteLookupKey(wallKey)]?.src
                        : undefined;
                    const wallSpriteMetadata = kind === "wall" && wallKey && wallDevelopmentVector
                        ? wallSpriteMetadataAtlas[wallDevelopmentVector]?.[getWallSpriteLookupKey(wallKey)]
                        : undefined;
                    const wallSpriteWidth = wallSpriteMetadata?.targetSpriteSize.width ?? SPRITE_WIDTH;
                    const wallSpriteHeight = wallSpriteMetadata?.targetSpriteSize.height ?? SPRITE_HEIGHT;
                    const wallSpriteRotation = wallSpriteMetadata?.rotationDegrees ?? 0;
                    const wallTopSpriteUrl = kind === "wall" && wallTopKey && wallTopDevelopmentVector
                        ? wallTopSpritesAtlas[wallTopDevelopmentVector]?.[getWallTopSpriteLookupKey(wallTopKey)]?.src
                        : undefined;
                    const wallTopSpriteMetadata = kind === "wall" && wallTopKey && wallTopDevelopmentVector
                        ? wallTopSpriteMetadataAtlas[wallTopDevelopmentVector]?.[getWallTopSpriteLookupKey(wallTopKey)]
                        : undefined;
                    const wallTopSpriteWidth = wallTopSpriteMetadata?.targetSpriteSize.width ?? SPRITE_WIDTH;
                    const wallTopSpriteHeight = wallTopSpriteMetadata?.targetSpriteSize.height ?? SPRITE_HEIGHT;
                    const wallTopSpriteRotation = wallTopSpriteMetadata?.rotationDegrees ?? 0;
                    const hasForegroundTexture = Boolean(spriteUrl || wallSpriteUrl || wallTopSpriteUrl);
                    const wallName = wallKey ? WALL_SEGMENT_BUILDINGS[wallKey]?.name ?? wallKey : undefined;
                    const wallTopName = wallTopKey ? WALL_SUPERSTRUCTURE_BUILDINGS[wallTopKey]?.name ?? wallTopKey : undefined;
                    const fallbackName = kind === "wall"
                        ? [wallName, wallTopName].filter(Boolean).join(" + ")
                        : buildingKey;
                    const fallbackKey = kind === "wall"
                        ? [wallKey, wallTopKey].filter(Boolean).join("+")
                        : buildingKey;
                    const fallbackFill = getFallbackFill(fallbackName ?? cellKey, kind);
                    const visibleHexSides = HEX_SIDE_DEFINITIONS.filter(side => !isSharedStructureSide(cell, side, cellsByKey));
                    const unclaimedShadeOpacity = axialDistance({column: 0, row: 0}, cell) > claimedRadius + 1
                        ? OUTER_UNCLAIMED_LAND_SHADE_OPACITY
                        : UNCLAIMED_LAND_SHADE_OPACITY;

                    return (
                        <g
                            key={cellKey}
                            transform={`translate(${centerX} ${centerY})`}
                            pointerEvents={isUnclaimed ? "none" : undefined}
                        >
                            <clipPath id={clipId}>
                                <use href="#hexagonPath" />
                            </clipPath>

                            <use
                                href="#hexagonPath"
                                fill={backgroundFill}
                                stroke="none"
                            />

                            {backgroundSpriteUrl && (
                                <image
                                    href={backgroundSpriteUrl}
                                    x={-HEX_BACKGROUND_WIDTH / 2}
                                    y={-HEX_BACKGROUND_HEIGHT / 2}
                                    width={HEX_BACKGROUND_WIDTH}
                                    height={HEX_BACKGROUND_HEIGHT}
                                    preserveAspectRatio="xMidYMid slice"
                                    clipPath={`url(#${clipId})`}
                                    style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                                >
                                    <title>{`${CITY_BIOME_LABELS[biome]} ${getDevelopmentVectorKey(backgroundDevelopmentVector)} terrain`}</title>
                                </image>
                            )}
                            {spriteUrl && (
                                <image
                                    href={spriteUrl}
                                    x={-buildingSpriteWidth / 2 + buildingSpriteShift.x}
                                    y={-buildingSpriteHeight / 2 + buildingSpriteShift.y}
                                    width={buildingSpriteWidth}
                                    height={buildingSpriteHeight}
                                    preserveAspectRatio="xMidYMid meet"
                                    clipPath={`url(#${clipId})`}
                                    style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                                />
                            )}
                            {wallSpriteUrl && (
                                <g transform={`rotate(${wallSpriteRotation})`} clipPath={`url(#${clipId})`}>
                                    <image
                                        href={wallSpriteUrl}
                                        x={-wallSpriteWidth / 2}
                                        y={-wallSpriteHeight / 2}
                                        width={wallSpriteWidth}
                                        height={wallSpriteHeight}
                                        preserveAspectRatio="xMidYMid meet"
                                        style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                                    />
                                </g>
                            )}
                            {wallTopSpriteUrl && (
                                <g transform={`rotate(${wallTopSpriteRotation})`} clipPath={`url(#${clipId})`}>
                                    <image
                                        href={wallTopSpriteUrl}
                                        x={-wallTopSpriteWidth / 2}
                                        y={-wallTopSpriteHeight / 2}
                                        width={wallTopSpriteWidth}
                                        height={wallTopSpriteHeight}
                                        preserveAspectRatio="xMidYMid meet"
                                        style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                                    />
                                </g>
                            )}
                            {fallbackKey && !hasForegroundTexture && (
                                <>
                                    <use
                                        href="#hexagonPath"
                                        fill={fallbackFill}
                                        clipPath={`url(#${clipId})`}
                                        style={{ pointerEvents: "none" }}
                                    />
                                    <text
                                        x="0"
                                        y="-4"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#f5f1e8"
                                        fontSize="8"
                                        fontWeight="700"
                                        style={{ pointerEvents: "none", paintOrder: "stroke", stroke: "#111", strokeWidth: 2 }}
                                    >
                                        {fallbackName}
                                    </text>
                                    <text
                                        x="0"
                                        y="8"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#f5f1e8"
                                        fontSize="7"
                                        style={{ pointerEvents: "none", paintOrder: "stroke", stroke: "#111", strokeWidth: 2 }}
                                    >
                                        {fallbackKey}
                                    </text>
                                </>
                            )}
                            {isUnclaimed && (
                                <use
                                    href="#hexagonPath"
                                    fill="#050508"
                                    fillOpacity={unclaimedShadeOpacity}
                                    clipPath={`url(#${clipId})`}
                                />
                            )}
                            {isHovered && visibleHexSides.map(side => {
                                const start = hexagonVertexPoints[side.startVertexIndex];
                                const end = hexagonVertexPoints[side.endVertexIndex];
                                if (!start || !end) return null;

                                return (
                                    <line
                                        key={`${cellKey}-${side.startVertexIndex}-${side.endVertexIndex}`}
                                        x1={start.x}
                                        y1={start.y}
                                        x2={end.x}
                                        y2={end.y}
                                        stroke="#8f909c"
                                        strokeWidth={HEX_STROKE_WIDTH}
                                        vectorEffect="non-scaling-stroke"
                                        pointerEvents="none"
                                    />
                                );
                            })}
                        </g>
                    );
                })}
                {hoveredOutlineKey !== selectedOutlineKey && (
                    <StructureOutlineOverlay
                        cells={hoveredOutlineCells}
                        cellsByKey={cellsByKey}
                        hexagonVertexPoints={hexagonVertexPoints}
                        color="#8f909c"
                        layerKey="hovered"
                    />
                )}
                <StructureOutlineOverlay
                    cells={selectedOutlineCells}
                    cellsByKey={cellsByKey}
                    hexagonVertexPoints={hexagonVertexPoints}
                    color="#57d77a"
                    layerKey="selected"
                />
                {showDebugAxes && (
                    <DebugAxisOverlay axisLines={debugAxisLines} />
                )}
                {onExpandSide && expansionControls.map((control) => {
                    const disabledReason = getExpansionDisabledReason?.(control.option);
                    const disabled = Boolean(disabledReason);

                    return (
                        <g
                            key={control.option.side.id}
                            role="button"
                            tabIndex={0}
                            aria-disabled={disabled}
                            aria-label={control.option.side.label}
                            transform={`translate(${control.centerX} ${control.centerY})`}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (!disabled) onExpandSide(control.option.side.id);
                            }}
                            onKeyDown={(event) => {
                                if (disabled || (event.key !== "Enter" && event.key !== " ")) return;
                                event.preventDefault();
                                onExpandSide(control.option.side.id);
                            }}
                            style={{cursor: disabled ? "not-allowed" : "pointer"}}
                        >
                            <title>
                                {disabledReason ?? `${control.option.side.label} by ${control.option.addedHexCount} hexes`}
                            </title>
                            <g opacity={disabled ? DISABLED_EXPANSION_ARROW_OPACITY : AVAILABLE_EXPANSION_ARROW_OPACITY}>
                                <path
                                    d={`M 0 ${-EXPANSION_ARROW_HALF_HEIGHT} L ${EXPANSION_ARROW_HALF_WIDTH} ${EXPANSION_ARROW_HALF_HEIGHT} L ${-EXPANSION_ARROW_HALF_WIDTH} ${EXPANSION_ARROW_HALF_HEIGHT} Z`}
                                    transform={`rotate(${control.rotationDegrees}) scale(${control.scale})`}
                                    fill="#d8f4ff"
                                    stroke="#142a33"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                />
                                <text
                                    y="5"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="#071014"
                                    fontSize="9"
                                    fontWeight="800"
                                    style={{pointerEvents: "none"}}
                                >
                                    {control.option.addedHexCount}
                                </text>
                            </g>
                        </g>
                    );
                })}
            </g>
        </svg>
    );
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

        return [{
            option,
            centerX: arrowPosition.x,
            centerY: arrowPosition.y,
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

function getDebugAxisLines(preparedCells: readonly PreparedHexCell[]) {
    const axisRange = Math.max(
        2,
        ...preparedCells.map(cell => axialDistance({column: 0, row: 0}, cell) + 1),
    );
    const axes = [
        {
            id: "x",
            label: "x",
            color: "#ff5656",
            start: {column: -axisRange, row: 0},
            end: {column: axisRange, row: 0},
        },
        {
            id: "z",
            label: "z",
            color: "#57a8ff",
            start: {column: 0, row: -axisRange},
            end: {column: 0, row: axisRange},
        },
        {
            id: "y",
            label: "y",
            color: "#65e07d",
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

function DebugAxisOverlay({
    axisLines,
}: {
    axisLines: ReturnType<typeof getDebugAxisLines>;
}) {
    return (
        <g pointerEvents="none">
            {axisLines.map(axis => (
                <g key={axis.id}>
                    <line
                        x1={axis.startPoint.x}
                        y1={axis.startPoint.y}
                        x2={axis.endPoint.x}
                        y2={axis.endPoint.y}
                        stroke={axis.color}
                        strokeWidth={2}
                        strokeDasharray="8 5"
                        vectorEffect="non-scaling-stroke"
                    />
                    <text
                        x={axis.endPoint.x}
                        y={axis.endPoint.y}
                        dx={6}
                        dy={-6}
                        fill={axis.color}
                        fontSize={12}
                        fontWeight={800}
                        style={{paintOrder: "stroke", stroke: "#050508", strokeWidth: 3}}
                    >
                        {axis.label}
                    </text>
                </g>
            ))}
        </g>
    );
}

function StructureOutlineOverlay({
    cells,
    cellsByKey,
    hexagonVertexPoints,
    color,
    layerKey,
}: {
    cells: readonly PreparedHexCell[];
    cellsByKey: ReadonlyMap<string, HexCell>;
    hexagonVertexPoints: readonly {x: number; y: number}[];
    color: string;
    layerKey: string;
}) {
    if (cells.length === 0) return null;

    return (
        <>
            {cells.map(cell => (
                <g
                    key={`${layerKey}-${cell.cellKey}`}
                    transform={`translate(${cell.centerX} ${cell.centerY})`}
                    pointerEvents="none"
                >
                    {HEX_SIDE_DEFINITIONS
                        .filter(side => !isSharedStructureSide(cell, side, cellsByKey))
                        .map(side => {
                            const start = hexagonVertexPoints[side.startVertexIndex];
                            const end = hexagonVertexPoints[side.endVertexIndex];
                            if (!start || !end) return null;

                            return (
                                <line
                                    key={`${layerKey}-${cell.cellKey}-${side.startVertexIndex}-${side.endVertexIndex}`}
                                    x1={start.x}
                                    y1={start.y}
                                    x2={end.x}
                                    y2={end.y}
                                    stroke={color}
                                    strokeWidth={HEX_STROKE_WIDTH}
                                    vectorEffect="non-scaling-stroke"
                                />
                            );
                        })}
                </g>
            ))}
        </>
    );
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

function computePointBounds(points: readonly {centerX: number; centerY: number}[]): Bounds | null {
    if (!points.length) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of points) {
        minX = Math.min(minX, point.centerX);
        minY = Math.min(minY, point.centerY);
        maxX = Math.max(maxX, point.centerX);
        maxY = Math.max(maxY, point.centerY);
    }

    return {minX, minY, maxX, maxY};
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

function getSvgPointFromClient(svg: SVGSVGElement, clientX: number, clientY: number) {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const transformationMatrix = svg.getScreenCTM();
    if (!transformationMatrix) return null;

    return point.matrixTransform(transformationMatrix.inverse());
}

function getTouchDistance(touches: TouchList): number {
    const first = touches[0];
    const second = touches[1];
    if (!first || !second) return 0;

    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function getTouchMidpoint(touches: TouchList) {
    const first = touches[0];
    const second = touches[1];
    if (!first || !second) return {x: 0, y: 0};

    return {
        x: (first.clientX + second.clientX) / 2,
        y: (first.clientY + second.clientY) / 2,
    };
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


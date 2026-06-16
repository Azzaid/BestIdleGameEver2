import React, {useEffect, useMemo, useRef, useState} from "react";
import {buildingsSpriteAtlas} from "../../../../models/sprites/buildings/buildingsSpriteAtlas.ts";
import type {HexCell} from "../../../../models/city/HexGrid.ts";
import {
    axialCoordinateToPixelPosition, clampPan,
    computeCityBounds,
    getHexagonPolygonPoints, maxZoomThatFits,
    pixelPositionToAxialCoordinate,
    coordKey
} from "./hexUtils.ts";
import cityBackground from '../../../../assets/city/background/Top-down_map_view_circular_lan.jpeg'
import {ALL_WALL_BUILDINGS} from "../../../../data/wall/index.ts";
import medievalCrudeWoodTowerPlatform from "../../../../assets/battle/gunParts/medieval/medieval_base_crude-wood.png";
import {superstructures} from "../../../../data/identificators/index.ts";

const HEX_RADIUS_PX = 32;
const HEX_STROKE_WIDTH = 2;
const hexWidth = Math.sqrt(3) * HEX_RADIUS_PX; // flat-to-flat
const SPRITE_PADDING = 0.98; // tweak to taste (0.9–0.98)
const spriteSide = hexWidth * SPRITE_PADDING; // << correct scale now
const SPRITE_WIDTH = spriteSide;
const SPRITE_HEIGHT = spriteSide;

const AUTHORED_HEX_RADIUS = 32;                 // how the image was generated
const backgroundScale = HEX_RADIUS_PX / AUTHORED_HEX_RADIUS; // = 1 if 32

const imagePixelWidth = 768;
const imagePixelHeight = 768;

const backgroundWorldWidth  = imagePixelWidth  * backgroundScale;
const backgroundWorldHeight = imagePixelHeight * backgroundScale;

// Center it on world origin so it aligns with your grid centered at (0,0)
const backgroundX = -backgroundWorldWidth  / 2;
const backgroundY = -backgroundWorldHeight / 2;

const wallTopSpriteAtlas: Record<string, string> = {
    [superstructures.medieval.scaffoldTowerBase]: medievalCrudeWoodTowerPlatform,
};


export default function CityHex({
                                             cells,
                                    onSelect=()=>{}
                                         }: {
    cells: HexCell[];
    onSelect?: (cell: HexCell) => void;
}) {
    // Precompute geometry
    const preparedCells = useMemo(() => {
        return cells.map((cell) => {
            const { x, y } = axialCoordinateToPixelPosition(cell, HEX_RADIUS_PX, HEX_STROKE_WIDTH + 1);
            return {
                ...cell,
                centerX: x,
                centerY: y,
                spriteX: x - spriteSide / 2,
                spriteY: y - spriteSide / 2,
            };
        });
    }, [cells]);

    const hexagonPolygonPoints = useMemo(() => {
        return getHexagonPolygonPoints(HEX_RADIUS_PX);
    }, []);

    const cityBounds = useMemo(
        () => computeCityBounds(preparedCells, HEX_RADIUS_PX),
        [preparedCells]
    );

    // Camera state
    const [zoomFactor, setZoomFactor] = useState(2);
    const [cameraOffsetX, setCameraOffsetX] = useState(0);
    const [cameraOffsetY, setCameraOffsetY] = useState(0);
    const svgRef = useRef<SVGSVGElement>(null);
    const isDraggingRef = useRef(false);
    const startMouseRef = useRef({ x: 0, y: 0 });
    const startCameraOffsetRef = useRef({ x: 0, y: 0 });
    const cameraOffsetRef = useRef({ x: cameraOffsetX, y: cameraOffsetY });

    // Hover & selection
    const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);
    const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);

    const viewExtent = Math.max(backgroundWorldWidth, backgroundWorldHeight) / 2;
    const viewBoxX = -viewExtent;
    const viewBoxY = -viewExtent;
    const viewBoxW = viewExtent * 2;
    const viewBoxH = viewExtent * 2;

    const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;

        const transformationMatrix = svgRef.current.getScreenCTM();
        if (!transformationMatrix) return;

        const { x, y } = svgPoint.matrixTransform(
            transformationMatrix.inverse()
        );

        const worldX = (x - cameraOffsetX) / zoomFactor;
        const worldY = (y - cameraOffsetY) / zoomFactor;

        const { column, row } = pixelPositionToAxialCoordinate(worldX, worldY, HEX_RADIUS_PX);
        const cellKey = coordKey({column, row});
        const selectedCell = cells.find((cell) => cell.cellKey === cellKey);
        if (!selectedCell) return;

        onSelect(selectedCell)
        setSelectedCellKey(cellKey);
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

        const worldX = (x - cameraOffsetX) / zoomFactor;
        const worldY = (y - cameraOffsetY) / zoomFactor;

        const { column, row } = pixelPositionToAxialCoordinate(worldX, worldY, HEX_RADIUS_PX);
        setHoveredCellKey(`${column},${row}`);
    };

    const handleWheelZoom = (event: WheelEvent) => {
        event.preventDefault();
        if (!svgRef.current) return;

        // 1) figure out mouse in SVG coordinates
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = event.clientX; pt.y = event.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const svgPt = pt.matrixTransform(ctm.inverse());

        // 2) world point under cursor before zoom (keep this fixed)
        const worldX = (svgPt.x - cameraOffsetRef.current.x) / zoomFactor;
        const worldY = (svgPt.y - cameraOffsetRef.current.y) / zoomFactor;

        // 3) compute new zoom with limits
        const zoomStep = event.deltaY < 0 ? 1.1 : 0.9;

        // City must always fit in viewport when zoomed out:
        const minZoomThatFits = maxZoomThatFits(cityBounds, viewBoxW, viewBoxH);

        // Hard cap for zooming in:
        const hardMaxZoom = 2;
        // Apply wheel step and clamp:
        let proposedZoom = zoomFactor * zoomStep;

        // Clamp so: minZoom ≤ zoom ≤ hardMax
        proposedZoom = Math.max(minZoomThatFits, Math.min(hardMaxZoom, proposedZoom));

        // optional snap near integers
        const near = Math.round(proposedZoom);
        if (Math.abs(proposedZoom - near) < 0.06) proposedZoom = near;

        // 4) adjust pan so the world point under cursor stays under cursor
        const nextTx = svgPt.x - worldX * proposedZoom;
        const nextTy = svgPt.y - worldY * proposedZoom;

        // 5) clamp pan so city stays inside
        const clamped = clampPan(
            nextTx, nextTy, proposedZoom,
            cityBounds,
            viewBoxX, viewBoxY, viewBoxW, viewBoxH
        );

        setZoomFactor(proposedZoom);
        setCameraOffsetX(clamped.tx);
        setCameraOffsetY(clamped.ty);
    };

    // Drag to pan
    useEffect(() => {
        cameraOffsetRef.current = { x: cameraOffsetX, y: cameraOffsetY };
    }, [cameraOffsetX, cameraOffsetY]);

    useEffect(() => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const onMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return; // left button only
            isDraggingRef.current = true;
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

            const nextTx = startCameraOffsetRef.current.x + dx;
            const nextTy = startCameraOffsetRef.current.y + dy;

            const clamped = clampPan(
                nextTx, nextTy, zoomFactor,
                cityBounds,
                viewBoxX, viewBoxY, viewBoxW, viewBoxH
            );

            setCameraOffsetX(clamped.tx);
            setCameraOffsetY(clamped.ty);
        };

        const onMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            document.body.style.userSelect = "";
            if (svgElement) svgElement.style.cursor = "grab";
        };

        svgElement.addEventListener("mousedown", onMouseDown);
        svgElement.addEventListener("wheel", handleWheelZoom, { passive: false });
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        // set initial cursor
        svgElement.style.cursor = "grab";

        return () => {
            svgElement.removeEventListener("mousedown", onMouseDown);
            svgElement.removeEventListener("wheel", handleWheelZoom)
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            document.body.style.userSelect = "";
        };
    }, [zoomFactor]);


    return (
        <svg
            ref={svgRef}
            viewBox={`${-viewExtent} ${-viewExtent} ${viewExtent * 2} ${viewExtent * 2}`}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            style={{
                width: "100%",
                height: "100%",
                background: "#0f0f13",
                imageRendering: "pixelated",
                shapeRendering: "crispEdges",
            }}
        >
            <defs>
                <polygon
                    id="hexagonPath"
                    points={hexagonPolygonPoints}
                />
            </defs>

            <g transform={`translate(${cameraOffsetX} ${cameraOffsetY}) scale(${zoomFactor})`}>
                <image
                    href={cityBackground}     // put your file in public/backgrounds/
                    x={backgroundX}
                    y={backgroundY}
                    width={backgroundWorldWidth}
                    height={backgroundWorldHeight}
                    preserveAspectRatio="none"           // keeps exact authored scale
                    style={{ imageRendering: "pixelated" }}
                />
                {preparedCells.map((cell) => {
                    const { centerX, centerY, cellKey, developmentVector, buildingKey, kind, wallKey, wallTopKey} = cell;
                    const isSelected = cellKey === selectedCellKey;
                    const isHovered = cellKey === hoveredCellKey;
                    const clipId = `clip-${cellKey}`;
                    const spriteUrl = kind === "city" && buildingKey
                        ? buildingsSpriteAtlas[developmentVector]?.[buildingKey]
                        : undefined;
                    const wallTopSpriteUrl = kind === "wall" && wallTopKey ? wallTopSpriteAtlas[wallTopKey] : undefined;
                    const wallName = wallKey ? ALL_WALL_BUILDINGS[wallKey]?.name ?? wallKey : undefined;
                    const wallTopName = wallTopKey ? ALL_WALL_BUILDINGS[wallTopKey]?.name ?? wallTopKey : undefined;
                    const fallbackName = kind === "wall"
                        ? [wallName, wallTopName].filter(Boolean).join(" + ")
                        : buildingKey;
                    const fallbackKey = kind === "wall"
                        ? [wallKey, wallTopKey].filter(Boolean).join("+")
                        : buildingKey;
                    const fallbackFill = getFallbackFill(fallbackName ?? cellKey, kind);

                    return (
                        <g
                            key={cellKey}
                            transform={`translate(${centerX} ${centerY})`}
                        >
                            <clipPath id={clipId}>
                                <use href="#hexagonPath" />
                            </clipPath>

                            <use
                                href="#hexagonPath"
                                fill={kind === "wall" ? "#2c2f38" : "#8016161b"}
                                stroke={
                                isSelected
                                    ? "#2e2a17"
                                    : isHovered
                                        ? "#6f6f7a" : "#16161b"
                                }
                                strokeWidth={HEX_STROKE_WIDTH}
                                vectorEffect="non-scaling-stroke"
                            />

                            {spriteUrl && (
                                <image
                                    href={spriteUrl}
                                    x={-SPRITE_WIDTH / 2}
                                    y={-SPRITE_HEIGHT / 2}
                                    width={SPRITE_WIDTH}
                                    height={SPRITE_HEIGHT}
                                    preserveAspectRatio="xMidYMid meet"
                                    clipPath={`url(#${clipId})`}
                                    style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                                />
                            )}
                            {wallTopSpriteUrl && (
                                <image
                                    href={wallTopSpriteUrl}
                                    x={-SPRITE_WIDTH / 2}
                                    y={-SPRITE_HEIGHT / 2}
                                    width={SPRITE_WIDTH}
                                    height={SPRITE_HEIGHT}
                                    preserveAspectRatio="xMidYMid meet"
                                    clipPath={`url(#${clipId})`}
                                    style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                                />
                            )}
                            {fallbackKey && !spriteUrl && !wallTopSpriteUrl && (
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
                        </g>
                    );
                })}
            </g>
        </svg>
    );
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

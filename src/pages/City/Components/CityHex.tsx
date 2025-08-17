import React, { useMemo, useRef, useState, useEffect } from "react";
import { buildingsSpriteAtlas  } from "../../../models/sprites/buildings/buildingsSpriteAtlas.ts";
import type {AxialCoordinate, HexCell} from "../../../models/city/HexGrid.ts";

// ---------- Math helpers (pointy-top axial) ----------
const HEX_RADIUS_PX = 32;
const SQUARE_ROOT_OF_3 = Math.sqrt(3);
const HEX_STROKE_WIDTH = 2;
const hexWidth = Math.sqrt(3) * HEX_RADIUS_PX; // flat-to-flat
const SPRITE_PADDING = 0.98; // tweak to taste (0.9–0.98)
const spriteSide = hexWidth * SPRITE_PADDING; // << correct scale now
const SPRITE_WIDTH = spriteSide;
const SPRITE_HEIGHT = spriteSide;

function getHexagonPolygonPoints(
    radiusPx = HEX_RADIUS_PX
) {
    const polygonPoints: string[] = [];
    for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
        const angleRadians =
            (Math.PI / 180) * (60 * vertexIndex - 30); // pointy-top
        const vertexX = radiusPx * Math.cos(angleRadians);
        const vertexY = radiusPx * Math.sin(angleRadians);
        polygonPoints.push(`${vertexX},${vertexY}`);
    }
    return polygonPoints.join(" ");
}

function axialCoordinateToPixelPosition(
    { column, row }: AxialCoordinate,
    hexRadiusPx = HEX_RADIUS_PX,
    gapBetweenEdgesPx = HEX_STROKE_WIDTH + 1 // e.g., your stroke width (1–2 px works well)
) {
    // Distance between centers of adjacent hexes (no gap) = √3 * R.
    // To get a visible gap g between edges, scale all center distances by:
    //   scale = (√3*R + g) / (√3*R) = 1 + g / (√3*R)
    const scale =
        1 + (gapBetweenEdgesPx / (SQUARE_ROOT_OF_3 * hexRadiusPx));

    const x =
        scale *
        hexRadiusPx *
        (SQUARE_ROOT_OF_3 * column + (SQUARE_ROOT_OF_3 / 2) * row);

    const y = scale * hexRadiusPx * (1.5 * row);

    return { x, y };
}

function pixelPositionToAxialCoordinate(
    pixelX: number,
    pixelY: number,
    radiusPx = HEX_RADIUS_PX
): AxialCoordinate {
    // Fractional axial
    const fractionalColumn =
        (SQUARE_ROOT_OF_3 / 3 * pixelX - 1 / 3 * pixelY) / radiusPx;
    const fractionalRow = (2 / 3 * pixelY) / radiusPx;

    // Convert to cube coordinates for rounding
    const cubeX = fractionalColumn;
    const cubeZ = fractionalRow;
    const cubeY = -cubeX - cubeZ;

    let roundedCubeX = Math.round(cubeX);
    let roundedCubeY = Math.round(cubeY);
    let roundedCubeZ = Math.round(cubeZ);

    const deltaX = Math.abs(roundedCubeX - cubeX);
    const deltaY = Math.abs(roundedCubeY - cubeY);
    const deltaZ = Math.abs(roundedCubeZ - cubeZ);

    if (deltaX > deltaY && deltaX > deltaZ) {
        roundedCubeX = -roundedCubeY - roundedCubeZ;
    } else if (deltaY > deltaZ) {
        roundedCubeY = -roundedCubeX - roundedCubeZ;
    } else {
        roundedCubeZ = -roundedCubeX - roundedCubeY;
    }

    return { column: roundedCubeX, row: roundedCubeZ };
}

// ---------- Component ----------
export default function CityHex({
                                             radiusInCells = 8,
                                             cells,
                                    onSelect=()=>{}
                                         }: {
    radiusInCells?: number;
    cells: HexCell[];
    onSelect?: (cell: AxialCoordinate) => void;
}) {
    // Precompute geometry
    const preparedCells = useMemo(() => {
        return cells.map((cell) => {
            const { x, y } = axialCoordinateToPixelPosition(cell);
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

        const { column, row } = pixelPositionToAxialCoordinate(worldX, worldY);
        onSelect({ column, row })
        setSelectedCellKey(`${column},${row}`);
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

        const { column, row } = pixelPositionToAxialCoordinate(worldX, worldY);
        setHoveredCellKey(`${column},${row}`);
    };

    // Zoom wheel
    const handleWheelZoom = (event: WheelEvent) => {
        event.preventDefault();
        const zoomChange = event.deltaY < 0 ? 1.1 : 0.9;
        setZoomFactor((currentZoom) => {
            const newZoom = Math.max(0.5, Math.min(8, currentZoom * zoomChange));
            const nearInteger = Math.round(newZoom);
            return Math.abs(newZoom - nearInteger) < 0.06
                ? nearInteger
                : newZoom;
        });
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
            const nx = startCameraOffsetRef.current.x + dx;
            const ny = startCameraOffsetRef.current.y + dy;
            // update state (this will re-render, but listeners stay intact)
            setCameraOffsetX(nx);
            setCameraOffsetY(ny);
        };

        const onMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            document.body.style.userSelect = "";
            if (svgElement) svgElement.style.cursor = "grab";
        };

        svgElement.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        // set initial cursor
        svgElement.style.cursor = "grab";

        return () => {
            svgElement.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            document.body.style.userSelect = "";
        };
    }, []);

    useEffect(() => {
        const svgElement = svgRef.current;
        if (!svgElement) return;
        svgElement.addEventListener("wheel", handleWheelZoom, { passive: false });
        return () => {
            svgElement.removeEventListener("wheel", handleWheelZoom)
        }
    }, []);

    const viewExtent = (radiusInCells + 2) * HEX_RADIUS_PX * 2.2;

    return (
        <svg
            ref={svgRef}
            viewBox={`${-viewExtent} ${-viewExtent} ${viewExtent * 2} ${viewExtent * 2}`}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            style={{
                width: "100%",
                height: "80vh",
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
                {preparedCells.map((cell) => {
                    const cellKey = `${cell.column},${cell.row}`;
                    const isSelected = cellKey === selectedCellKey;
                    const isHovered = cellKey === hoveredCellKey;
                    const clipId = `clip-${cellKey}`;

                    return (
                        <g
                            key={cellKey}
                            transform={`translate(${cell.centerX} ${cell.centerY})`}
                        >
                            <clipPath id={clipId}>
                                <use href="#hexagonPath" />
                            </clipPath>

                            <use
                                href="#hexagonPath"
                                fill="#16161b"
                                stroke={
                                isSelected
                                    ? "#2e2a17"
                                    : isHovered
                                        ? "#6f6f7a" : "#16161b"
                                }
                                strokeWidth={HEX_STROKE_WIDTH}
                                vectorEffect="non-scaling-stroke"
                            />

                            {cell.buildingKey && buildingsSpriteAtlas[cell.developmentVector] && buildingsSpriteAtlas[cell.developmentVector][cell.buildingKey] && (
                                <image
                                    href={buildingsSpriteAtlas[cell.developmentVector][cell.buildingKey]}
                                    x={-SPRITE_WIDTH / 2}
                                    y={-SPRITE_HEIGHT / 2}
                                    width={SPRITE_WIDTH}
                                    height={SPRITE_HEIGHT}
                                    preserveAspectRatio="xMidYMid meet"
                                    clipPath={`url(#${clipId})`}
                                    style={{ imageRendering: "pixelated", pointerEvents: "none" }}
                                />
                            )}
                        </g>
                    );
                })}
            </g>
        </svg>
    );
}

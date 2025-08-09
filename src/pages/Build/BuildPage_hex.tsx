import React, { useMemo, useRef, useState, useEffect } from "react";

// ---------- Math helpers (pointy-top axial) ----------
type AxialCoordinate = { column: number; row: number };
const HEX_RADIUS_PX = 28;
const SQUARE_ROOT_OF_3 = Math.sqrt(3);

function axialToPixelPosition(
    { column, row }: AxialCoordinate,
    radiusPx = HEX_RADIUS_PX
) {
    return {
        x: radiusPx * (SQUARE_ROOT_OF_3 * column + (SQUARE_ROOT_OF_3 / 2) * row),
        y: radiusPx * (1.5 * row),
    };
}

function getHexagonPolygonPoints(
    centerX: number,
    centerY: number,
    radiusPx = HEX_RADIUS_PX
) {
    const polygonPoints: string[] = [];
    for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
        const angleRadians =
            (Math.PI / 180) * (60 * vertexIndex - 30); // pointy-top
        const vertexX = centerX + radiusPx * Math.cos(angleRadians);
        const vertexY = centerY + radiusPx * Math.sin(angleRadians);
        polygonPoints.push(`${vertexX},${vertexY}`);
    }
    return polygonPoints.join(" ");
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
    let cubeX = fractionalColumn;
    let cubeZ = fractionalRow;
    let cubeY = -cubeX - cubeZ;

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

// ---------- Types ----------
type HexCell = AxialCoordinate & {
    id: string;
    spriteKey: string | null;
};

type SpriteAtlas = Record<string, string>;

// ---------- Component ----------
export default function ClickableHexGrid({
                                             radiusInCells = 8,
                                             spriteAtlas,
                                             predefinedCells,
                                         }: {
    radiusInCells?: number;
    spriteAtlas: SpriteAtlas;
    predefinedCells?: HexCell[];
}) {
    // Build a hex disc if not given
    const allCells: HexCell[] = useMemo(() => {
        if (predefinedCells) return predefinedCells;
        const generatedCells: HexCell[] = [];
        let cellIdCounter = 0;
        for (let column = -radiusInCells; column <= radiusInCells; column++) {
            const rowMin = Math.max(-radiusInCells, -column - radiusInCells);
            const rowMax = Math.min(radiusInCells, -column + radiusInCells);
            for (let row = rowMin; row <= rowMax; row++) {
                generatedCells.push({
                    id: String(cellIdCounter++),
                    column,
                    row,
                    spriteKey: null,
                });
            }
        }
        return generatedCells;
    }, [radiusInCells, predefinedCells]);

    // Precompute geometry
    const preparedCells = useMemo(() => {
        const borderInset = HEX_RADIUS_PX * 0.95;
        const innerSquareSide =
            borderInset * Math.sqrt(3) / 2; // fit square into hex

        return allCells.map((cell) => {
            const { x, y } = axialToPixelPosition(cell);
            return {
                ...cell,
                centerX: x,
                centerY: y,
                polygonPoints: getHexagonPolygonPoints(x, y),
                spriteX: x - innerSquareSide / 2,
                spriteY: y - innerSquareSide / 2,
                spriteWidth: innerSquareSide,
                spriteHeight: innerSquareSide,
            };
        });
    }, [allCells]);

    // Camera state
    const [zoomFactor, setZoomFactor] = useState(2);
    const [cameraOffsetX, setCameraOffsetX] = useState(0);
    const [cameraOffsetY, setCameraOffsetY] = useState(0);
    const svgRef = useRef<SVGSVGElement>(null);

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
        setSelectedCellKey(`${column},${row}`);
    };

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
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
    const handleWheelZoom = (event: React.WheelEvent) => {
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
        const svgElement = svgRef.current;
        if (!svgElement) return;
        let isDragging = false;
        let startMouseX = 0;
        let startMouseY = 0;
        let startCameraOffsetX = 0;
        let startCameraOffsetY = 0;

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            startCameraOffsetX = cameraOffsetX;
            startCameraOffsetY = cameraOffsetY;
        };
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setCameraOffsetX(startCameraOffsetX + (e.clientX - startMouseX));
            setCameraOffsetY(startCameraOffsetY + (e.clientY - startMouseY));
        };
        const onMouseUp = () => (isDragging = false);

        svgElement.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            svgElement.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [cameraOffsetX, cameraOffsetY]);

    const viewExtent = (radiusInCells + 2) * HEX_RADIUS_PX * 2.2;

    return (
        <svg
            ref={svgRef}
            viewBox={`${-viewExtent} ${-viewExtent} ${viewExtent * 2} ${viewExtent * 2}`}
            onWheel={handleWheelZoom}
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
                    points={getHexagonPolygonPoints(0, 0)}
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
                                fill={
                                    isSelected
                                        ? "#2e2a17"
                                        : isHovered
                                            ? "#1b1b22"
                                            : "#16161b"
                                }
                                stroke="#6f6f7a"
                                strokeWidth={1}
                                vectorEffect="non-scaling-stroke"
                            />

                            {cell.spriteKey && spriteAtlas[cell.spriteKey] && (
                                <image
                                    href={spriteAtlas[cell.spriteKey]}
                                    x={-cell.spriteWidth / 2}
                                    y={-cell.spriteHeight / 2}
                                    width={cell.spriteWidth}
                                    height={cell.spriteHeight}
                                    preserveAspectRatio="xMidYMid meet"
                                    clipPath={`url(#${clipId})`}
                                    style={{
                                        imageRendering: "pixelated",
                                        pointerEvents: "none",
                                    }}
                                />
                            )}
                        </g>
                    );
                })}
            </g>
        </svg>
    );
}

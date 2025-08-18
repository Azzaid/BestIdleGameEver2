import type {AxialCoordinate} from "../../../../models/city/HexGrid.ts";

const SQUARE_ROOT_OF_3 = Math.sqrt(3);

export function getHexagonPolygonPoints(
    hexRadiusPx: number
) {
    const polygonPoints: string[] = [];
    for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
        const angleRadians =
            (Math.PI / 180) * (60 * vertexIndex - 30); // pointy-top
        const vertexX = hexRadiusPx * Math.cos(angleRadians);
        const vertexY = hexRadiusPx * Math.sin(angleRadians);
        polygonPoints.push(`${vertexX},${vertexY}`);
    }
    return polygonPoints.join(" ");
}

export function axialCoordinateToPixelPosition(
    {column, row}: AxialCoordinate,
    hexRadiusPx: number,
    gapBetweenEdgesPx: number
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

    return {x, y};
}

export function pixelPositionToAxialCoordinate(
    pixelX: number,
    pixelY: number,
    hexRadiusPx: number
): AxialCoordinate {
    // Fractional axial
    const fractionalColumn =
        (SQUARE_ROOT_OF_3 / 3 * pixelX - 1 / 3 * pixelY) / hexRadiusPx;
    const fractionalRow = (2 / 3 * pixelY) / hexRadiusPx;

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

    return {column: roundedCubeX, row: roundedCubeZ};
}

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

export const computeCityBounds  = (preparedCells: { centerX: number; centerY: number }[], hexRadiusPx: number): Bounds => {
    // For a pointy-top hex: half width = √3/2 * R, half height = R
    const halfWidth = (Math.sqrt(3) / 2) * hexRadiusPx;
    const halfHeight = hexRadiusPx;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of preparedCells) {
        const left = c.centerX - halfWidth;
        const right = c.centerX + halfWidth;
        const top = c.centerY - halfHeight;
        const bottom = c.centerY + halfHeight;
        if (left < minX) minX = left;
        if (right > maxX) maxX = right;
        if (top < minY) minY = top;
        if (bottom > maxY) maxY = bottom;
    }
    // tiny padding so strokes don’t touch the edge
    const pad = 1;
    return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
};

export const clampPan = (
    tx: number,
    ty: number,
    zoom: number,
    b: Bounds,
    vbx: number,
    vby: number,
    vbw: number,
    vbh: number
)=> {
    // Allowed tx range so [minX..maxX] fits inside [vbx..vbx+vbw]
    const txMin = (vbx) - zoom * b.minX;                  // makes left edge touch left
    const txMax = (vbx + vbw) - zoom * b.maxX;            // makes right edge touch right

    // Allowed ty range so [minY..maxY] fits inside [vby..vby+vbh]
    const tyMin = (vby) - zoom * b.minY;                  // top
    const tyMax = (vby + vbh) - zoom * b.maxY;            // bottom

    // If content narrower/shorter than viewport at this zoom, center it.
    const contentW = zoom * (b.maxX - b.minX);
    const contentH = zoom * (b.maxY - b.minY);

    if (contentW < vbw) {
        tx = vbx + (vbw - contentW) / 2 - zoom * b.minX;
    } else {
        tx = Math.max(txMax, Math.min(tx, txMin));
    }

    if (contentH < vbh) {
        ty = vby + (vbh - contentH) / 2 - zoom * b.minY;
    } else {
        ty = Math.max(tyMax, Math.min(ty, tyMin));
    }

    return { tx, ty };
}

export const maxZoomThatFits = (bounds: Bounds, vbw: number, vbh: number) => {
    const contentW = bounds.maxX - bounds.minX;
    const contentH = bounds.maxY - bounds.minY;
    return Math.min(vbw / contentW, vbh / contentH);
}
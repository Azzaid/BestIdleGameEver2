import { useId } from "react";
import * as s from "./BuildingSelector.css";
import {CITY_HEX_RADIUS, CITY_HEX_WIDTH} from "../../../../data/constants.ts";
import type {HexTilePreviewProps} from "../../../../models/city/buildingSelector.ts";

export function HexTilePreview({
                                   imageUrl,
                                   imageZoom = 1,
                                   imageShift = {x: 0, y: 0},
                                   size = 128,
                                   padding = 0.96,
                                   fit = "cover",
                                   fill,
                                   stroke,
                                   strokeWidth = 3,
                                   ariaLabel,
                               }: HexTilePreviewProps) {
    const clipUid = useId().replace(/:/g, "");

    const r = size / 2;                     // vertical radius
    const h = (Math.sqrt(3) * r) / 2;       // horizontal half-width (pointy-top)

    const points = [
        [0, -r],
        [h, -r / 2],
        [h, r / 2],
        [0, r],
        [-h, r / 2],
        [-h, -r / 2],
    ]
        .map(([x, y]) => `${x},${y}`)
        .join(" ");

    const shiftScale = r / CITY_HEX_RADIUS;
    const normalizedImageZoom = Number.isFinite(imageZoom)
        ? Math.max(0.01, imageZoom)
        : 1;
    const renderedImageSize = CITY_HEX_WIDTH * padding * normalizedImageZoom * shiftScale;
    const innerX = -renderedImageSize / 2 + imageShift.x * shiftScale;
    const innerY = -renderedImageSize / 2 + imageShift.y * shiftScale;

    const preserve = fit === "cover" ? "xMidYMid slice" : "xMidYMid meet";

    return (
        <svg
            className={s.previewSvg}
            viewBox={`${-(h + strokeWidth)} ${-(r + strokeWidth)} ${(h + strokeWidth) * 2} ${(r + strokeWidth) * 2}`}
            role="img"
            aria-label={ariaLabel}
        >
            <defs>
                <clipPath id={`hexClip-${clipUid}`} clipPathUnits="userSpaceOnUse">
                    <polygon points={points} />
                </clipPath>
            </defs>

            {/* background under fallback previews only */}
            {!imageUrl && (
                <polygon points={points} fill={fill ?? "var(--tile-fill)"} />
            )}

            {/* single image, clipped to hex */}
            {imageUrl && (
                <image
                    href={imageUrl}
                    x={innerX}
                    y={innerY}
                    width={renderedImageSize}
                    height={renderedImageSize}
                    preserveAspectRatio={preserve}
                    clipPath={`url(#hexClip-${clipUid})`}
                />
            )}

            {/* border on top */}
            <polygon
                points={points}
                fill="none"
                stroke={stroke ?? "var(--tile-stroke)"}
                strokeWidth={strokeWidth}
                pointerEvents="none"
            />
        </svg>
    );
}

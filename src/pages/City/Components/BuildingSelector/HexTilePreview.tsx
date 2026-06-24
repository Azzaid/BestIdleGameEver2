import { useId } from "react";
import * as s from "./BuildingSelector.css";
import type {HexTilePreviewProps} from "../../../../models/city/buildingSelector.ts";

export function HexTilePreview({
                                   imageUrl,
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

    // padded inner box for the image
    const innerW = 2 * h * padding;
    const innerH = 2 * r * padding;
    const innerX = -innerW / 2;
    const innerY = -innerH / 2;

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
                    width={innerW}
                    height={innerH}
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

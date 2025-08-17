import { useId } from "react";
import * as s from "./BuildingSelector.css";

type HexTilePreviewProps = {
    imageUrl?: string;          // single small image file
    size?: number;              // overall SVG box; default 64
    padding?: number;           // 0..1, shrink image inside hex to avoid touching border
    fit?: "cover" | "contain";  // how image fits the inner box
    fill?: string;              // hex background fill
    stroke?: string;            // hex border color
    strokeWidth?: number;       // hex border width
    ariaLabel?: string;
};

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
            viewBox={`-${size} -${size} ${size * 2} ${size * 2}`}
            role="img"
            aria-label={ariaLabel}
        >
            <defs>
                <clipPath id={`hexClip-${clipUid}`} clipPathUnits="userSpaceOnUse">
                    <polygon points={points} />
                </clipPath>
            </defs>

            {/* background under the image (shows through padding) */}
            <polygon points={points} fill={fill ?? "var(--tile-fill)"} />

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

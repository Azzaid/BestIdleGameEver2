import { style, styleVariants } from "@vanilla-extract/css";
import {tokens} from "../../../../theme/tokens.css.ts";
import {vars} from "../../../../theme/theme.css.ts";
import * as hud from "../../../../theme/hud.css.ts";

// Component wrapper (can inherit data-theme from parent)
export const wrapper = style({
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr)",
    gap: tokens.space.lg,
    minHeight: 0,
    maxHeight: "100%",
    overflow: "hidden",
    color: vars.color.text.primary,
});

// Tabs
export const tabs = style({
    display: "flex",
    gap: tokens.space.sm,
    flexWrap: "wrap",
});

export const tabVector = hud.vectorVars;

export const tabButton = styleVariants({
    active: {
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space.xs,
        padding: `${tokens.space.xs} ${tokens.space.md}`,
        borderRadius: tokens.radius.md,
        border: `1px solid ${hud.hudBorder}`,
        background: `linear-gradient(180deg, color-mix(in oklab, ${hud.hudAccent} 34%, ${hud.hudSurface}), color-mix(in oklab, ${hud.hudAccent} 20%, transparent))`,
        color: hud.hudText,
        boxShadow: `0 0 16px color-mix(in oklab, ${hud.hudAccent} 34%, transparent), inset 0 0 0 1px rgba(255, 255, 255, 0.12)`,
        fontSize: tokens.font.md,
        fontWeight: 900,
        cursor: "pointer",
        selectors: {
            "&[disabled]": { opacity: 0.4, cursor: "not-allowed" },
        },
    },
    regular: {
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space.xs,
        padding: `${tokens.space.xs} ${tokens.space.md}`,
        borderRadius: tokens.radius.md,
        border: `1px solid color-mix(in oklab, ${hud.hudAccent} 56%, transparent)`,
        background: `linear-gradient(180deg, ${hud.hudAccentSoft}, color-mix(in oklab, ${hud.hudSurface} 42%, transparent))`,
        color: hud.hudText,
        boxShadow: `0 0 10px color-mix(in oklab, ${hud.hudAccent} 20%, transparent)`,
        fontSize: tokens.font.md,
        fontWeight: 800,
        cursor: "pointer",
        opacity: 0.82,
        selectors: {
            "&:hover:not([disabled])": {
                opacity: 1,
                background: `linear-gradient(180deg, color-mix(in oklab, ${hud.hudAccent} 26%, ${hud.hudSurface}), ${hud.hudAccentSoft})`,
                borderColor: hud.hudAccent,
                boxShadow: `0 0 16px color-mix(in oklab, ${hud.hudAccent} 30%, transparent)`,
            },
            "&[disabled]": { opacity: 0.4, cursor: "not-allowed" },
        },
    },
});

export const tabDot = style({
    width: 10,
    height: 10,
    borderRadius: 3,
    background: "currentColor",
    opacity: 0.92,
    boxShadow: "0 0 10px currentColor",
});

export const tabLabel = style({
    lineHeight: 1,
});

export const tabCount = style({
    fontSize: tokens.font.sm,
    opacity: 0.7,
});

// List grid
export const list = style({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridAutoRows: "max-content",
    alignContent: "start",
    alignItems: "start",
    gap: tokens.space.lg,
    minHeight: 0,
    maxHeight: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    paddingRight: "2px",
    paddingBottom: "2px",
    scrollbarGutter: "stable",
    WebkitOverflowScrolling: "touch",
    '@media': {
        '(max-width: 760px)': {
            maxHeight: 'min(54dvh, 520px)',
        },
    },
});

export const cardFrame = hud.panelFrame;

// Card
export const card = style({
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "auto auto auto auto",
    minWidth: 0,
    height: "max-content",
    alignSelf: "start",
});

export const zoneHeader = style({
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    padding: `${tokens.space.sm} ${tokens.space.md}`,
    borderBottom: `1px solid ${hud.hudBorder}`,
    gap: tokens.space.sm,
});

export const titleLine = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.space.sm,
});

export const name = style({
    margin: 0,
    fontSize: tokens.font.lg,
    lineHeight: 1.15,
});

export const costValue = style({ fontWeight: 600 });
export const costLabel = style({ opacity: 0.7 });

// Build button
export const buildBtn = style({
    padding: `${tokens.space.xs} ${tokens.space.lg}`,
    borderRadius: tokens.radius.md,
    background: `linear-gradient(180deg, color-mix(in oklab, ${hud.hudAccent} 62%, white 16%), color-mix(in oklab, ${hud.hudAccent} 82%, black 18%))`,
    color: "white",
    border: `1px solid color-mix(in oklab, ${hud.hudAccent} 68%, black 12%)`,
    cursor: "pointer",
    fontSize: tokens.font.md,
    fontWeight: 600,
    selectors: {
        "&:hover:not(:disabled)": { filter: "brightness(1.05)" },
        "&:active:not(:disabled)": { transform: "translateY(1px)" },
        "&:disabled": { cursor: "not-allowed", opacity: 0.55 },
    },
});

// Zone rows
export const effectsRow = style({
    display: "grid",
    gridTemplateColumns: "126px minmax(0, 1fr) minmax(0, 1fr)",
    gap: tokens.space.lg,
    padding: `${tokens.space.md} ${tokens.space.lg}`,
    borderBottom: `1px solid ${hud.hudBorder}`,
    minWidth: 0,
});

export const zoneRow = style({
    display: "grid",
    gridTemplateColumns: "126px minmax(0, 1fr)",
    gap: tokens.space.lg,
    padding: `${tokens.space.md} ${tokens.space.lg}`,
    borderBottom: `1px solid ${hud.hudBorder}`,
    minWidth: 0,
});

export const previewCol = style({
    display: "grid",
    placeItems: "center",
    minWidth: 0,
});
export const previewColPlaceholder = style({
    visibility: "hidden",
});

export const contentCol = style({
    display: "grid",
    alignContent: "start",
    gap: tokens.space.sm,
    minWidth: 0,
});

export const sectionTitle = style({
    fontSize: tokens.font.lg,
    margin: 0,
});

export const bullets = style({
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 6,
});

export const bulletItem = style({
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
});

// Zone 4 — description
export const zoneDesc = style({
    padding: `${tokens.space.md} ${tokens.space.lg} ${tokens.space.lg}`,
});

export const description = style({
    margin: 0,
    color: hud.hudText,
    fontSize: tokens.font.md,
});

export const muted = style({
    color: hud.hudText,
    fontSize: tokens.font.md,
});

// Preview SVG default tile vars (can be themed)
export const previewSvg = style({
    display: "block",
    width: 126,
    height: 126,
    maxWidth: "100%",
    boxSizing: "border-box",
    "--tile-fill": hud.hudAccentSoft,
    "--tile-stroke": hud.hudBorder,
} as React.CSSProperties);

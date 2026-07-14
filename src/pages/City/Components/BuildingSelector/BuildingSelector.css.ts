import { style, styleVariants } from "@vanilla-extract/css";
import {tokens} from "../../../../theme/tokens.css.ts";
import {vars} from "../../../../theme/theme.css.ts";
import * as hud from "../../../../theme/hud.css.ts";

// Component wrapper (can inherit data-theme from parent)
export const wrapper = style({
    display: "grid",
    gap: tokens.space.lg,
    color: vars.color.text.primary,
});

// Tabs
export const tabs = style({
    display: "flex",
    gap: tokens.space.sm,
    flexWrap: "wrap",
});

export const tabButton = styleVariants({
    active: {
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space.xs,
        padding: `${tokens.space.xs} ${tokens.space.md}`,
        borderRadius: tokens.radius.pill,
        border: `1px solid ${hud.hudBorder}`,
        background: hud.hudAccentSoft,
        color: hud.hudText,
        fontSize: tokens.font.md,
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
        borderRadius: tokens.radius.pill,
        border: `1px solid ${vars.color.border.default}`,
        background: "color-mix(in oklab, transparent 70%, white 3%)",
        color: vars.color.text.primary,
        fontSize: tokens.font.md,
        cursor: "pointer",
        selectors: {
            "&:hover:not([disabled])": { background: hud.hudAccentSoft, borderColor: hud.hudBorder },
            "&[disabled]": { opacity: 0.4, cursor: "not-allowed" },
        },
    },
});

export const tabDot = style({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "currentColor",
    opacity: 0.7,
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
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
    gap: tokens.space.lg,
});

export const cardFrame = hud.panelFrame;

// Card
export const card = style({
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "auto auto auto auto",
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
    gridTemplateColumns: "148px minmax(0, 1fr) minmax(0, 1fr)",
    gap: tokens.space.lg,
    padding: `${tokens.space.md} ${tokens.space.lg}`,
    borderBottom: `1px solid ${hud.hudBorder}`,
    '@media': {
        '(max-width: 520px)': {
            gridTemplateColumns: '112px minmax(0, 1fr)',
        },
    },
});

export const zoneRow = style({
    display: "grid",
    gridTemplateColumns: "148px 1fr",
    gap: tokens.space.lg,
    padding: `${tokens.space.md} ${tokens.space.lg}`,
    borderBottom: `1px solid ${hud.hudBorder}`,
    '@media': {
        '(max-width: 520px)': {
            gridTemplateColumns: '112px 1fr',
        },
    },
});

export const previewCol = style({
    display: "grid",
    placeItems: "center",
    '@media': {
        '(max-width: 520px)': {
            gridRow: 'span 2',
        },
    },
});
export const previewColPlaceholder = style({
    visibility: "hidden",
});

export const contentCol = style({
    display: "grid",
    alignContent: "start",
    gap: tokens.space.sm,
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
    width: 126,
    height: 126,
    "--tile-fill": hud.hudAccentSoft,
    "--tile-stroke": hud.hudBorder,
    '@media': {
        '(max-width: 520px)': {
            width: 96,
            height: 96,
        },
    },
} as React.CSSProperties);

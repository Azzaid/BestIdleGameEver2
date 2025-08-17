import { style, styleVariants } from "@vanilla-extract/css";

// Assumed theme variables. Adjust to your tokens.
const vars = {
    color: {
        bg: "var(--bg)",
        card: "var(--surface)",
        text: "var(--text)",
        subtext: "var(--subtle)",
        rim: "var(--rim)",
        accent: "var(--accent)",
        accentFg: "var(--on-accent)",
        muted: "var(--muted)",
        line: "var(--line)",
        tab: "var(--tab)",
        tabActive: "var(--tab-active)",
    },
    radius: {
        md: "14px",
        lg: "18px",
        pill: "999px",
    },
    space: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "28px",
    },
    shadow: {
        card: "0 6px 20px rgba(0,0,0,.15)",
        inset: "inset 0 0 0 1px rgba(0,0,0,.06)",
    },
    font: {
        sm: "12px",
        md: "14px",
        lg: "16px",
        xl: "18px",
    },
};

// Component wrapper (can inherit data-theme from parent)
export const wrapper = style({
    display: "grid",
    gap: vars.space.lg,
    color: vars.color.text,
});

// Tabs
export const tabs = style({
    display: "flex",
    gap: vars.space.sm,
    flexWrap: "wrap",
});

export const tabButton = styleVariants({
    active: {
        display: "inline-flex",
        alignItems: "center",
        gap: vars.space.xs,
        padding: `${vars.space.xs} ${vars.space.md}`,
        borderRadius: vars.radius.pill,
        border: `1px solid ${vars.color.tabActive}`,
        background: vars.color.tabActive,
        color: "var(--tab-active-fg, #fff)",
        fontSize: vars.font.md,
        cursor: "pointer",
        selectors: {
            "&[disabled]": { opacity: 0.4, cursor: "not-allowed" },
        },
    },
    '': {
        display: "inline-flex",
        alignItems: "center",
        gap: vars.space.xs,
        padding: `${vars.space.xs} ${vars.space.md}`,
        borderRadius: vars.radius.pill,
        border: `1px solid ${vars.color.tab}`,
        background: "transparent",
        color: vars.color.text,
        fontSize: vars.font.md,
        cursor: "pointer",
        selectors: {
            "&:hover:not([disabled])": { background: "color-mix(in oklab, var(--surface) 85%, var(--text) 15%)" },
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
    fontSize: vars.font.sm,
    opacity: 0.7,
});

// List grid
export const list = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
    gap: vars.space.lg,
});

// Card
export const card = style({
    background: vars.color.card,
    borderRadius: vars.radius.lg,
    boxShadow: `${vars.shadow.card}, ${vars.shadow.inset}`,
    border: `1px solid ${vars.color.line}`,
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "auto auto auto auto",
});

export const zoneHeader = style({
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    padding: vars.space.lg,
    borderBottom: `1px solid ${vars.color.line}`,
    gap: vars.space.md,
});

export const titleLine = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: vars.space.md,
});

export const name = style({
    margin: 0,
    fontSize: vars.font.xl,
    lineHeight: 1.15,
});

export const cost = style({
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    gap: vars.space.sm,
});

export const costItem = style({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 8px",
    borderRadius: vars.radius.pill,
    background: "color-mix(in oklab, var(--surface) 70%, var(--text) 8%)",
    border: `1px solid ${vars.color.line}`,
});

export const costValue = style({ fontWeight: 600 });
export const costLabel = style({ opacity: 0.7 });

// Build button
export const buildBtn = style({
    padding: `${vars.space.xs} ${vars.space.lg}`,
    borderRadius: vars.radius.pill,
    background: vars.color.accent,
    color: vars.color.accentFg,
    border: `1px solid color-mix(in oklab, var(--accent) 70%, black 15%)`,
    cursor: "pointer",
    fontSize: vars.font.md,
    fontWeight: 600,
    selectors: {
        "&:hover": { filter: "brightness(1.05)" },
        "&:active": { transform: "translateY(1px)" },
    },
});

// Zone rows (2 & 3)
export const zoneRow = style({
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: vars.space.lg,
    padding: `${vars.space.md} ${vars.space.lg}`,
    borderBottom: `1px solid ${vars.color.line}`,
});

export const previewCol = style({
    display: "grid",
    placeItems: "center",
});
export const previewColPlaceholder = style({
    visibility: "hidden",
});

export const contentCol = style({
    display: "grid",
    alignContent: "start",
    gap: vars.space.sm,
});

export const sectionTitle = style({
    fontSize: vars.font.lg,
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
    padding: `${vars.space.md} ${vars.space.lg} ${vars.space.lg}`,
});

export const description = style({
    margin: 0,
    color: vars.color.subtext,
    fontSize: vars.font.md,
});

export const muted = style({
    color: vars.color.muted,
    fontSize: vars.font.md,
});

// Preview SVG default tile vars (can be themed)
export const previewSvg = style({
    width: 84,
    height: 84,
    "--tile-fill": "color-mix(in oklab, var(--surface) 75%, var(--text) 5%)",
    "--tile-stroke": "var(--rim)",
} as React.CSSProperties);

import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/theme.css.ts";
import * as hud from "../../theme/hud.css.ts";

export const hudCardFrame = hud.panelFrame;
export const meterFillTone = hud.meterFillTone;

export const page = style({
    height: "100%",
    minHeight: 0,
    overflow: "auto",
    pointerEvents: "auto",
    display: "grid",
    alignContent: "start",
    gap: "10px",
    padding: "10px max(10px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(10px, env(safe-area-inset-left, 0px))",
    color: vars.color.text.primary,
    background: "linear-gradient(180deg, rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.02) 42%, rgba(0, 0, 0, 0.14))",
    backdropFilter: "saturate(1.12)",
});

export const header = style([
    hud.compactPanel,
    {
        justifySelf: "center",
        width: "min(1080px, 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        minHeight: "46px",
        padding: "8px 10px",
        "@media": {
            "(max-width: 640px)": {
                alignItems: "start",
                flexDirection: "column",
            },
        },
    },
]);

export const headerCopy = style({
    display: "grid",
    gap: "2px",
    minWidth: 0,
});

export const eyebrow = style({
    margin: 0,
    color: vars.color.text.muted,
    fontSize: "0.66rem",
    fontWeight: 900,
    letterSpacing: 0,
    textTransform: "uppercase",
});

export const title = style({
    margin: 0,
    color: vars.color.text.heading,
    fontSize: "1rem",
    lineHeight: 1.05,
});

export const headerBadge = style([
    hud.chip,
    {
        whiteSpace: "nowrap",
    },
]);

export const vectorStack = style({
    justifySelf: "center",
    width: "min(1080px, 100%)",
    display: "grid",
    gap: "12px",
});

export const vectorSection = style([
    hud.compactPanel,
    {
        display: "grid",
        gap: "8px",
        padding: "8px",
        background: "rgba(0, 0, 0, 0.08)",
    },
]);

export const vectorHeader = style({
    display: "grid",
    gridTemplateColumns: "30px minmax(0, 1fr)",
    gap: "8px",
    alignItems: "center",
    padding: "2px 2px 0",
});

export const vectorMark = style([
    hud.chip,
    {
        width: 30,
        height: 30,
        justifyContent: "center",
        padding: 0,
        borderRadius: 5,
        fontSize: "0.82rem",
    },
]);

export const vectorHeaderCopy = style({
    display: "grid",
    gap: "1px",
    minWidth: 0,
});

export const vectorTitle = style({
    margin: 0,
    color: vars.color.text.heading,
    fontSize: "0.9rem",
    lineHeight: 1.05,
});

export const vectorMood = style({
    margin: 0,
    color: vars.color.text.muted,
    fontSize: "0.7rem",
    lineHeight: 1.2,
});

export const selectorGrid = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "8px",
});

export const cardGlow = style({
    position: "absolute",
    inset: "-30% auto auto -18%",
    zIndex: -1,
    width: "56%",
    aspectRatio: "1",
    borderRadius: "50%",
    background: `radial-gradient(circle, ${hud.hudAccentSoft}, transparent 68%)`,
    filter: "blur(3px)",
    pointerEvents: "none",
});

export const cardHeader = style({
    display: "grid",
    gridTemplateColumns: "28px minmax(0, 1fr)",
    gap: "7px",
    alignItems: "center",
});

export const styleMark = style([
    hud.chip,
    {
        width: 28,
        height: 28,
        justifyContent: "center",
        padding: 0,
        borderRadius: 4,
        fontSize: "0.78rem",
        boxShadow: `0 0 12px color-mix(in oklab, ${hud.hudAccent} 24%, transparent)`,
    },
]);

export const cardTitleGroup = style({
    minWidth: 0,
    display: "grid",
    gap: "1px",
});

export const styleName = style({
    color: hud.hudText,
    fontSize: "0.82rem",
    fontWeight: 900,
    lineHeight: 1.05,
});

export const styleMood = style({
    color: hud.hudMuted,
    fontSize: "0.66rem",
    fontWeight: 700,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

export const buildingRow = style({
    display: "grid",
    gridTemplateColumns: "44px minmax(0, 1fr)",
    gap: "8px",
    alignItems: "center",
});

export const hexIcon = style({
    width: 44,
    aspectRatio: "1 / 0.86",
    display: "grid",
    placeItems: "center",
    clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
    background: `linear-gradient(145deg, ${hud.hudAccentSoft}, color-mix(in oklab, ${hud.hudSurface} 88%, black 12%))`,
    boxShadow: `inset 0 0 0 1px ${hud.hudBorder}, 0 0 14px color-mix(in oklab, ${hud.hudAccent} 22%, transparent)`,
});

export const hexIconCore = style({
    width: "48%",
    aspectRatio: "1 / 0.86",
    clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
    background: hud.hudAccent,
    opacity: 0.72,
});

export const buildingCopy = style({
    minWidth: 0,
    display: "grid",
    gap: "2px",
});

export const buildingName = style({
    margin: 0,
    color: hud.hudText,
    fontSize: "0.98rem",
    lineHeight: 1.05,
});

export const buildingRole = style({
    margin: 0,
    color: hud.hudMuted,
    fontSize: "0.7rem",
    lineHeight: 1.2,
});

export const statGrid = style({
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "5px",
});

export const statCell = hud.statCell;

export const statLabel = style({
    color: hud.hudMuted,
    fontSize: "0.58rem",
    fontWeight: 900,
    lineHeight: 1,
    textTransform: "uppercase",
});

export const statValue = style({
    color: hud.hudText,
    fontSize: "0.82rem",
    lineHeight: 1.1,
});

export const meterStack = style({
    display: "grid",
    gap: "6px",
});

export const meterRow = style({
    display: "grid",
    gap: "3px",
});

export const meterMeta = style({
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    color: hud.hudMuted,
    fontSize: "0.66rem",
    fontWeight: 800,
    lineHeight: 1,
});

export const meterTrack = hud.meterTrack;

export const cardFooter = style({
    display: "grid",
    gridTemplateColumns: "auto auto minmax(0, 1fr)",
    gap: "5px",
    alignItems: "center",
});

export const tag = style([
    hud.chip,
    {
        fontSize: "0.62rem",
    },
]);

export const selectButton = style([
    hud.button,
    {
        justifySelf: "end",
        minWidth: "68px",
        minHeight: "24px",
        padding: "3px 8px",
        fontSize: "0.68rem",
    },
]);

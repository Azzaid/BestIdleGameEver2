import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";
import * as hud from "../../theme/hud.css.ts";

export const backdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 35,
  display: "grid",
  placeItems: "center",
  padding: "max(12px, env(safe-area-inset-top, 0px)) max(12px, env(safe-area-inset-right, 0px)) max(12px, env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px))",
  background: "color-mix(in oklab, rgba(6, 10, 15, 0.72) 82%, transparent)",
  color: vars.color.text.primary,
  pointerEvents: "auto",
  backdropFilter: "blur(4px) saturate(0.92)",
  "@media": {
    "(max-width: 760px)": {
      top: "var(--research-modal-top-inset, 0px)",
      minHeight: 0,
      paddingTop: "12px",
    },
  },
});

export const panel = style([
  hud.panelFrame.neutral,
  {
    width: "min(1180px, 100%)",
    height: "min(820px, 100%)",
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr)",
    overflow: "hidden",
    border: `1px solid ${hud.hudBorder}`,
    background: `
      linear-gradient(120deg, ${hud.hudAccentSoft}, transparent 34%),
      linear-gradient(180deg, ${hud.hudSurface}, color-mix(in oklab, ${hud.hudSurface} 72%, black 12%))
    `,
    boxShadow: `
      0 0 0 1px color-mix(in oklab, ${hud.hudAccent} 20%, transparent),
      0 18px 46px rgba(0, 0, 0, 0.42),
      0 0 28px color-mix(in oklab, ${hud.hudAccent} 20%, transparent)
    `,
    pointerEvents: "auto",
  },
]);

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  minHeight: 68,
  padding: "12px 14px 12px 18px",
  borderBottom: `1px solid ${hud.hudBorder}`,
  background: `linear-gradient(90deg, ${hud.hudAccentSoft}, transparent 54%)`,
});

export const headerText = style({
  display: "grid",
  gap: "4px",
  minWidth: 0,
});

export const kicker = style({
  margin: 0,
  color: hud.hudMuted,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.72rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const title = style({
  margin: 0,
  color: hud.hudText,
  fontSize: "1.35rem",
});

export const vectorTone = hud.vectorVars;

export const vectorStrip = style({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap",
  marginTop: "2px",
});

export const vectorChip = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: 20,
  padding: "2px 7px",
  border: `1px solid ${hud.hudBorder}`,
  borderRadius: 999,
  background: hud.hudAccentSoft,
  color: hud.hudText,
  fontSize: "0.68rem",
  fontWeight: 900,
  lineHeight: 1,
  textTransform: "uppercase",
});

export const closeButton = style([
  hud.secondaryButton,
  {
    width: 34,
    height: 34,
    minHeight: 34,
    padding: 0,
    display: "grid",
    placeItems: "center",
    fontSize: "1rem",
    lineHeight: 1,
  },
]);

export const body = style({
  minHeight: 0,
  overflow: "hidden",
});

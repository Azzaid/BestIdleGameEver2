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
  '@media': {
    '(max-width: 760px)': {
      top: "var(--history-modal-top-inset, 0px)",
      minHeight: 0,
      paddingTop: "12px",
    },
  },
});

export const book = style([
  hud.panelFrame.neutral,
  {
    width: "min(960px, 100%)",
    height: "min(760px, 100%)",
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "16px minmax(0, 1fr)",
    overflow: "hidden",
    border: `1px solid ${hud.hudBorder}`,
    background: `linear-gradient(90deg, color-mix(in oklab, ${hud.hudAccent} 34%, black 48%), color-mix(in oklab, ${hud.hudSurface} 84%, black 16%))`,
    boxShadow: `
      0 0 0 1px color-mix(in oklab, ${hud.hudAccent} 20%, transparent),
      0 18px 46px rgba(0, 0, 0, 0.42),
      0 0 28px color-mix(in oklab, ${hud.hudAccent} 20%, transparent)
    `,
    pointerEvents: "auto",
    '@media': {
      '(max-width: 620px)': {
        gridTemplateColumns: "10px minmax(0, 1fr)",
        height: "100%",
      },
    },
  },
]);

export const bookSpine = style({
  background: `
    linear-gradient(180deg, color-mix(in oklab, ${hud.hudAccent} 46%, black 42%), color-mix(in oklab, ${hud.hudAccent} 18%, black 62%)),
    repeating-linear-gradient(180deg, transparent 0 28px, ${hud.hudAccentSoft} 28px 29px)
  `,
  borderRight: `1px solid ${hud.hudBorder}`,
});

export const bookSurface = style({
  minHeight: 0,
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  background: `
    linear-gradient(120deg, ${hud.hudAccentSoft}, transparent 34%),
    linear-gradient(180deg, ${hud.hudSurface}, color-mix(in oklab, ${hud.hudSurface} 72%, black 12%))
  `,
});

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
  gap: "2px",
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

export const headerActions = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexShrink: 0,
});

export const cleanSlateButton = style([
  hud.secondaryButton,
  {
  flexShrink: 0,
  minHeight: "34px",
  padding: "7px 11px",
  },
]);

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
  position: "relative",
  minHeight: 0,
  overflow: "hidden",
});

export const timeline = style({
  display: "grid",
  height: "100%",
  overflowY: "auto",
  scrollbarGutter: "stable",
  padding: "0 18px",
  paddingBottom: "58px",
});

export const emptyState = style({
  margin: 0,
  padding: "18px 0",
  color: hud.hudMuted,
});

export const eventTone = hud.vectorVars;

export const eventCard = style({
  display: "grid",
  gap: "12px",
  scrollMarginTop: "12px",
  margin: "12px 0",
  padding: "14px",
  border: `1px solid ${hud.hudBorder}`,
  borderRadius: 6,
  background: `
    linear-gradient(90deg, ${hud.hudAccentSoft}, transparent 42%),
    color-mix(in oklab, ${hud.hudSurface} 82%, transparent)
  `,
  transition: "background-color 180ms ease, box-shadow 180ms ease",
});

export const eventCardHighlighted = style([
  eventCard,
  {
    background: `
      linear-gradient(90deg, ${hud.hudAccentSoft}, transparent 54%),
      color-mix(in oklab, ${hud.hudSurface} 86%, ${hud.hudAccentSoft} 14%)
    `,
    boxShadow: `inset 3px 0 0 ${hud.hudAccent}, 0 0 18px color-mix(in oklab, ${hud.hudAccent} 18%, transparent)`,
  },
]);

export const eventImage = style({
  width: "100%",
  height: "auto",
  objectFit: "contain",
  borderRadius: 4,
  border: `1px solid ${hud.hudBorder}`,
  background: `color-mix(in oklab, ${hud.hudSurface} 74%, black 12%)`,
});

export const eventContent = style({
  display: "grid",
  alignContent: "start",
  gap: "8px",
  minWidth: 0,
});

export const eventMeta = style({
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  color: vars.color.text.muted,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.74rem",
  textTransform: "uppercase",
});

export const eventTitle = style({
  margin: 0,
  color: hud.hudText,
  fontSize: "1.05rem",
});

export const eventDescription = style({
  margin: 0,
  color: hud.hudText,
  lineHeight: 1.55,
  whiteSpace: "pre-line",
});

export const eventHint = style({
  margin: "2px 0 0",
  padding: "8px 10px",
  borderLeft: `3px solid ${hud.hudAccent}`,
  background: hud.hudAccentSoft,
  color: hud.hudMuted,
  lineHeight: 1.45,
});

export const foreseenPanel = style({
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 0,
  zIndex: 2,
  display: "flex",
  flexDirection: "column-reverse",
  maxHeight: "44px",
  overflow: "hidden",
  border: `1px solid ${hud.hudBorder}`,
  borderBottom: 0,
  borderRadius: "6px 6px 0 0",
  background: `
    linear-gradient(90deg, ${hud.hudAccentSoft}, transparent 52%),
    color-mix(in oklab, ${hud.hudSurface} 88%, black 6%)
  `,
  boxShadow: `0 -10px 24px rgba(0, 0, 0, 0.18), 0 0 18px color-mix(in oklab, ${hud.hudAccent} 16%, transparent)`,
  backdropFilter: "blur(8px) saturate(1.08)",
  transition: "max-height 180ms ease, box-shadow 180ms ease",
});

export const foreseenPanelOpen = style([
  foreseenPanel,
  {
    maxHeight: "33.333%",
  },
]);

export const foreseenToggle = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: "0 0 44px",
  minHeight: "44px",
  border: 0,
  borderTop: `1px solid ${hud.hudBorder}`,
  padding: "0 12px",
  background: "transparent",
  color: hud.hudText,
  cursor: "pointer",
  fontWeight: 800,
  textAlign: "left",
});

export const foreseenContent = style({
  display: "grid",
  alignContent: "start",
  gap: "10px",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  padding: "12px 12px 14px",
});

export const foreseenEmpty = style({
  margin: 0,
  color: hud.hudMuted,
});

export const foreseenItem = style({
  display: "grid",
  gap: "4px",
  padding: "0 0 10px 12px",
  borderLeft: `3px solid ${hud.hudAccent}`,
  background: `linear-gradient(90deg, ${hud.hudAccentSoft}, transparent 62%)`,
});

export const foreseenTitle = style({
  margin: 0,
  color: hud.hudText,
  fontSize: "0.94rem",
});

export const foreseenHint = style({
  margin: 0,
  color: hud.hudMuted,
  lineHeight: 1.45,
  whiteSpace: "pre-line",
});

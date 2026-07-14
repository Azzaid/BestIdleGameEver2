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
});

export const book = style([
  hud.hudVars,
  {
    width: "min(960px, 100%)",
    height: "min(760px, 100%)",
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "16px minmax(0, 1fr)",
    overflow: "hidden",
    border: `1px solid ${hud.hudBorder}`,
    borderRadius: 6,
    background: `linear-gradient(90deg, color-mix(in oklab, ${hud.hudAccent} 34%, black 48%), color-mix(in oklab, ${vars.color.background.surface} 84%, black 16%))`,
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
    repeating-linear-gradient(180deg, transparent 0 28px, rgba(255, 255, 255, 0.14) 28px 29px)
  `,
  borderRight: `1px solid ${hud.hudBorder}`,
});

export const bookSurface = style({
  minHeight: 0,
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  background: `
    linear-gradient(120deg, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(180deg, color-mix(in oklab, ${vars.color.background.surface} 88%, white 8%), color-mix(in oklab, ${vars.color.background.app} 72%, white 12%))
  `,
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  minHeight: 68,
  padding: "12px 14px 12px 18px",
  borderBottom: `1px solid ${vars.color.border.default}`,
  background: `linear-gradient(90deg, ${hud.hudAccentSoft}, transparent 54%)`,
});

export const headerText = style({
  display: "grid",
  gap: "2px",
  minWidth: 0,
});

export const kicker = style({
  margin: 0,
  color: vars.color.text.muted,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.72rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
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
  minHeight: 0,
  overflowY: "auto",
  scrollbarGutter: "stable",
});

export const timeline = style({
  display: "grid",
  padding: "0 18px",
});

export const emptyState = style({
  margin: 0,
  padding: "18px 0",
  color: vars.color.text.muted,
});

export const eventCard = style({
  display: "grid",
  gap: "12px",
  scrollMarginTop: "12px",
  padding: "18px 0",
  borderBottom: `1px solid ${vars.color.border.default}`,
  background: "transparent",
  transition: "background-color 180ms ease, box-shadow 180ms ease",
});

export const eventCardHighlighted = style([
  eventCard,
  {
    background: hud.hudAccentSoft,
    boxShadow: `inset 3px 0 0 ${hud.hudAccent}, 0 0 18px color-mix(in oklab, ${hud.hudAccent} 18%, transparent)`,
  },
]);

export const eventImage = style({
  width: "100%",
  maxHeight: "420px",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  borderRadius: 4,
  border: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.app,
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
  color: vars.color.text.heading,
  fontSize: "1.05rem",
});

export const eventDescription = style({
  margin: 0,
  color: vars.color.text.primary,
  lineHeight: 1.55,
  whiteSpace: "pre-line",
});

export const eventHint = style({
  margin: "2px 0 0",
  padding: "8px 10px",
  borderLeft: `3px solid ${hud.hudAccent}`,
  background: hud.hudAccentSoft,
  color: vars.color.text.muted,
  lineHeight: 1.45,
});

export const foreseenPanel = style({
  display: "grid",
  margin: "0 18px",
  maxHeight: "44px",
  overflow: "hidden",
  borderBottom: `1px solid ${vars.color.border.default}`,
  transition: "max-height 180ms ease",
});

export const foreseenPanelOpen = style([
  foreseenPanel,
  {
    maxHeight: "360px",
  },
]);

export const foreseenToggle = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: "44px",
  border: 0,
  padding: 0,
  background: "transparent",
  color: vars.color.text.heading,
  cursor: "pointer",
  fontWeight: 800,
  textAlign: "left",
});

export const foreseenContent = style({
  display: "grid",
  gap: "10px",
  maxHeight: "316px",
  overflowY: "auto",
  padding: "0 0 16px",
});

export const foreseenEmpty = style({
  margin: 0,
  color: vars.color.text.muted,
});

export const foreseenItem = style({
  display: "grid",
  gap: "4px",
  padding: "0 0 10px 12px",
  borderLeft: `3px solid ${hud.hudAccent}`,
});

export const foreseenTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "0.94rem",
});

export const foreseenHint = style({
  margin: 0,
  color: vars.color.text.muted,
  lineHeight: 1.45,
  whiteSpace: "pre-line",
});

import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";
import * as hud from "../../theme/hud.css.ts";

export const page = style({
  minHeight: "100%",
  padding: "18px 14px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const book = style([
  hud.compactPanel,
  {
  display: "grid",
  maxWidth: "920px",
  margin: "0 auto",
  overflow: "hidden",
  },
]);

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  padding: "18px 22px 16px",
  borderBottom: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.navbar,
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

export const cleanSlateButton = style([
  hud.secondaryButton,
  {
  flexShrink: 0,
  minHeight: "34px",
  padding: "7px 11px",
  },
]);

export const timeline = style({
  display: "grid",
  padding: "0 22px",
});

export const emptyState = style({
  margin: 0,
  padding: "18px 0",
  color: vars.color.text.muted,
});

export const eventCard = style({
  display: "grid",
  gap: "12px",
  scrollMarginTop: "56px",
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
  margin: "0 22px",
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

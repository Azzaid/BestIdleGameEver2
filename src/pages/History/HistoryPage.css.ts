import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  position: "relative",
  minHeight: "100%",
  padding: "14px 14px 92px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "12px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1.25rem",
});

export const timeline = style({
  display: "grid",
  gap: "10px",
  maxWidth: "920px",
  margin: "0 auto",
});

export const emptyState = style({
  margin: 0,
  padding: "14px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: 6,
  background: vars.color.background.surface,
  color: vars.color.text.muted,
});

export const eventCard = style({
  display: "grid",
  gridTemplateColumns: "minmax(180px, 280px) minmax(0, 1fr)",
  gap: "12px",
  scrollMarginTop: "76px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: 6,
  background: vars.color.background.surface,
  overflow: "hidden",
  transition: "border-color 180ms ease, box-shadow 180ms ease",
  "@media": {
    "(max-width: 720px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const eventCardHighlighted = style([
  eventCard,
  {
    borderColor: vars.color.brand.primary,
    boxShadow: `0 0 0 2px ${vars.color.border.focus}`,
  },
]);

export const eventImage = style({
  width: "100%",
  height: "100%",
  minHeight: "190px",
  objectFit: "cover",
  background: vars.color.background.app,
});

export const eventContent = style({
  display: "grid",
  alignContent: "start",
  gap: "8px",
  padding: "12px",
});

export const eventMeta = style({
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  color: vars.color.text.muted,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.76rem",
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
  lineHeight: 1.48,
  whiteSpace: "pre-line",
});

export const eventHint = style({
  margin: 0,
  padding: "8px 10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: 4,
  background: vars.color.background.app,
  color: vars.color.text.muted,
  lineHeight: 1.4,
});

export const foreseenPanel = style({
  position: "fixed",
  left: "50%",
  bottom: 0,
  zIndex: 80,
  display: "grid",
  width: "min(720px, calc(100vw - 20px))",
  maxHeight: "42px",
  overflow: "hidden",
  transform: "translateX(-50%)",
  border: `1px solid ${vars.color.border.default}`,
  borderBottom: 0,
  borderRadius: "6px 6px 0 0",
  background: vars.color.background.surface,
  boxShadow: vars.color.shadow.popover,
  transition: "max-height 180ms ease",
});

export const foreseenPanelOpen = style([
  foreseenPanel,
  {
    maxHeight: "min(46vh, 360px)",
  },
]);

export const foreseenToggle = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: "42px",
  border: 0,
  borderBottom: `1px solid ${vars.color.border.default}`,
  padding: "8px 12px",
  background: vars.color.background.navbar,
  color: vars.color.text.heading,
  cursor: "pointer",
  fontWeight: 800,
});

export const foreseenContent = style({
  display: "grid",
  gap: "8px",
  maxHeight: "calc(min(46vh, 360px) - 42px)",
  overflowY: "auto",
  padding: "10px",
});

export const foreseenEmpty = style({
  margin: 0,
  color: vars.color.text.muted,
});

export const foreseenItem = style({
  display: "grid",
  gap: "4px",
  padding: "8px 10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: 4,
  background: vars.color.background.app,
});

export const foreseenTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "0.9rem",
});

export const foreseenHint = style({
  margin: 0,
  color: vars.color.text.muted,
  lineHeight: 1.4,
});

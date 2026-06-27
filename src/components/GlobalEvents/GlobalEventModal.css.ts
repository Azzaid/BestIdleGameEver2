import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const backdrop = style({
  position: "fixed",
  inset: 0,
  display: "grid",
  placeItems: "center",
  padding: "14px",
  background: vars.color.overlay.scrim,
  zIndex: 120,
});

export const dialog = style({
  width: "min(760px, 100%)",
  maxHeight: "min(760px, calc(100vh - 28px))",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: 4,
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  boxShadow: "0 14px 36px rgba(0, 0, 0, 0.34)",
  overflow: "hidden",
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  padding: "10px 12px",
  borderBottom: `1px solid ${vars.color.border.default}`,
});

export const heading = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1rem",
});

export const closeButton = style({
  minWidth: "28px",
  minHeight: "28px",
  borderRadius: 3,
  border: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontWeight: 700,
});

export const body = style({
  display: "grid",
  gap: "10px",
  padding: "12px",
  overflowY: "auto",
});

export const eventBlock = style({
  display: "grid",
  gap: "8px",
});

export const eventImage = style({
  width: "100%",
  maxHeight: "180px",
  objectFit: "cover",
  borderRadius: 4,
  border: `1px solid ${vars.color.border.default}`,
});

export const eventTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "0.98rem",
});

export const eventDescription = style({
  margin: 0,
  color: vars.color.text.primary,
  lineHeight: 1.45,
});

export const effectList = style({
  display: "grid",
  gap: "6px",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const effectItem = style({
  display: "grid",
  gap: "3px",
  padding: "7px 9px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: 4,
  background: vars.color.background.app,
});

export const effectTitle = style({
  color: vars.color.text.heading,
  fontWeight: 700,
});

export const effectDescription = style({
  color: vars.color.text.muted,
  lineHeight: 1.4,
});

export const footer = style({
  display: "flex",
  justifyContent: "flex-end",
  padding: "10px 12px",
  borderTop: `1px solid ${vars.color.border.default}`,
});

export const primaryButton = style({
  minHeight: "30px",
  padding: "5px 10px",
  borderRadius: 3,
  border: `1px solid ${vars.color.brand.primary}`,
  background: vars.color.brand.primary,
  color: vars.color.text.inverse,
  cursor: "pointer",
  fontWeight: 700,
});

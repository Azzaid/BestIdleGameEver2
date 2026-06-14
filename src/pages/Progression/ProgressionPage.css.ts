import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr) 320px",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const panel = style({
  minHeight: 0,
  overflow: "auto",
  padding: "16px",
  borderRight: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
});

export const detailsPanel = style([
  panel,
  {
    borderRight: 0,
    borderLeft: `1px solid ${vars.color.border.default}`,
  },
]);

export const canvas = style({
  minHeight: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  overscrollBehavior: "contain",
  touchAction: "none",
  background: vars.color.background.app,
});

export const heading = style({
  margin: "0 0 12px",
  fontSize: "1rem",
  color: vars.color.text.heading,
});

export const field = style({
  display: "grid",
  gap: "6px",
  marginBottom: "14px",
});

export const label = style({
  fontSize: "0.78rem",
  fontWeight: 700,
  color: vars.color.text.muted,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "36px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "6px 8px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
});

export const checkList = style({
  display: "grid",
  gap: "8px",
});

export const checkItem = style({
  display: "flex",
  gap: "8px",
  alignItems: "center",
  fontSize: "0.9rem",
});

export const list = style({
  margin: 0,
  paddingLeft: "18px",
});

export const muted = style({
  color: vars.color.text.muted,
});

export const warning = style({
  marginTop: "14px",
  padding: "10px",
  borderRadius: "6px",
  border: `1px solid ${vars.color.state.warning}`,
  background: vars.color.background.surface,
});

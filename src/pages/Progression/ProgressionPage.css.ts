import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "248px minmax(0, 1fr) 288px",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const panel = style({
  minHeight: 0,
  overflow: "auto",
  padding: "10px",
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
  margin: "0 0 8px",
  fontSize: "0.95rem",
  color: vars.color.text.heading,
});

export const field = style({
  display: "grid",
  gap: "6px",
  marginBottom: "8px",
});

export const label = style({
  fontSize: "0.78rem",
  fontWeight: 700,
  color: vars.color.text.muted,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "30px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "5px 7px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
});

export const checkList = style({
  display: "grid",
  gap: "6px",
});

export const checkItem = style({
  display: "flex",
  gap: "6px",
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
  padding: "7px",
  borderRadius: "4px",
  border: `1px solid ${vars.color.state.warning}`,
  background: vars.color.background.surface,
});

import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "minmax(280px, 34%) minmax(0, 1fr)",
  minHeight: "100%",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  "@media": {
    "(max-width: 820px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const treePane = style({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  minHeight: 0,
  borderRight: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
  "@media": {
    "(max-width: 820px)": {
      borderRight: 0,
      borderBottom: `1px solid ${vars.color.border.default}`,
    },
  },
});

export const paneHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  padding: "8px",
  borderBottom: `1px solid ${vars.color.border.default}`,
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "0.98rem",
});

export const treeList = style({
  display: "grid",
  alignContent: "start",
  gap: "2px",
  minHeight: 0,
  overflow: "auto",
  padding: "6px",
});

export const treeRow = style({
  display: "grid",
  gridTemplateColumns: "24px minmax(0, 1fr) 24px 24px",
  alignItems: "center",
  gap: "2px",
  width: "100%",
  minHeight: "32px",
  border: "1px solid transparent",
  borderRadius: "4px",
  padding: "2px 4px",
  background: "transparent",
  color: vars.color.text.primary,
});

export const selectedTreeRow = style([
  treeRow,
  {
    borderColor: vars.color.border.selected,
    background: vars.color.state.selectedBg,
  },
]);

export const iconButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  font: "inherit",
  fontWeight: 800,
  lineHeight: 1,
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
    "&:disabled": {
      cursor: "default",
      opacity: 0.45,
    },
  },
});

export const rowButton = style({
  display: "grid",
  gap: "2px",
  minWidth: 0,
  border: 0,
  padding: "2px 4px",
  background: "transparent",
  color: vars.color.text.primary,
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
});

export const nodeHeader = style({
  overflow: "hidden",
  color: vars.color.text.heading,
  fontSize: "0.86rem",
  fontWeight: 800,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const nodeDescription = style({
  overflow: "hidden",
  color: vars.color.text.muted,
  fontSize: "0.74rem",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const tick = style({
  color: vars.color.state.success,
  fontSize: "0.95rem",
  fontWeight: 900,
  textAlign: "center",
});

export const editorPane = style({
  display: "grid",
  alignContent: "start",
  gap: "10px",
  minWidth: 0,
  padding: "10px",
});

export const section = style({
  display: "grid",
  gap: "10px",
  padding: "10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  background: vars.color.background.surface,
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "8px",
  "@media": {
    "(max-width: 720px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const fullWidth = style({
  gridColumn: "1 / -1",
});

export const field = style({
  display: "grid",
  gap: "4px",
});

export const label = style({
  color: vars.color.text.muted,
  fontSize: "0.68rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "32px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "6px 8px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const textarea = style([
  input,
  {
    minHeight: "120px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.4,
  },
]);

export const childList = style({
  display: "grid",
  gap: "6px",
});

export const childItem = style({
  display: "grid",
  gap: "2px",
  padding: "7px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  font: "inherit",
  textAlign: "left",
});

export const muted = style({
  color: vars.color.text.muted,
  fontSize: "0.82rem",
});

export const actionRow = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
});

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "32px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "6px 10px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontWeight: 800,
  textDecoration: "none",
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
    "&:disabled": {
      cursor: "wait",
      opacity: 0.7,
    },
  },
});

export const primaryButton = style([
  button,
  {
    borderColor: vars.color.brand.primary,
    background: vars.color.brand.primary,
    color: vars.color.text.inverse,
  },
]);

export const statusText = style({
  color: vars.color.state.success,
  fontSize: "0.82rem",
  fontWeight: 700,
});

export const errorText = style([
  statusText,
  {
    color: vars.color.state.error,
  },
]);

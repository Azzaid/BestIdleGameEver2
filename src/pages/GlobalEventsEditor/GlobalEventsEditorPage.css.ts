import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  minHeight: "100%",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  "@media": {
    "(max-width: 860px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const sidebar = style({
  display: "grid",
  alignContent: "start",
  gap: "10px",
  padding: "12px",
  borderRight: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
  "@media": {
    "(max-width: 860px)": {
      borderRight: 0,
      borderBottom: `1px solid ${vars.color.border.default}`,
    },
  },
});

export const content = style({
  display: "grid",
  alignContent: "start",
  gap: "12px",
  minWidth: 0,
  padding: "12px",
});

export const header = style({
  display: "grid",
  gap: "4px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1.15rem",
});

export const subtitle = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: "0.9rem",
});

export const tabs = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "6px",
});

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "32px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "6px 9px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontWeight: 800,
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

export const activeButton = style([
  button,
  {
    borderColor: vars.color.brand.primary,
    background: vars.color.brand.primary,
    color: vars.color.text.inverse,
  },
]);

export const list = style({
  display: "grid",
  gap: "6px",
});

export const listItem = style({
  display: "grid",
  gap: "2px",
  width: "100%",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "8px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  textAlign: "left",
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const listItemActive = style([
  listItem,
  {
    borderColor: vars.color.brand.primary,
  },
]);

export const listTitle = style({
  overflowWrap: "anywhere",
  color: vars.color.text.heading,
  fontWeight: 800,
});

export const listMeta = style({
  overflowWrap: "anywhere",
  color: vars.color.text.muted,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.76rem",
});

export const section = style({
  display: "grid",
  gap: "10px",
  padding: "10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  background: vars.color.background.surface,
});

export const sectionHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  flexWrap: "wrap",
});

export const sectionTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "0.92rem",
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "8px",
  "@media": {
    "(max-width: 680px)": {
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
    minHeight: "86px",
    resize: "vertical",
    fontFamily: "inherit",
  },
]);

export const jsonTextarea = style([
  textarea,
  {
    minHeight: "190px",
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
    fontSize: "0.82rem",
    lineHeight: 1.45,
  },
]);

export const rowList = style({
  display: "grid",
  gap: "8px",
});

export const row = style({
  display: "grid",
  gridTemplateColumns: "minmax(150px, 0.9fr) minmax(180px, 1.3fr) minmax(90px, 0.5fr) auto",
  gap: "6px",
  alignItems: "end",
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const actionRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(170px, 0.9fr) minmax(220px, 1.4fr) auto",
  gap: "6px",
  alignItems: "end",
  "@media": {
    "(max-width: 680px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const toggle = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  minHeight: "32px",
  fontWeight: 800,
});

export const preview = style({
  minHeight: "180px",
  maxHeight: "420px",
  overflow: "auto",
  margin: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "10px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  fontSize: "0.8rem",
  lineHeight: 1.45,
});

export const saveRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "8px",
  flexWrap: "wrap",
});

export const statusText = style({
  color: vars.color.text.muted,
  fontSize: "0.86rem",
});

export const errorText = style({
  color: vars.color.state.error,
  fontSize: "0.86rem",
  fontWeight: 800,
});

export const hint = style({
  color: vars.color.text.muted,
  fontSize: "0.84rem",
});

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
  gap: "8px",
  padding: "8px",
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
  gap: "8px",
  minWidth: 0,
  padding: "8px",
});

export const header = style({
  display: "grid",
  gap: "4px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1rem",
});

export const subtitle = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: "0.88rem",
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
  fontSize: "0.94rem",
});

export const sectionMeta = style({
  margin: "3px 0 0",
  overflowWrap: "anywhere",
  color: vars.color.text.muted,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.78rem",
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

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "30px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "5px 10px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontWeight: 800,
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.65,
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
  maxHeight: "calc(100vh - 190px)",
  overflow: "auto",
});

export const listItem = style({
  display: "grid",
  gap: "2px",
  width: "100%",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "6px",
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
    background: vars.color.state.selectedBg,
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

export const preview = style({
  minHeight: "220px",
  maxHeight: "430px",
  overflow: "auto",
  margin: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "10px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  fontSize: "0.82rem",
  lineHeight: 1.45,
});

export const statusRow = style({
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

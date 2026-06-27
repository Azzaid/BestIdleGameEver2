import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gap: "10px",
  padding: "10px",
  color: vars.color.text.primary,
});

export const header = style({
  display: "flex",
  alignItems: "end",
  justifyContent: "space-between",
  gap: "10px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1.25rem",
});

export const subtitle = style({
  margin: "4px 0 0",
  color: vars.color.text.muted,
});

export const summary = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "6px",
});

export const summaryItem = style({
  display: "grid",
  gap: "3px",
  padding: "8px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.surface,
});

export const summaryLabel = style({
  color: vars.color.text.muted,
  fontSize: "0.78rem",
  fontWeight: 700,
  textTransform: "uppercase",
});

export const summaryValue = style({
  color: vars.color.text.heading,
  fontSize: "1.1rem",
  fontWeight: 800,
});

export const tableWrap = style({
  overflow: "auto",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.surface,
});

export const filters = style({
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1.4fr) repeat(4, minmax(150px, 1fr)) auto",
  gap: "6px",
  alignItems: "end",
  padding: "8px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.surface,
  "@media": {
    "(max-width: 1100px)": {
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    },
  },
});

export const field = style({
  display: "grid",
  gap: "4px",
});

export const filterLabel = style({
  color: vars.color.text.muted,
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "30px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "5px 7px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const toggle = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  minHeight: "30px",
  padding: "5px 7px",
  color: vars.color.text.primary,
  fontWeight: 700,
  whiteSpace: "nowrap",
});

export const table = style({
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1060px",
});

export const headCell = style({
  padding: "7px 9px",
  borderBottom: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.app,
  color: vars.color.text.heading,
  fontSize: "0.78rem",
  textAlign: "left",
  textTransform: "uppercase",
});

export const cell = style({
  padding: "7px 9px",
  borderBottom: `1px solid ${vars.color.border.default}`,
  verticalAlign: "top",
});

export const mono = style({
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.84rem",
});

export const muted = style({
  color: vars.color.text.muted,
});

export const okBadge = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "20px",
  padding: "1px 6px",
  borderRadius: "3px",
  background: vars.color.state.success,
  color: vars.color.text.inverse,
  fontSize: "0.78rem",
  fontWeight: 700,
});

export const missingBadge = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "20px",
  padding: "1px 6px",
  borderRadius: "3px",
  background: vars.color.state.error,
  color: vars.color.text.inverse,
  fontSize: "0.78rem",
  fontWeight: 700,
});

export const neutralBadge = style({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "20px",
  padding: "1px 6px",
  borderRadius: "3px",
  border: `1px solid ${vars.color.border.default}`,
  color: vars.color.text.muted,
  fontSize: "0.78rem",
  fontWeight: 700,
});

export const editLink = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "24px",
  padding: "3px 7px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  color: vars.color.text.primary,
  textDecoration: "none",
  fontWeight: 700,
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

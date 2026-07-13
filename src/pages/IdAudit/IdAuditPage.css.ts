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
  width: "max-content",
  borderCollapse: "collapse",
  minWidth: "100%",
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

export const toolbar = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "8px",
  padding: "8px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.surface,
});

export const saveButton = style({
  minHeight: "30px",
  padding: "5px 10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  background: vars.color.brand.primary,
  color: vars.color.text.inverse,
  fontWeight: 800,
  cursor: "pointer",
  selectors: {
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.55,
    },
    "&:not(:disabled):hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const statusText = style({
  color: vars.color.text.muted,
  fontSize: "0.84rem",
  fontWeight: 700,
});

export const errorText = style({
  color: vars.color.state.error,
  fontSize: "0.84rem",
  fontWeight: 700,
});

export const columnChooser = style({
  position: "relative",
});

export const columnChooserSummary = style({
  minHeight: "30px",
  padding: "5px 10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontWeight: 800,
  listStyle: "none",
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const columnChooserPanel = style({
  position: "absolute",
  zIndex: 20,
  top: "calc(100% + 6px)",
  left: 0,
  display: "grid",
  gap: "10px",
  width: "min(760px, calc(100vw - 32px))",
  maxHeight: "520px",
  overflow: "auto",
  padding: "10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.surface,
  boxShadow: vars.color.shadow.popover,
});

export const columnChooserGroup = style({
  display: "grid",
  gap: "6px",
});

export const columnChooserHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
});

export const columnChooserTitle = style({
  color: vars.color.text.heading,
  fontSize: "0.78rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const columnChooserActions = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
});

export const smallButton = style({
  minHeight: "24px",
  padding: "2px 7px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontSize: "0.76rem",
  fontWeight: 800,
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const columnOptions = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "5px 8px",
});

export const valueColumnOptions = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "5px 8px",
});

export const columnOption = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  minWidth: 0,
  color: vars.color.text.primary,
  fontSize: "0.8rem",
});

export const valueHeadCell = style({
  width: "94px",
  maxWidth: "94px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textTransform: "none",
});

export const valueCell = style({
  width: "94px",
  maxWidth: "94px",
  padding: "4px",
});

export const valueInputPair = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "4px",
});

export const valueInput = style({
  width: "40px",
  minHeight: "24px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "2px 4px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.78rem",
  selectors: {
    "&:disabled": {
      background: vars.color.background.surface,
      color: vars.color.text.muted,
    },
    "&:focus": {
      borderColor: vars.color.border.focus,
      outline: "none",
    },
  },
});

export const provideInput = style({
  borderColor: vars.color.state.success,
});

export const upkeepInput = style({
  borderColor: vars.color.state.error,
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

export const actionLinks = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  whiteSpace: "nowrap",
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

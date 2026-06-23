import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "minmax(360px, 520px) minmax(0, 1fr)",
  gap: "18px",
  minHeight: "100%",
  padding: "20px",
  color: vars.color.text.primary,
  "@media": {
    "(max-width: 980px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const formPanel = style({
  display: "grid",
  alignContent: "start",
  gap: "16px",
});

export const previewPanel = style({
  display: "grid",
  gridTemplateRows: "auto auto minmax(0, 1fr)",
  gap: "12px",
  minHeight: 0,
});

export const header = style({
  display: "grid",
  gap: "4px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1.45rem",
});

export const subtitle = style({
  margin: 0,
  color: vars.color.text.muted,
});

export const section = style({
  display: "grid",
  gap: "12px",
  padding: "14px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  background: vars.color.background.surface,
});

export const sectionHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
});

export const sectionTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "0.95rem",
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const field = style({
  display: "grid",
  gap: "6px",
});

export const fullWidth = style({
  gridColumn: "1 / -1",
});

export const label = style({
  color: vars.color.text.muted,
  fontSize: "0.74rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "36px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "7px 9px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const textarea = style([
  input,
  {
    minHeight: "70px",
    resize: "vertical",
    fontFamily: "inherit",
  },
]);

export const toggle = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  minHeight: "36px",
  color: vars.color.text.primary,
  fontWeight: 700,
});

export const idPreview = style({
  minHeight: "36px",
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  overflowWrap: "anywhere",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "7px 9px",
  background: vars.color.background.app,
  color: vars.color.text.heading,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.85rem",
});

export const rowList = style({
  display: "grid",
  gap: "10px",
});

export const row = style({
  display: "grid",
  gridTemplateColumns: "minmax(160px, 1.4fr) repeat(2, minmax(90px, 0.7fr)) auto",
  gap: "8px",
  alignItems: "end",
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const effectRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(130px, 1fr)) repeat(3, minmax(80px, 0.6fr)) auto",
  gap: "8px",
  alignItems: "end",
  "@media": {
    "(max-width: 920px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const requirementRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(160px, 1fr) minmax(180px, 1.3fr) minmax(90px, 0.6fr) auto",
  gap: "8px",
  alignItems: "end",
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const idRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1fr) auto",
  gap: "8px",
  alignItems: "end",
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "36px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "7px 10px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  fontWeight: 800,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const primaryButton = style([
  button,
  {
    borderColor: vars.color.brand.primary,
    background: vars.color.brand.primary,
    color: vars.color.text.inverse,
    selectors: {
      "&:disabled": {
        cursor: "wait",
        opacity: 0.7,
      },
    },
  },
]);

export const dangerButton = style([
  button,
  {
    color: vars.color.state.error,
  },
]);

export const mono = style({
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
});

export const preview = style({
  minHeight: 0,
  overflow: "auto",
  margin: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "14px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  fontSize: "0.86rem",
  lineHeight: 1.5,
});

export const hint = style({
  color: vars.color.text.muted,
  fontSize: "0.84rem",
});

export const saveRow = style({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
});

export const statusText = style({
  color: vars.color.text.muted,
  fontSize: "0.86rem",
});

export const errorText = style({
  color: vars.color.state.error,
  fontSize: "0.86rem",
  fontWeight: 700,
});

export const multiSelect = style({
  display: "grid",
  gap: "6px",
  minHeight: "36px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "6px",
  background: vars.color.background.app,
});

export const chipList = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "5px",
});

export const chip = style({
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "999px",
  padding: "3px 7px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontSize: "0.78rem",
});

export const multiSearch = style({
  minWidth: 0,
  border: 0,
  outline: 0,
  background: "transparent",
  color: vars.color.text.primary,
});

export const optionList = style({
  display: "grid",
  gap: "3px",
  maxHeight: "170px",
  overflow: "auto",
});

export const option = style({
  border: 0,
  borderRadius: "4px",
  padding: "5px 7px",
  background: "transparent",
  color: vars.color.text.primary,
  cursor: "pointer",
  textAlign: "left",
  selectors: {
    "&:hover": {
      background: vars.color.background.surface,
    },
  },
});

import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "320px minmax(0, 1fr)",
  gap: "14px",
  minHeight: "100%",
  padding: "14px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  "@media": {
    "(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const panel = style({
  display: "grid",
  alignContent: "start",
  gap: "12px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "12px",
  background: vars.color.background.surface,
});

export const header = style({
  display: "grid",
  gap: "4px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1.2rem",
});

export const subtitle = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: "0.88rem",
});

export const form = style({
  display: "grid",
  gap: "10px",
});

export const field = style({
  display: "grid",
  gap: "5px",
});

export const label = style({
  color: vars.color.text.muted,
  fontSize: "0.72rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "34px",
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
  minHeight: "34px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "6px 10px",
  background: vars.color.brand.primary,
  color: vars.color.text.inverse,
  cursor: "pointer",
  fontWeight: 800,
  selectors: {
    "&:disabled": {
      cursor: "wait",
      opacity: 0.65,
    },
  },
});

export const status = style({
  color: vars.color.text.muted,
  fontSize: "0.84rem",
});

export const error = style({
  color: vars.color.state.error,
  fontSize: "0.84rem",
  fontWeight: 800,
});

export const filterGrid = style({
  display: "grid",
  gridTemplateColumns: "minmax(180px, 1fr) repeat(3, minmax(150px, 0.6fr))",
  gap: "10px",
  "@media": {
    "(max-width: 980px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "(max-width: 620px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const summary = style({
  color: vars.color.text.muted,
  fontSize: "0.86rem",
});

export const tableWrap = style({
  overflow: "auto",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  background: vars.color.background.surface,
});

export const table = style({
  width: "100%",
  minWidth: "940px",
  borderCollapse: "collapse",
});

export const headCell = style({
  padding: "10px 12px",
  borderBottom: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.app,
  color: vars.color.text.heading,
  fontSize: "0.76rem",
  textAlign: "left",
  textTransform: "uppercase",
});

export const cell = style({
  padding: "10px 12px",
  borderBottom: `1px solid ${vars.color.border.default}`,
  verticalAlign: "middle",
});

export const mono = style({
  overflowWrap: "anywhere",
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.82rem",
});

export const thumbnail = style({
  width: "72px",
  height: "72px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  background: vars.color.background.app,
  imageRendering: "pixelated",
  objectFit: "cover",
});

export const empty = style({
  padding: "18px",
  color: vars.color.text.muted,
  textAlign: "center",
});

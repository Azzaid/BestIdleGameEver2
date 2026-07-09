import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "minmax(300px, 380px) minmax(0, 1fr)",
  gap: "10px",
  minHeight: "100%",
  padding: "8px",
  color: vars.color.text.primary,
  "@media": {
    "(max-width: 860px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const panel = style({
  display: "grid",
  alignContent: "start",
  gap: "10px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "10px",
  background: vars.color.background.surface,
});

export const header = style({
  display: "grid",
  gap: "2px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1rem",
});

export const subtitle = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: "0.86rem",
});

export const form = style({
  display: "grid",
  gap: "8px",
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "8px",
});

export const field = style({
  display: "grid",
  gap: "4px",
});

export const fullWidth = style({
  gridColumn: "1 / -1",
});

export const label = style({
  color: vars.color.text.muted,
  fontSize: "0.68rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "30px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "5px 7px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "32px",
  border: `1px solid ${vars.color.brand.primary}`,
  borderRadius: "6px",
  padding: "6px 10px",
  background: vars.color.brand.primary,
  color: vars.color.text.inverse,
  cursor: "pointer",
  fontWeight: 800,
  selectors: {
    "&:disabled": {
      cursor: "wait",
      opacity: 0.7,
    },
  },
});

export const secondaryButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "28px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "4px 8px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontWeight: 800,
});

export const jsonStatus = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "6px 8px",
  background: vars.color.background.app,
  color: vars.color.text.muted,
  fontSize: "0.82rem",
});

export const status = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: "0.86rem",
});

export const error = style({
  margin: 0,
  color: vars.color.state.error,
  fontSize: "0.86rem",
  fontWeight: 700,
});

export const previewGrid = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.1fr) minmax(240px, 0.9fr)",
  gap: "10px",
  "@media": {
    "(max-width: 980px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const imagePreview = style({
  position: "relative",
  display: "grid",
  alignContent: "start",
  minHeight: "260px",
  overflow: "auto",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  background: vars.color.background.app,
});

export const sheetImage = style({
  display: "block",
  maxWidth: "100%",
  height: "auto",
});

export const guideLayer = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
});

export const pixiHost = style({
  minHeight: "260px",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  background: vars.color.background.app,
});

export const atlasPreview = style({
  maxHeight: "280px",
  overflow: "auto",
  margin: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "8px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  fontSize: "0.76rem",
  lineHeight: 1.35,
});

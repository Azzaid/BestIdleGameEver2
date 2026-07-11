import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const page = style({
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "18px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const panel = style({
  width: "min(720px, 100%)",
  display: "grid",
  gap: "14px",
  padding: "18px",
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: 6,
  background: vars.color.background.surface,
  boxShadow: vars.color.shadow.card,
});

export const header = style({
  display: "grid",
  gap: "6px",
});

export const kicker = style({
  margin: 0,
  color: vars.color.text.muted,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.72rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1.35rem",
});

export const message = style({
  margin: 0,
  color: vars.color.text.primary,
  lineHeight: 1.5,
});

export const stack = style({
  maxHeight: "220px",
  overflow: "auto",
  margin: 0,
  padding: "10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: 4,
  background: vars.color.background.app,
  color: vars.color.text.muted,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.78rem",
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
});

export const actions = style({
  display: "flex",
  justifyContent: "flex-end",
});

export const primaryButton = style({
  minHeight: "34px",
  padding: "7px 11px",
  border: `1px solid ${vars.color.border.selected}`,
  borderRadius: 4,
  background: vars.color.brand.primary,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontWeight: 800,
  selectors: {
    "&:hover": {
      filter: "brightness(1.06)",
    },
  },
});

import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";
import * as hud from "../theme/hud.css.ts";

export const page = style({
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "18px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const panel = style([
  hud.compactPanel,
  {
  width: "min(720px, 100%)",
  display: "grid",
  gap: "14px",
  padding: "18px",
  },
]);

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

export const primaryButton = style([
  hud.button,
  {
  minHeight: "34px",
  padding: "7px 11px",
  },
]);

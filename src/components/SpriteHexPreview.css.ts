import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const stage = style({
  position: "relative",
  display: "grid",
  placeItems: "center",
  minHeight: "180px",
  overflow: "auto",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  background: vars.color.background.surface,
});

export const hex = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  color: vars.color.brand.primary,
  opacity: 0.72,
  overflow: "visible",
});

export const image = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  display: "block",
  maxWidth: "none",
  maxHeight: "none",
  objectFit: "contain",
  transformOrigin: "center",
  pointerEvents: "none",
});

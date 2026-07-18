import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const stage = style({
  position: "relative",
  maxWidth: "100%",
  overflow: "auto",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  background: vars.color.background.surface,
});

export const content = style({
  position: "relative",
});

export const surface = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  transformOrigin: "center",
});

const hexOutline = style({
  color: vars.color.brand.primary,
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: 1,
});

export const hexFull = style([
  hexOutline,
  {
    fillOpacity: 0.1,
    opacity: 0.72,
  },
]);

export const hexHalf = style([
  hexOutline,
  {
    fillOpacity: 0,
    opacity: 0.52,
    strokeDasharray: "8 7",
  },
]);

export const hexQuarter = style([
  hexOutline,
  {
    fillOpacity: 0,
    opacity: 0.38,
    strokeDasharray: "3 5",
  },
]);

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

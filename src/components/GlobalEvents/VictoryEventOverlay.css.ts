import {keyframes, style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";
import * as hud from "../../theme/hud.css.ts";

const pulse = keyframes({
  "0%, 100%": {transform: "scale(1)", filter: "brightness(1)"},
  "50%": {transform: "scale(1.03)", filter: "brightness(1.25)"},
});

const sweep = keyframes({
  "0%": {transform: "translateX(-120%) skewX(-18deg)", opacity: 0},
  "20%": {opacity: 0.9},
  "100%": {transform: "translateX(120%) skewX(-18deg)", opacity: 0},
});

const spin = keyframes({
  "0%": {transform: "rotate(0deg) scale(1.1)"},
  "100%": {transform: "rotate(360deg) scale(1.1)"},
});

const burst = keyframes({
  "0%": {
    transform: "translate(-50%, -50%) rotate(var(--spark-angle)) translateY(0) scale(0.5)",
    opacity: 0,
  },
  "18%": {opacity: 1},
  "100%": {
    transform: "translate(-50%, -50%) rotate(var(--spark-angle)) translateY(-46vh) scale(1)",
    opacity: 0,
  },
});

export const backdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 1400,
  display: "grid",
  placeItems: "center",
  padding: "18px",
  overflow: "hidden",
  background: `linear-gradient(135deg, color-mix(in srgb, ${vars.color.background.app} 88%, transparent), color-mix(in srgb, ${vars.color.brand.primary} 88%, transparent)), repeating-linear-gradient(90deg, transparent 0 18px, color-mix(in srgb, ${vars.color.state.warning} 18%, transparent) 18px 20px)`,
  color: vars.color.text.inverse,
});

export const vfxLayer = style({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
});

export const rays = style({
  position: "absolute",
  width: "150vmax",
  height: "150vmax",
  background: `repeating-conic-gradient(from 0deg, transparent 0deg 10deg, color-mix(in srgb, ${vars.color.state.warning} 32%, transparent) 10deg 13deg)`,
  opacity: 0.8,
  animation: `${spin} 12s linear infinite`,
  pointerEvents: "none",
});

export const spark = style({
  position: "absolute",
  left: "50%",
  top: "52%",
  width: "8px",
  height: "34px",
  borderRadius: 2,
  background: vars.color.text.inverse,
  boxShadow: `0 0 18px ${vars.color.state.warning}`,
  transformOrigin: "50% 50%",
  animation: `${burst} 1800ms ease-out infinite`,
  animationDelay: "var(--spark-delay)",
});

export const panel = style([
  hud.compactPanel,
  {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gap: "14px",
  width: "min(920px, 100%)",
  maxHeight: "calc(100vh - 36px)",
  overflowY: "auto",
  padding: "clamp(20px, 5vw, 48px)",
  color: vars.color.text.primary,
  boxShadow: `0 0 0 6px color-mix(in srgb, ${vars.color.state.warning} 28%, transparent), 0 24px 80px rgba(0, 0, 0, 0.55)`,
  textAlign: "center",
  animation: `${pulse} 1600ms ease-in-out infinite`,
  selectors: {
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${vars.color.text.inverse} 58%, transparent), transparent)`,
      animation: `${sweep} 2200ms ease-in-out infinite`,
      pointerEvents: "none",
    },
  },
  },
]);

export const kicker = style({
  margin: 0,
  color: vars.color.state.warning,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.82rem",
  fontWeight: 900,
  letterSpacing: 0,
  textTransform: "uppercase",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "clamp(2.4rem, 10vw, 6.4rem)",
  lineHeight: 0.95,
  textTransform: "uppercase",
});

export const image = style({
  width: "100%",
  maxHeight: "38vh",
  objectFit: "cover",
  borderRadius: 6,
  border: `1px solid ${vars.color.border.strong}`,
});

export const description = style({
  margin: 0,
  color: vars.color.text.primary,
  fontSize: "clamp(1rem, 2vw, 1.25rem)",
  lineHeight: 1.55,
  whiteSpace: "pre-line",
});

export const hint = style({
  margin: 0,
  padding: "10px 12px",
  borderLeft: `4px solid ${vars.color.state.warning}`,
  background: vars.color.background.app,
  color: vars.color.text.muted,
  lineHeight: 1.45,
});

export const actions = style({
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  flexWrap: "wrap",
});

export const primaryButton = style([
  hud.button,
  {
  minHeight: "38px",
  padding: "8px 14px",
  },
]);

export const secondaryButton = style([
  hud.secondaryButton,
  {
  minHeight: "38px",
  padding: "8px 14px",
  },
]);

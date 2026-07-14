import { createVar, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css.ts";

export const hudAccent = createVar();
export const hudAccentSoft = createVar();
export const hudSurface = createVar();
export const hudText = createVar();
export const hudMuted = createVar();
export const hudBorder = createVar();

const glowShadow = `
  0 0 0 1px color-mix(in oklab, ${hudAccent} 28%, transparent),
  0 0 18px color-mix(in oklab, ${hudAccent} 24%, transparent),
  0 10px 24px rgba(0, 0, 0, 0.18)
`;

export const hudVars = style({
  vars: {
    [hudAccent]: "hsl(186 54% 48%)",
    [hudAccentSoft]: "hsl(186 54% 48% / 0.13)",
    [hudSurface]: "hsl(45 38% 86% / 0.62)",
    [hudText]: "hsl(32 28% 16%)",
    [hudMuted]: "hsl(32 18% 28% / 0.76)",
    [hudBorder]: "hsl(32 22% 38% / 0.34)",
  },
});

export const vectorVars = styleVariants({
  neutral: {
    vars: {
      [hudAccent]: "hsl(186 54% 48%)",
      [hudAccentSoft]: "hsl(186 54% 48% / 0.13)",
      [hudSurface]: "hsl(45 38% 86% / 0.62)",
      [hudText]: "hsl(32 28% 16%)",
      [hudMuted]: "hsl(32 18% 28% / 0.76)",
      [hudBorder]: "hsl(32 22% 38% / 0.34)",
    },
  },
  tech: {
    vars: {
      [hudAccent]: "hsl(190 96% 62%)",
      [hudAccentSoft]: "hsl(190 96% 62% / 0.14)",
      [hudSurface]: "hsl(205 38% 96% / 0.42)",
      [hudText]: "hsl(210 45% 13%)",
      [hudMuted]: "hsl(210 26% 28% / 0.78)",
      [hudBorder]: "hsl(190 96% 62% / 0.42)",
    },
  },
  nature: {
    vars: {
      [hudAccent]: "hsl(139 72% 52%)",
      [hudAccentSoft]: "hsl(139 72% 52% / 0.16)",
      [hudSurface]: "hsl(132 34% 18% / 0.60)",
      [hudText]: "hsl(122 82% 94%)",
      [hudMuted]: "hsl(124 35% 78% / 0.84)",
      [hudBorder]: "hsl(139 72% 52% / 0.38)",
    },
  },
  medieval: {
    vars: {
      [hudAccent]: "hsl(42 92% 58%)",
      [hudAccentSoft]: "hsl(42 92% 58% / 0.16)",
      [hudSurface]: "hsl(46 28% 21% / 0.62)",
      [hudText]: "hsl(47 92% 91%)",
      [hudMuted]: "hsl(43 35% 76% / 0.82)",
      [hudBorder]: "hsl(42 92% 58% / 0.42)",
    },
  },
  aether: {
    vars: {
      [hudAccent]: "hsl(276 90% 68%)",
      [hudAccentSoft]: "hsl(276 90% 68% / 0.17)",
      [hudSurface]: "hsl(235 42% 22% / 0.58)",
      [hudText]: "hsl(286 100% 95%)",
      [hudMuted]: "hsl(276 44% 82% / 0.84)",
      [hudBorder]: "hsl(276 90% 68% / 0.46)",
    },
  },
});

export const panelBase = style([
  hudVars,
  {
    position: "relative",
    isolation: "isolate",
    border: `1px solid ${hudBorder}`,
    borderRadius: 6,
    background: `
      linear-gradient(145deg, rgba(255, 255, 255, 0.13), transparent 34%),
      linear-gradient(180deg, ${hudSurface}, color-mix(in oklab, ${hudSurface} 82%, black 18%))
    `,
    color: hudText,
    boxShadow: glowShadow,
    overflow: "hidden",
    backdropFilter: "blur(8px) saturate(1.14)",
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 1,
        zIndex: -1,
        borderRadius: 5,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        pointerEvents: "none",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        inset: "0 0 auto",
        height: 2,
        background: `linear-gradient(90deg, transparent, ${hudAccent}, transparent)`,
        opacity: 0.78,
        pointerEvents: "none",
      },
    },
  },
]);

export const panelFrame = styleVariants({
  neutral: [
    panelBase,
    {
      vars: {
        [hudAccent]: "hsl(186 54% 48%)",
        [hudAccentSoft]: "hsl(186 54% 48% / 0.13)",
        [hudSurface]: "hsl(45 38% 86% / 0.64)",
        [hudText]: "hsl(32 28% 16%)",
        [hudMuted]: "hsl(32 18% 28% / 0.76)",
        [hudBorder]: "hsl(32 22% 38% / 0.34)",
      },
      background: `
        linear-gradient(145deg, rgba(255, 255, 255, 0.28), transparent 38%),
        repeating-linear-gradient(0deg, transparent 0 19px, hsl(32 22% 38% / 0.04) 19px 20px),
        hsl(45 38% 86% / 0.64)
      `,
    },
  ],
  tech: [
    panelBase,
    {
      vars: {
        [hudAccent]: "hsl(190 96% 62%)",
        [hudAccentSoft]: "hsl(190 96% 62% / 0.14)",
        [hudSurface]: "hsl(205 38% 96% / 0.42)",
        [hudText]: "hsl(210 45% 13%)",
        [hudMuted]: "hsl(210 26% 28% / 0.78)",
        [hudBorder]: "hsl(190 96% 62% / 0.42)",
      },
      background: `
        linear-gradient(145deg, rgba(255, 255, 255, 0.42), transparent 42%),
        linear-gradient(180deg, hsl(205 38% 96% / 0.44), hsl(210 42% 82% / 0.24))
      `,
    },
  ],
  nature: [
    panelBase,
    {
      vars: {
        [hudAccent]: "hsl(139 72% 52%)",
        [hudAccentSoft]: "hsl(139 72% 52% / 0.16)",
        [hudSurface]: "hsl(132 34% 18% / 0.60)",
        [hudText]: "hsl(122 82% 94%)",
        [hudMuted]: "hsl(124 35% 78% / 0.84)",
        [hudBorder]: "hsl(139 72% 52% / 0.38)",
      },
      borderRadius: "8px 4px 8px 4px",
    },
  ],
  medieval: [
    panelBase,
    {
      vars: {
        [hudAccent]: "hsl(42 92% 58%)",
        [hudAccentSoft]: "hsl(42 92% 58% / 0.16)",
        [hudSurface]: "hsl(46 28% 21% / 0.62)",
        [hudText]: "hsl(47 92% 91%)",
        [hudMuted]: "hsl(43 35% 76% / 0.82)",
        [hudBorder]: "hsl(42 92% 58% / 0.42)",
      },
      borderRadius: 3,
      background: `
        repeating-linear-gradient(90deg, transparent 0 10px, rgba(255, 255, 255, 0.04) 10px 11px),
        linear-gradient(180deg, hsl(46 28% 21% / 0.64), hsl(34 26% 13% / 0.70))
      `,
    },
  ],
  aether: [
    panelBase,
    {
      vars: {
        [hudAccent]: "hsl(276 90% 68%)",
        [hudAccentSoft]: "hsl(276 90% 68% / 0.17)",
        [hudSurface]: "hsl(235 42% 22% / 0.58)",
        [hudText]: "hsl(286 100% 95%)",
        [hudMuted]: "hsl(276 44% 82% / 0.84)",
        [hudBorder]: "hsl(276 90% 68% / 0.46)",
      },
      borderRadius: 8,
      background: `
        linear-gradient(125deg, hsl(174 86% 62% / 0.16), transparent 34%),
        linear-gradient(250deg, hsl(285 90% 72% / 0.18), transparent 38%),
        hsl(235 42% 22% / 0.58)
      `,
      boxShadow: `
        0 0 0 1px hsl(276 90% 68% / 0.28),
        0 0 20px hsl(276 90% 68% / 0.38),
        inset 0 0 18px hsl(276 90% 68% / 0.12),
        0 12px 28px rgba(0, 0, 0, 0.24)
      `,
    },
  ],
});

export const panelInteractive = style({
  transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
  selectors: {
    "&:hover": {
      transform: "translateY(-1px)",
      borderColor: hudAccent,
      boxShadow: `
        0 0 0 1px color-mix(in oklab, ${hudAccent} 46%, transparent),
        0 0 24px color-mix(in oklab, ${hudAccent} 34%, transparent),
        0 14px 30px rgba(0, 0, 0, 0.24)
      `,
    },
  },
});

export const compactPanel = style([panelFrame.neutral, {
  borderRadius: 5,
  background: `color-mix(in oklab, ${vars.color.background.surface} 66%, transparent)`,
}]);

export const button = style({
  minHeight: 28,
  padding: "5px 9px",
  border: `1px solid color-mix(in oklab, ${hudAccent} 68%, black 12%)`,
  borderRadius: 4,
  background: `linear-gradient(180deg, color-mix(in oklab, ${hudAccent} 62%, white 16%), color-mix(in oklab, ${hudAccent} 82%, black 18%))`,
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
  boxShadow: "0 2px 0 rgba(0, 0, 0, 0.24)",
  selectors: {
    "&:hover": {
      filter: "brightness(1.08)",
    },
    "&:active": {
      transform: "translateY(1px)",
      boxShadow: "0 1px 0 rgba(0, 0, 0, 0.24)",
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.55,
      filter: "grayscale(0.25)",
    },
    "&:focus-visible": {
      outline: `2px solid ${hudAccent}`,
      outlineOffset: 2,
    },
  },
});

export const secondaryButton = style([
  button,
  {
    background: `color-mix(in oklab, ${hudSurface} 72%, transparent)`,
    color: hudText,
  },
]);

export const chip = style({
  minHeight: 20,
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 6px",
  border: `1px solid color-mix(in oklab, ${hudBorder} 68%, transparent)`,
  borderRadius: 999,
  background: hudAccentSoft,
  color: hudText,
  fontSize: "0.72rem",
  fontWeight: 800,
});

export const statCell = style({
  display: "grid",
  gap: 1,
  minHeight: 38,
  padding: "5px 6px",
  border: `1px solid color-mix(in oklab, ${hudBorder} 76%, transparent)`,
  borderRadius: 4,
  background: "rgba(0, 0, 0, 0.10)",
});

export const meterTrack = style({
  height: 7,
  overflow: "hidden",
  border: `1px solid color-mix(in oklab, ${hudBorder} 60%, transparent)`,
  borderRadius: 999,
  background: "rgba(0, 0, 0, 0.18)",
});

const meterFillBase = style({
  display: "block",
  height: "100%",
  minWidth: 6,
  borderRadius: 999,
  boxShadow: "0 0 10px currentColor",
});

export const meterFillTone = styleVariants({
  success: [meterFillBase, { background: "hsl(139 74% 54%)", color: "hsl(139 74% 54%)" }],
  warning: [meterFillBase, { background: "hsl(40 92% 58%)", color: "hsl(40 92% 58%)" }],
  error: [meterFillBase, { background: "hsl(0 80% 60%)", color: "hsl(0 80% 60%)" }],
  info: [meterFillBase, { background: "hsl(190 92% 58%)", color: "hsl(190 92% 58%)" }],
  nature: [meterFillBase, { background: "hsl(122 72% 52%)", color: "hsl(122 72% 52%)" }],
  aether: [meterFillBase, { background: "hsl(276 90% 68%)", color: "hsl(276 90% 68%)" }],
});

export const tableRow = style({
  borderColor: hudBorder,
  background: `linear-gradient(90deg, ${hudAccentSoft}, transparent 42%)`,
});

export const rowFrame = styleVariants({
  neutral: [hudVars, tableRow],
  tech: [
    hudVars,
    tableRow,
    {
      vars: {
        [hudAccent]: "hsl(190 96% 62%)",
        [hudAccentSoft]: "hsl(190 96% 62% / 0.14)",
        [hudBorder]: "hsl(190 96% 62% / 0.42)",
      },
    },
  ],
  nature: [
    hudVars,
    tableRow,
    {
      vars: {
        [hudAccent]: "hsl(139 72% 52%)",
        [hudAccentSoft]: "hsl(139 72% 52% / 0.16)",
        [hudBorder]: "hsl(139 72% 52% / 0.38)",
      },
    },
  ],
  medieval: [
    hudVars,
    tableRow,
    {
      vars: {
        [hudAccent]: "hsl(42 92% 58%)",
        [hudAccentSoft]: "hsl(42 92% 58% / 0.16)",
        [hudBorder]: "hsl(42 92% 58% / 0.42)",
      },
    },
  ],
  aether: [
    hudVars,
    tableRow,
    {
      vars: {
        [hudAccent]: "hsl(276 90% 68%)",
        [hudAccentSoft]: "hsl(276 90% 68% / 0.17)",
        [hudBorder]: "hsl(276 90% 68% / 0.46)",
      },
    },
  ],
});

export const text = style({
  color: hudText,
});

export const mutedText = style({
  color: hudMuted,
});

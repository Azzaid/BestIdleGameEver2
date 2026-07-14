import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const worldUnderlay = style({
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
});

export const cityCanvas = style({
    width: "100%",
    height: "100%",
});

export const battleProgress = style({
    position: "absolute",
    left: "50%",
    zIndex: 2,
    width: "min(720px, calc(100% - 20px))",
    transform: "translateX(-50%)",
    display: "grid",
    gap: "4px",
    pointerEvents: "none",
});

export const siegeProgress = style({
    top: "8px",
});

export const wallResilienceProgress = style({
    bottom: "8px",
});

export const progressLabel = style({
    color: vars.color.text.primary,
    fontSize: "0.78rem",
    fontWeight: 800,
    textTransform: "uppercase",
    textShadow: "0 1px 2px rgb(0 0 0 / 0.55)",
});

export const progressTrack = style({
    height: "9px",
    overflow: "hidden",
    border: `1px solid ${vars.color.border.strong}`,
    borderRadius: "3px",
    backgroundColor: "color-mix(in srgb, black 34%, transparent)",
    boxShadow: vars.color.shadow.card,
});

export const progressFill = style({
    height: "100%",
    borderRadius: "inherit",
    transition: "width 180ms ease-out",
});

export const siegeProgressFill = style([
    progressFill,
    {
        background: `linear-gradient(90deg, ${vars.color.state.warning}, ${vars.color.state.error})`,
    },
]);

export const wallResilienceProgressFill = style([
    progressFill,
    {
        background: `linear-gradient(90deg, ${vars.color.brand.primary}, ${vars.color.state.warning})`,
    },
]);

export const cameraControls = style({
    position: "absolute",
    right: "max(12px, env(safe-area-inset-right, 0px))",
    bottom: "max(14px, env(safe-area-inset-bottom, 0px))",
    zIndex: 2,
    display: "grid",
    gap: "8px",
    pointerEvents: "auto",
});

export const cameraButton = style({
    minWidth: "104px",
    minHeight: "34px",
    padding: "7px 10px",
    border: `1px solid ${vars.color.border.strong}`,
    borderRadius: "4px",
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    fontSize: "0.78rem",
    fontWeight: 800,
    lineHeight: 1,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.28)",
    backdropFilter: "blur(6px)",
    selectors: {
        "&:hover": {
            background: vars.color.background.surfaceHover,
        },
        "&:focus-visible": {
            outline: `2px solid ${vars.color.border.focus}`,
            outlineOffset: "2px",
        },
    },
});

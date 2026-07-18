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

export const exodusPointer = style({
    position: "absolute",
    zIndex: 3,
    width: "52px",
    height: "52px",
    display: "grid",
    placeItems: "center",
    padding: 0,
    border: 0,
    borderRadius: "50%",
    background: "transparent",
    color: vars.color.state.warning,
    cursor: "pointer",
    filter: "drop-shadow(0 3px 7px rgba(0, 0, 0, 0.76)) drop-shadow(0 0 2px rgba(0, 0, 0, 0.96))",
    transformOrigin: "50% 50%",
    transition: "opacity 160ms ease, filter 140ms ease",
    selectors: {
        "&:hover": {
            color: vars.color.text.heading,
            filter: "drop-shadow(0 4px 9px rgba(0, 0, 0, 0.86)) drop-shadow(0 0 7px rgba(255, 190, 94, 0.58))",
        },
        "&:focus-visible": {
            outline: `2px solid ${vars.color.border.focus}`,
            outlineOffset: "2px",
        },
    },
});

export const exodusPointerGlyph = style({
    width: 0,
    height: 0,
    borderLeft: "15px solid transparent",
    borderRight: "15px solid transparent",
    borderBottom: "34px solid currentColor",
    selectors: {
        [`${exodusPointer}:hover &`]: {
            transform: "translateY(-2px)",
        },
    },
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
    top: "max(8px, calc(var(--city-world-top-inset, 0px) + 8px))",
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
    left: "50%",
    zIndex: 2,
    transform: "translateX(-50%)",
    pointerEvents: "auto",
});

export const cameraControlsCity = style({
    top: "max(12px, calc(var(--city-world-top-inset, 0px) + 12px))",
});

export const cameraControlsBattle = style({
    bottom: "max(54px, calc(env(safe-area-inset-bottom, 0px) + 54px))",
});

export const cameraButton = style({
    width: "44px",
    height: "44px",
    display: "grid",
    placeItems: "center",
    padding: 0,
    border: 0,
    background: "transparent",
    color: vars.color.text.heading,
    opacity: 0.82,
    fontSize: 0,
    fontWeight: 900,
    lineHeight: 1,
    cursor: "pointer",
    filter: "drop-shadow(0 2px 5px rgba(0, 0, 0, 0.72)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.92))",
    selectors: {
        "&:hover": {
            opacity: 0.98,
        },
        "&:focus-visible": {
            outline: `2px solid ${vars.color.border.focus}`,
            outlineOffset: "2px",
        },
    },
});

export const cameraButtonUp = style({
    selectors: {
        "&::before": {
            content: "",
            width: 0,
            height: 0,
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderBottom: `22px solid ${vars.color.state.error}`,
        },
    },
});

export const cameraButtonDown = style({
    selectors: {
        "&::before": {
            content: "",
            width: 0,
            height: 0,
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderTop: `22px solid ${vars.color.brand.primary}`,
        },
    },
});

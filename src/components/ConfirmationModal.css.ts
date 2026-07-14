import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";
import * as hud from "../theme/hud.css.ts";

export const backdrop = style({
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    padding: '14px',
    background: vars.color.overlay.scrim,
    zIndex: 40,
});

export const dialog = style([
    hud.compactPanel,
    {
    width: 'min(420px, 100%)',
    display: 'grid',
    gap: '10px',
    padding: '12px',
    color: vars.color.text.primary,
    },
]);

export const title = style({
    margin: 0,
    color: vars.color.text.heading,
    fontSize: '1.05rem',
});

export const message = style({
    margin: 0,
    color: vars.color.text.primary,
    lineHeight: 1.45,
});

export const actions = style({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
});

export const secondaryButton = style([
    hud.secondaryButton,
    {
    padding: '5px 9px',
    },
]);

export const primaryButton = style([
    hud.button,
    {
    padding: '5px 9px',
    },
]);

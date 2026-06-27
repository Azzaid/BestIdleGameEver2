import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const backdrop = style({
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    padding: '14px',
    background: vars.color.overlay.scrim,
    zIndex: 40,
});

export const dialog = style({
    width: 'min(420px, 100%)',
    display: 'grid',
    gap: '10px',
    padding: '12px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 4,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.28)',
});

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

export const secondaryButton = style({
    padding: '5px 9px',
    borderRadius: 3,
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.app,
    color: vars.color.text.primary,
    cursor: 'pointer',
});

export const primaryButton = style({
    padding: '5px 9px',
    borderRadius: 3,
    border: `1px solid ${vars.color.border.selected}`,
    background: vars.color.brand.primary,
    color: vars.color.text.primary,
    cursor: 'pointer',
});

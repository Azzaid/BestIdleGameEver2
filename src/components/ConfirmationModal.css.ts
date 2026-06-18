import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const backdrop = style({
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    background: vars.color.overlay.scrim,
    zIndex: 40,
});

export const dialog = style({
    width: 'min(420px, 100%)',
    display: 'grid',
    gap: '14px',
    padding: '18px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 8,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.28)',
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
    padding: '7px 12px',
    borderRadius: 6,
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.app,
    color: vars.color.text.primary,
    cursor: 'pointer',
});

export const primaryButton = style({
    padding: '7px 12px',
    borderRadius: 6,
    border: `1px solid ${vars.color.border.selected}`,
    background: vars.color.brand.primary,
    color: vars.color.text.primary,
    cursor: 'pointer',
});

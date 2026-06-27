import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const controlGroup = style({
    display: "flex",
    alignItems: "center",
    gap: 6,
});

export const expandButton = style({
    padding: '5px 9px',
    borderRadius: 3,
    border: `1px solid ${vars.color.border.selected}`,
    background: vars.color.brand.primary,
    color: vars.color.text.primary,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    selectors: {
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.55,
        },
    },
});

export const exodusButton = style([
    expandButton,
    {
        borderColor: vars.color.state.warning,
        background: vars.color.background.surface,
        color: vars.color.text.heading,
    },
]);

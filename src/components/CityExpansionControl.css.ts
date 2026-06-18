import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const expandButton = style({
    padding: '7px 12px',
    borderRadius: 6,
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

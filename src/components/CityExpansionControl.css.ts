import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";
import * as hud from "../theme/hud.css.ts";

export const controlGroup = style({
    display: "flex",
    alignItems: "center",
    gap: 6,
});

export const expandButton = style([
    hud.button,
    {
    padding: '5px 9px',
    whiteSpace: 'nowrap',
    selectors: {
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.55,
        },
    },
    },
]);

export const exodusButton = style([
    hud.secondaryButton,
    {
        borderColor: vars.color.state.warning,
        color: vars.color.text.heading,
        whiteSpace: 'nowrap',
    },
]);

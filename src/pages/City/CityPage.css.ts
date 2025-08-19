import { style } from '@vanilla-extract/css';
import {vars} from "../../theme/theme.css.ts";

export const cityPage = style({
    display: 'flex',
    height: '100%',
    backgroundColor: vars.color.background.app
});

export const cityContainer = style({
    display: 'flex',
    flex: 1,
    marginBottom: '20px',
    maxWidth: '900px',
    maxHeight: '900px',
});

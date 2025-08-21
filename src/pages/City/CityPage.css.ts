import { style } from '@vanilla-extract/css';
import {vars} from "../../theme/theme.css.ts";

export const cityPage = style({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '12px',
    height: '100%',
    backgroundColor: vars.color.background.app
});

export const cityContainer = style({
    flex: '1 1 900px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '900px',
    aspectRatio:'1/1'     /* ensures square shape */
});

export const buildingSelectorContainer = style({
    flex: '1 1 240px',
    minWidth: '240px',
});
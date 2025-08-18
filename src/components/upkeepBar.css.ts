import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const upkeepBar = style({
    display: 'flex',
    height: '50px',
    padding: '3px',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: vars.color.background.navbar,
    color:vars.color.text.heading,
    gap: '20px',
});

export const vectorCard = style({
});

export const resourceEntry = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '5px',
});

export const resourceIcon = style({
    width: 16,
    height: 16,
    borderRadius: 4,
    objectFit: "cover",
    background: "transparent"
});

export const resourceText = style({});
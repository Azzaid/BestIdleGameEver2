import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const upkeepBar = style({
    display: 'flex',
    minHeight: '64px',
    padding: '6px 12px',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: vars.color.background.navbar,
    color:vars.color.text.heading,
    gap: '16px',
    alignItems: 'center',
    overflowX: 'auto',
});

export const vectorCard = style({
    display: 'grid',
    gap: '2px',
    flex: '0 0 auto',
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

export const traceMeter = style({
    display: 'grid',
    gap: '4px',
    minWidth: '240px',
    maxWidth: '420px',
    flex: '1 1 320px',
});

export const traceMeterHeader = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '0.78rem',
    lineHeight: 1,
});

export const traceMeterTitle = style({
    fontWeight: 700,
    textTransform: 'uppercase',
});

export const traceStageStable = style({
    color: vars.color.text.muted,
    fontWeight: 700,
});

export const traceStageBesieged = style({
    color: vars.color.state.error,
    fontWeight: 800,
});

export const traceTrack = style({
    position: 'relative',
    height: '12px',
    borderRadius: '999px',
    overflow: 'hidden',
    background: 'rgb(43 48 55 / 0.24)',
    border: `1px solid ${vars.color.border.default}`,
});

export const traceFill = style({
    position: 'absolute',
    top: 0,
    height: '100%',
    maxWidth: '100%',
    borderRadius: '999px',
    transition: 'left 180ms ease, width 180ms ease, background-color 180ms ease',
});

export const traceScarFill = style({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    maxWidth: '100%',
    borderRadius: '999px',
    background: 'rgb(112 118 128 / 0.9)',
    transition: 'width 180ms ease',
});

export const traceNumbers = style({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    color: vars.color.text.muted,
    fontSize: '0.75rem',
    lineHeight: 1,
});

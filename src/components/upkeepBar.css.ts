import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const upkeepBar = style({
    display: 'flex',
    minHeight: '46px',
    padding: '4px max(8px, env(safe-area-inset-right, 0px)) 4px max(8px, env(safe-area-inset-left, 0px))',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: vars.color.background.navbar,
    color: vars.color.text.heading,
    gap: '10px',
    alignItems: 'center',
    borderBottom: `1px solid ${vars.color.border.strong}`,
    overflow: 'visible',
    '@media': {
        '(max-width: 760px)': {
            minHeight: '42px',
            gap: '8px',
            padding: '4px max(6px, env(safe-area-inset-right, 0px)) 4px max(6px, env(safe-area-inset-left, 0px))',
            alignItems: 'stretch',
        },
        '(max-width: 520px)': {
            flexWrap: 'wrap',
            overflow: 'hidden',
        },
    },
});

export const rightSlot = style({
    marginLeft: 'auto',
    flex: '0 0 auto',
    '@media': {
        '(max-width: 520px)': {
            marginLeft: 0,
            width: '100%',
        },
    },
});

export const resourceGroup = style({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: '1 1 0',
    minWidth: 0,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    selectors: {
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    '@media': {
        '(max-width: 760px)': {
            gap: '8px',
        },
    },
});

export const rightGroup = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    flex: '1 1 0',
    minWidth: 0,
    '@media': {
        '(max-width: 760px)': {
            gap: '8px',
        },
        '(max-width: 520px)': {
            flexBasis: '100%',
        },
    },
});

export const vectorCard = style({
    display: 'grid',
    gap: '2px',
    flex: '0 0 auto',
    fontSize: '0.9rem',
    '@media': {
        '(max-width: 520px)': {
            fontSize: '0.86rem',
        },
    },
});

export const aetherMeterSlot = style({
    flex: '0 0 auto',
});

export const natureBalanceWrap = style({
    position: 'relative',
    flex: '0 0 65px',
    width: '65px',
    height: '65px',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    outline: 'none',
    selectors: {
        '&:focus-visible': {
            boxShadow: `0 0 0 3px ${vars.color.border.selected}`,
        },
    },
    '@media': {
        '(max-width: 520px)': {
            flexBasis: '65px',
            width: '65px',
            height: '65px',
        },
    },
});

export const natureBalanceSvg = style({
    width: '65px',
    height: '65px',
    display: 'block',
    overflow: 'visible',
    filter: 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.2))',
    '@media': {
        '(max-width: 520px)': {
            width: '65px',
            height: '65px',
        },
    },
});

export const natureBalanceAxis = style({
    stroke: 'rgba(210, 238, 218, 0.28)',
    strokeWidth: 1,
    strokeLinecap: 'round',
});

export const natureBalanceFrame = style({
    fill: 'transparent',
    stroke: 'transparent',
    strokeWidth: 0,
    vectorEffect: 'non-scaling-stroke',
});

export const natureBalanceShape = style({
    fill: 'rgba(64, 160, 96, 0.08)',
    stroke: 'rgba(77, 221, 129, 0.72)',
    strokeWidth: 1.5,
    vectorEffect: 'non-scaling-stroke',
    transition: 'd 180ms ease, fill 180ms ease, stroke 180ms ease',
});

export const natureTooltip = style({
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    minWidth: '180px',
    display: 'grid',
    gap: '6px',
    padding: '8px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 4,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.22)',
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translate(-50%, -4px)',
    transition: 'opacity 140ms ease, transform 140ms ease',
    zIndex: 10,
    selectors: {
        [`${natureBalanceWrap}:hover &`]: {
            opacity: 1,
            pointerEvents: 'auto',
            transform: 'translate(-50%, 0)',
        },
        [`${natureBalanceWrap}:focus-within &`]: {
            opacity: 1,
            pointerEvents: 'auto',
            transform: 'translate(-50%, 0)',
        },
    },
});

export const natureTooltipTitle = style({
    fontSize: '0.78rem',
    fontWeight: 800,
    color: vars.color.text.heading,
    textTransform: 'uppercase',
});

export const natureTooltipRow = style({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    fontSize: '0.85rem',
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

export const aetherOrbWrap = style({
    position: 'relative',
    width: '36px',
    height: '36px',
    border: 0,
    borderRadius: '50%',
    outline: 'none',
    selectors: {
        '&:focus-visible': {
            boxShadow: `0 0 0 3px ${vars.color.border.selected}`,
        },
    },
    '@media': {
        '(max-width: 520px)': {
            width: '34px',
            height: '34px',
        },
    },
});

export const aetherOrb = style({
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: `1px solid ${vars.color.border.default}`,
    boxShadow: `inset -5px -6px 9px rgba(0, 0, 0, 0.22), inset 4px 5px 9px rgba(255, 255, 255, 0.34), 0 3px 8px rgba(0, 0, 0, 0.2)`,
    '@media': {
        '(max-width: 520px)': {
            width: '34px',
            height: '34px',
        },
    },
});

export const aetherTooltip = style({
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    minWidth: '190px',
    display: 'grid',
    gap: '6px',
    padding: '8px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 4,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.22)',
    opacity: 0,
    transform: 'translate(-50%, -4px)',
    pointerEvents: 'none',
    transition: 'opacity 140ms ease, transform 140ms ease',
    zIndex: 10,
    selectors: {
        [`${aetherOrbWrap}:hover &`]: {
            opacity: 1,
            transform: 'translate(-50%, 0)',
            pointerEvents: 'auto',
        },
        [`${aetherOrbWrap}:focus &`]: {
            opacity: 1,
            transform: 'translate(-50%, 0)',
            pointerEvents: 'auto',
        },
        [`${aetherOrbWrap}:focus-within &`]: {
            opacity: 1,
            transform: 'translate(-50%, 0)',
            pointerEvents: 'auto',
        },
    },
});

export const aetherTooltipTitle = style({
    fontSize: '0.78rem',
    fontWeight: 800,
    color: vars.color.text.heading,
    textTransform: 'uppercase',
});

export const aetherTooltipRow = style({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    fontSize: '0.85rem',
});

export const signatureMeter = style({
    position: 'relative',
    flex: '0 0 clamp(220px, 30vw, 380px)',
    width: 'clamp(220px, 30vw, 380px)',
    maxWidth: 'calc(100vw - 24px)',
    display: 'grid',
    gap: '4px',
    '@media': {
        '(max-width: 760px)': {
            flex: '1 1 190px',
            width: 'auto',
            minWidth: '180px',
        },
        '(max-width: 520px)': {
            flexBasis: '100%',
            minWidth: 0,
        },
    },
});

export const signatureMeterTitle = style({
    textAlign: 'center',
    fontSize: '0.78rem',
    fontWeight: 700,
    lineHeight: 1,
});

export const signatureMeterTitleSiege = style([
    signatureMeterTitle,
    {
        color: vars.color.state.error,
        fontSize: '0.9rem',
        fontWeight: 900,
    },
]);

export const signatureTrack = style({
    height: '10px',
    borderRadius: '3px',
    overflow: 'hidden',
    background: 'rgb(43 48 55 / 0.24)',
    border: `1px solid ${vars.color.border.default}`,
});

export const signatureFill = style({
    height: '100%',
    maxWidth: '100%',
    borderRadius: '3px',
    transition: 'width 180ms ease, background-color 180ms ease',
});

export const signatureTooltip = style({
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    minWidth: '230px',
    display: 'grid',
    gap: '6px',
    padding: '8px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 4,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.22)',
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translate(-50%, -4px)',
    transition: 'opacity 140ms ease, transform 140ms ease',
    zIndex: 10,
    selectors: {
        [`${signatureMeter}:hover &`]: {
            opacity: 1,
            pointerEvents: 'auto',
            transform: 'translate(-50%, 0)',
        },
        [`${signatureMeter}:focus-within &`]: {
            opacity: 1,
            pointerEvents: 'auto',
            transform: 'translate(-50%, 0)',
        },
    },
});

export const signatureTooltipRow = style({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '18px',
    fontSize: '0.85rem',
});

import {keyframes, style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";
import * as hud from "../theme/hud.css.ts";

const siegeDangerPulse = keyframes({
    '0%, 100%': {
        boxShadow: '0 0 5px rgba(255, 42, 42, 0.55), 0 0 12px rgba(255, 42, 42, 0.28)',
        filter: 'brightness(1)',
    },
    '50%': {
        boxShadow: '0 0 10px rgba(255, 42, 42, 0.9), 0 0 24px rgba(255, 42, 42, 0.5)',
        filter: 'brightness(1.3)',
    },
});

export const upkeepBar = style([
    hud.compactPanel,
    {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '46px',
    padding: 0,
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    color: vars.color.text.heading,
    gap: 0,
    alignItems: 'stretch',
    borderBottom: 0,
    boxShadow: 'none',
    overflow: 'visible',
    selectors: {
        '&::before': {
            borderBottom: 0,
        },
    },
    '@media': {
        '(max-width: 760px)': {
            minHeight: '42px',
            alignItems: 'stretch',
        },
        '(max-width: 520px)': {
            overflow: 'hidden',
        },
    },
    },
]);

export const vectorCardFrame = hud.panelFrame;

export const resourceRow = style({
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '46px',
    padding: '4px max(8px, env(safe-area-inset-right, 0px)) 4px max(8px, env(safe-area-inset-left, 0px))',
    gap: '10px',
    alignItems: 'center',
    '@media': {
        '(max-width: 760px)': {
            minHeight: '42px',
            gap: '8px',
            padding: '4px max(6px, env(safe-area-inset-right, 0px)) 4px max(6px, env(safe-area-inset-left, 0px))',
            alignItems: 'stretch',
        },
        '(max-width: 520px)': {
            flexWrap: 'wrap',
        },
    },
});

export const headerSide = style({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: '1 1 0',
    minWidth: 0,
    '@media': {
        '(max-width: 760px)': {
            gap: '8px',
            alignItems: 'stretch',
        },
    },
});

export const siegeStatusSlot = style({
    flex: '0 0 clamp(88px, 12vw, 150px)',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    pointerEvents: 'none',
    '@media': {
        '(max-width: 520px)': {
            order: 3,
            flex: '1 1 100%',
            minHeight: '24px',
        },
    },
});

export const siegeStatusText = style({
    color: vars.color.state.error,
    fontSize: '0.9rem',
    fontWeight: 950,
    lineHeight: 1,
    letterSpacing: 0,
    textShadow: '0 0 10px rgba(255, 42, 42, 0.68), 0 0 18px rgba(255, 42, 42, 0.36)',
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

export const resourceGroupRight = style({
    justifyContent: 'flex-end',
});

export const rightGroup = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    minHeight: '30px',
    padding: '4px 7px',
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

export const natureBalanceIcon = style({
    filter: 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.72)) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.28))',
    pointerEvents: 'none',
});

export const natureTooltip = style([
    hud.panelFrame.nature,
    {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    minWidth: '180px',
    display: 'grid',
    gap: '6px',
    padding: '8px',
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
    },
]);

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

export const aetherTooltip = style([
    hud.panelFrame.aether,
    {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    minWidth: '190px',
    display: 'grid',
    gap: '6px',
    padding: '8px',
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
    },
]);

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
    height: '8px',
    width: '100%',
    outline: 'none',
    zIndex: 4,
    selectors: {
        '&:focus-visible': {
            boxShadow: `0 0 0 3px ${vars.color.border.selected}`,
        },
    },
});

export const signatureMeterSieged = style({});

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
    position: 'absolute',
    inset: 0,
    height: '8px',
    borderRadius: 0,
    overflow: 'hidden',
    background: 'rgb(43 48 55 / 0.32)',
    border: 0,
    selectors: {
        [`${signatureMeterSieged} &`]: {
            background: 'rgb(70 20 20 / 0.48)',
            boxShadow: '0 0 10px rgba(255, 42, 42, 0.24)',
        },
    },
});

export const signatureFill = style({
    position: 'absolute',
    top: 0,
    left: '50%',
    height: '100%',
    maxWidth: '100%',
    borderRadius: 0,
    transform: 'translateX(-50%)',
    transition: 'width 180ms ease, background-color 180ms ease, box-shadow 180ms ease',
});

export const signatureFillSieged = style({
    animation: `${siegeDangerPulse} 1.15s ease-in-out infinite`,
});

export const signatureTooltip = style([
    hud.compactPanel,
    {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    minWidth: '230px',
    display: 'grid',
    gap: '6px',
    padding: '8px',
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
    },
]);

export const signatureTooltipRow = style({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '18px',
    fontSize: '0.85rem',
});

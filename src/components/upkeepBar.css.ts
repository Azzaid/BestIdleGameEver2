import {style} from "@vanilla-extract/css";
import {vars} from "../theme/theme.css.ts";

export const upkeepBar = style({
    display: 'flex',
    minHeight: '64px',
    padding: '6px 12px',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: vars.color.background.navbar,
    color: vars.color.text.heading,
    gap: '16px',
    alignItems: 'center',
    overflow: 'visible',
});

export const rightSlot = style({
    marginLeft: 'auto',
    flex: '0 0 auto',
});

export const resourceGroup = style({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: '1 1 0',
    minWidth: 0,
    overflowX: 'auto',
});

export const rightGroup = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flex: '1 1 0',
    minWidth: 0,
});

export const vectorCard = style({
    display: 'grid',
    gap: '2px',
    flex: '0 0 auto',
});

export const aetherMeterSlot = style({
    flex: '0 0 auto',
});

export const natureBalanceWrap = style({
    position: 'relative',
    flex: '0 0 54px',
    width: '54px',
    height: '54px',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    outline: 'none',
    selectors: {
        '&:focus-visible': {
            boxShadow: `0 0 0 3px ${vars.color.border.selected}`,
        },
    },
});

export const natureBalanceSvg = style({
    width: '54px',
    height: '54px',
    display: 'block',
    overflow: 'visible',
    filter: 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.2))',
});

export const natureBalanceAxis = style({
    stroke: 'rgba(210, 238, 218, 0.28)',
    strokeWidth: 1,
    strokeLinecap: 'round',
});

export const natureBalanceFrame = style({
    fill: 'rgba(10, 28, 18, 0.18)',
    stroke: 'rgba(191, 226, 199, 0.44)',
    strokeWidth: 1.2,
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
    padding: '10px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 8,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.24)',
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
    width: '44px',
    height: '44px',
    border: 0,
    borderRadius: '50%',
    outline: 'none',
    selectors: {
        '&:focus-visible': {
            boxShadow: `0 0 0 3px ${vars.color.border.selected}`,
        },
    },
});

export const aetherOrb = style({
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: `1px solid ${vars.color.border.default}`,
    boxShadow: `inset -7px -8px 12px rgba(0, 0, 0, 0.2), inset 5px 6px 12px rgba(255, 255, 255, 0.42), 0 5px 14px rgba(0, 0, 0, 0.22)`,
});

export const aetherTooltip = style({
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    minWidth: '190px',
    display: 'grid',
    gap: '6px',
    padding: '10px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 8,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.24)',
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
    flex: '0 0 clamp(240px, 32vw, 420px)',
    width: 'clamp(240px, 32vw, 420px)',
    maxWidth: 'calc(100vw - 24px)',
    display: 'grid',
    gap: '4px',
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
    height: '12px',
    borderRadius: '999px',
    overflow: 'hidden',
    background: 'rgb(43 48 55 / 0.24)',
    border: `1px solid ${vars.color.border.default}`,
});

export const signatureFill = style({
    height: '100%',
    maxWidth: '100%',
    borderRadius: '999px',
    transition: 'width 180ms ease, background-color 180ms ease',
});

export const signatureTooltip = style({
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    minWidth: '230px',
    display: 'grid',
    gap: '6px',
    padding: '10px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 8,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.24)',
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

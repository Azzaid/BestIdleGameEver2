import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import {vars} from "../../theme/theme.css.ts";
import * as hud from "../../theme/hud.css.ts";

export const panelFrame = hud.panelFrame;

export const cityPage = style({
    position: 'relative',
    containerType: 'size',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: '6px',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    padding: '8px max(8px, env(safe-area-inset-right, 0px)) max(8px, env(safe-area-inset-bottom, 0px)) max(8px, env(safe-area-inset-left, 0px))',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    '@media': {
        '(max-width: 760px)': {
            display: 'block',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '6px max(6px, env(safe-area-inset-right, 0px)) max(8px, env(safe-area-inset-bottom, 0px)) max(6px, env(safe-area-inset-left, 0px))',
        },
    },
});

const cityModalButton = style([
    hud.compactPanel,
    {
        position: 'absolute',
        top: '8px',
        left: 'max(8px, env(safe-area-inset-left, 0px))',
        zIndex: 2,
        width: '42px',
        height: '42px',
        minHeight: '42px',
        display: 'grid',
        placeItems: 'center',
        padding: 0,
        borderColor: hud.hudBorder,
        background: `linear-gradient(145deg, ${hud.hudAccentSoft}, color-mix(in oklab, ${vars.color.background.surface} 74%, transparent))`,
        color: vars.color.text.heading,
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
        selectors: {
            '&:hover': {
                transform: 'translateY(-1px)',
                borderColor: hud.hudAccent,
                boxShadow: `0 0 18px color-mix(in oklab, ${hud.hudAccent} 30%, transparent), 0 8px 22px rgba(0, 0, 0, 0.2)`,
            },
            '&:focus-visible': {
                outline: `2px solid ${hud.hudAccent}`,
                outlineOffset: 2,
            },
        },
    },
]);

export const historyBookButton = style([
    cityModalButton,
    {
        top: '8px',
    },
]);

export const researchButton = style([
    cityModalButton,
    {
        top: '58px',
    },
]);

export const cityModalButtonIcon = style({
    width: '24px',
    height: '24px',
});

export const historyBookBadge = style({
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    minWidth: '18px',
    height: '18px',
    display: 'grid',
    placeItems: 'center',
    padding: '0 4px',
    border: `1px solid ${vars.color.background.surface}`,
    borderRadius: 999,
    background: vars.color.state.warning,
    color: vars.color.text.heading,
    fontSize: '0.64rem',
    fontWeight: 900,
    lineHeight: 1,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.24)',
});

export const globalEffectsShell = style({
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    pointerEvents: 'auto',
    width: 'min(420px, calc(100% - 36px))',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '32px 1fr',
    transition: 'transform 180ms ease',
    selectors: {
        '&[data-open="false"]': {
            transform: 'translateX(calc(100% - 32px))',
        },
    },
    '@media': {
        '(max-width: 760px)': {
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 44px)',
            bottom: 'max(8px, env(safe-area-inset-bottom, 0px))',
            height: 'auto',
            width: 'min(420px, calc(100% - 16px))',
        },
    },
});

export const globalEffectsToggle = style({
    width: '32px',
    height: '44px',
    alignSelf: 'start',
    border: `1px solid ${vars.color.border.default}`,
    borderRight: 0,
    borderRadius: '4px 0 0 4px',
    background: vars.color.background.surface,
    color: vars.color.text.heading,
    cursor: 'pointer',
    fontWeight: 700,
    selectors: {
        '&:hover': {
            borderColor: vars.color.border.selected,
        },
    },
});

export const globalEffectsPanel = style([
    hud.compactPanel,
    {
    display: 'grid',
    alignContent: 'start',
    gap: '8px',
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: '10px',
    scrollbarGutter: 'stable',
    },
]);

export const globalModifierList = style({
    display: 'grid',
    alignContent: 'start',
    gap: '6px',
});

export const globalModifierCard = style([
    hud.compactPanel,
    {
    display: 'grid',
    gap: '6px',
    padding: '7px',
    },
]);

export const globalModifierHeader = style({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '8px',
});

export const globalModifierTitle = style({
    margin: 0,
    color: vars.color.text.heading,
    fontSize: '0.86rem',
});

export const cityViewport = style({
    flex: '0 1 min(100cqw, 100cqh, 900px)',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '@media': {
        '(max-width: 760px)': {
            height: 'auto',
            margin: '0 auto 8px',
        },
    },
});

export const cityContainer = style({
    width: 'min(100cqw, 100cqh, 900px)',
    minWidth: 0,
    aspectRatio: '1 / 1',
    '@media': {
        '(max-width: 760px)': {
            width: 'min(100%, 78dvh)',
        },
    },
});

export const buildingSelectorContainer = style({
    position: 'relative',
    zIndex: 6,
    flex: '0 1 min(520px, 50cqw)',
    width: 'min(520px, 50cqw)',
    minWidth: 0,
    maxWidth: 'min(520px, 50cqw)',
    maxHeight: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: '8px',
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarGutter: 'stable',
    WebkitOverflowScrolling: 'touch',
    pointerEvents: 'auto',
    '@media': {
        '(max-width: 840px)': {
            flexBasis: 'min(520px, 100%)',
            width: 'min(520px, 100%)',
            maxWidth: '100%',
        },
        '(max-width: 760px)': {
            width: '100%',
            maxWidth: '100%',
            maxHeight: 'calc(100dvh - 96px)',
        },
    },
});

export const overlayControl = style({
    pointerEvents: 'auto',
});

export const towerEditorLayer = style({
    position: 'absolute',
    inset: 0,
    zIndex: 7,
    overflowY: 'auto',
    pointerEvents: 'auto',
    scrollbarGutter: 'stable',
    WebkitOverflowScrolling: 'touch',
});

export const selectionPanel = style({
    display: 'grid',
    gap: '8px',
    padding: '10px',
    '@media': {
        '(max-width: 520px)': {
            padding: '8px',
        },
    },
});

export const selectionHeader = style({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
});

export const selectedHexHeader = style({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(30px, 1fr)',
    alignItems: 'center',
    gap: '8px',
});

export const selectionTitle = style({
    margin: 0,
    minWidth: 0,
    fontSize: '1rem',
    color: vars.color.text.heading,
    overflowWrap: 'anywhere',
});

export const selectionCoordinates = style({
    flexShrink: 0,
    color: vars.color.text.muted,
    fontSize: '0.86rem',
});

export const selectedHexCoordinates = style({
    justifySelf: 'center',
    color: vars.color.text.muted,
    fontSize: '0.86rem',
    fontWeight: 700,
    lineHeight: 1,
});

export const selectionCloseButton = style({
    justifySelf: 'end',
    width: '28px',
    height: '28px',
    minHeight: '28px',
    display: 'grid',
    placeItems: 'center',
    padding: 0,
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: '3px',
    background: 'transparent',
    color: vars.color.text.muted,
    fontSize: '1.05rem',
    fontWeight: 800,
    lineHeight: 1,
    cursor: 'pointer',
    boxShadow: 'none',
    selectors: {
        '&:hover': {
            borderColor: vars.color.border.selected,
            background: vars.color.background.surfaceHover,
            color: vars.color.text.heading,
        },
        '&:focus-visible': {
            outline: `2px solid ${vars.color.border.focus}`,
            outlineOffset: '2px',
        },
    },
});

export const statSection = style({
    display: 'grid',
    gap: '6px',
    paddingTop: '6px',
    borderTop: `1px solid ${vars.color.border.default}`,
});

export const statHeading = style({
    margin: 0,
    fontSize: '0.9rem',
    color: vars.color.text.heading,
});

export const sideBySideStats = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
    '@media': {
        '(max-width: 520px)': {
            gridTemplateColumns: '1fr',
        },
    },
});

export const metricTitle = style({
    margin: '0 0 3px',
    fontSize: '0.86rem',
    color: vars.color.text.muted,
});

export const metricList = style({
    display: 'grid',
    gap: '4px',
    margin: 0,
});

export const metricRow = style({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
});

export const emptyStats = style({
    margin: 0,
    color: vars.color.text.muted,
});

export const panelDescription = style({
    margin: 0,
    color: vars.color.text.primary,
    lineHeight: 1.45,
});

export const multistructureStatus = style({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridAutoRows: 'max-content',
    alignContent: 'start',
    alignItems: 'start',
    gap: '8px',
    minHeight: 0,
    maxHeight: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    paddingRight: '2px',
    paddingBottom: '2px',
    scrollbarGutter: 'stable',
    WebkitOverflowScrolling: 'touch',
});

export const multistructureStatusLabel = style({
    color: vars.color.text.muted,
    fontSize: '0.78rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
});

export const structureListTitle = style({
    margin: '0 0 4px',
    color: vars.color.text.muted,
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
});

export const structureList = style({
    display: 'grid',
    gap: '2px',
    margin: 0,
    paddingLeft: '18px',
    color: vars.color.text.primary,
});

export const wallSelector = style({
    display: 'grid',
    gap: '8px',
    minHeight: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    paddingRight: '2px',
    scrollbarGutter: 'stable',
    WebkitOverflowScrolling: 'touch',
});

export const wallCategory = style({
    display: 'grid',
    gap: '6px',
});

export const wallCategoryTitle = style({
    margin: 0,
    color: vars.color.text.heading,
    fontSize: '1rem',
});

export const wallTopTabs = style({
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
});

export const wallTopTabButton = styleVariants({
    active: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: 999,
        border: `1px solid ${vars.color.border.selected}`,
        background: vars.color.background.surface,
        color: vars.color.text.heading,
        fontSize: '0.92rem',
        cursor: 'pointer',
    },
    regular: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: 999,
        border: `1px solid ${vars.color.border.default}`,
        background: 'transparent',
        color: vars.color.text.primary,
        fontSize: '0.92rem',
        cursor: 'pointer',
        selectors: {
            '&:hover': {
                background: vars.color.background.surfaceHover,
            },
        },
    },
});

export const wallTopTabLabel = style({
    lineHeight: 1,
});

export const wallTopTabCount = style({
    fontSize: '0.78rem',
    color: vars.color.text.muted,
});

export const wallCardList = style({
    display: 'grid',
    gap: '6px',
});

export const wallCard = style({
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '8px',
    alignItems: 'start',
    padding: '8px',
    color: vars.color.text.primary,
    '@media': {
        '(max-width: 520px)': {
            gridTemplateColumns: '1fr',
        },
    },
});

export const wallCardTitle = style({
    margin: '0 0 5px',
    color: vars.color.text.heading,
    fontSize: '0.95rem',
});

export const wallBuildButton = style([
    hud.button,
    {
    padding: '5px 9px',
    selectors: {
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.55,
        },
    },
    },
]);

const towerEditPulse = keyframes({
    '0%, 100%': {
        outlineOffset: '0px',
        transform: 'scale(1)',
        boxShadow: `0 0 0 0 color-mix(in oklab, ${vars.color.state.warning} 42%, transparent), 0 0 14px color-mix(in oklab, ${vars.color.state.warning} 20%, transparent)`,
        filter: 'brightness(1)',
    },
    '50%': {
        outlineOffset: '4px',
        transform: 'scale(1.035)',
        boxShadow: `0 0 0 5px color-mix(in oklab, ${vars.color.state.warning} 12%, transparent), 0 0 26px color-mix(in oklab, ${vars.color.state.warning} 52%, transparent)`,
        filter: 'brightness(1.12)',
    },
});

export const highlightedTowerEditButton = style({
    borderColor: vars.color.state.warning,
    background: `linear-gradient(145deg, color-mix(in oklab, ${vars.color.state.warning} 30%, ${vars.color.background.surface}), ${vars.color.background.surface})`,
    color: vars.color.text.heading,
    outline: `2px solid color-mix(in oklab, ${vars.color.state.warning} 74%, transparent)`,
    outlineOffset: 0,
    animation: `${towerEditPulse} 1.45s ease-in-out infinite`,
    transformOrigin: 'center',
    selectors: {
        '&:hover': {
            borderColor: vars.color.text.heading,
            boxShadow: `0 0 24px color-mix(in oklab, ${vars.color.state.warning} 48%, transparent)`,
        },
    },
});

export const demolishButton = style([
    hud.secondaryButton,
    {
    justifySelf: 'start',
    padding: '5px 9px',
    selectors: {
        '&:hover': {
            borderColor: vars.color.state.error,
            color: vars.color.state.error,
        },
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.55,
        },
    },
    },
]);

export const buildingLockedNote = style([
    hud.compactPanel,
    {
    margin: 0,
    padding: '8px',
    color: vars.color.text.muted,
    lineHeight: 1.4,
    },
]);

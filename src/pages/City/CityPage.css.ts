import { style, styleVariants } from '@vanilla-extract/css';
import {vars} from "../../theme/theme.css.ts";

export const cityPage = style({
    position: 'relative',
    containerType: 'size',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '6px',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    padding: '0 max(0px, env(safe-area-inset-right, 0px)) max(0px, env(safe-area-inset-bottom, 0px)) max(0px, env(safe-area-inset-left, 0px))',
    backgroundColor: vars.color.background.app,
    '@media': {
        '(max-width: 760px)': {
            display: 'block',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '6px max(6px, env(safe-area-inset-right, 0px)) max(8px, env(safe-area-inset-bottom, 0px)) max(6px, env(safe-area-inset-left, 0px))',
        },
    },
});

export const globalEffectsShell = style({
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 5,
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

export const globalEffectsPanel = style({
    display: 'grid',
    alignContent: 'start',
    gap: '8px',
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: '10px',
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    borderRadius: '4px 0 0 4px',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.24)',
    scrollbarGutter: 'stable',
});

export const globalModifierList = style({
    display: 'grid',
    alignContent: 'start',
    gap: '6px',
});

export const globalModifierCard = style({
    display: 'grid',
    gap: '6px',
    padding: '7px',
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.app,
    borderRadius: 4,
});

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
    flex: '1 1 220px',
    minWidth: '220px',
    maxHeight: '100%',
    minHeight: 0,
    display: 'grid',
    gap: '8px',
    overflowY: 'auto',
    scrollbarGutter: 'stable',
    '@media': {
        '(max-width: 760px)': {
            minWidth: 0,
            maxHeight: 'none',
            overflowY: 'visible',
        },
    },
});

export const selectionPanel = style({
    display: 'grid',
    gap: '8px',
    padding: '10px',
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    borderRadius: 4,
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

export const selectionTitle = style({
    margin: 0,
    fontSize: '1rem',
    color: vars.color.text.heading,
});

export const selectionCoordinates = style({
    flexShrink: 0,
    color: vars.color.text.muted,
    fontSize: '0.86rem',
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
    gap: '8px',
});

export const multistructureCandidate = style({
    display: 'grid',
    gap: '6px',
    padding: '7px',
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.app,
    borderRadius: 4,
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
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.surface,
    borderRadius: 4,
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

export const wallBuildButton = style({
    padding: '5px 9px',
    borderRadius: 3,
    border: `1px solid ${vars.color.border.selected}`,
    background: vars.color.brand.primary,
    color: vars.color.text.primary,
    cursor: 'pointer',
    selectors: {
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.55,
        },
    },
});

export const demolishButton = style({
    justifySelf: 'start',
    padding: '5px 9px',
    borderRadius: 3,
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.app,
    color: vars.color.text.primary,
    cursor: 'pointer',
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
});

export const buildingLockedNote = style({
    margin: 0,
    padding: '8px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 4,
    background: vars.color.background.surface,
    color: vars.color.text.muted,
    lineHeight: 1.4,
});

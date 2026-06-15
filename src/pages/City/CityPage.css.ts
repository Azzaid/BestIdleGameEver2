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
    display: 'grid',
    gap: '12px',
});

export const selectionPanel = style({
    display: 'grid',
    gap: '12px',
    padding: '16px',
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    borderRadius: 8,
});

export const selectionHeader = style({
    display: 'grid',
    gap: '4px',
});

export const selectionEyebrow = style({
    color: vars.color.text.muted,
    fontSize: '0.78rem',
    textTransform: 'uppercase',
});

export const selectionTitle = style({
    margin: 0,
    fontSize: '1.2rem',
    color: vars.color.text.heading,
});

export const statSection = style({
    display: 'grid',
    gap: '10px',
    paddingTop: '10px',
    borderTop: `1px solid ${vars.color.border.default}`,
});

export const statHeading = style({
    margin: 0,
    fontSize: '1rem',
    color: vars.color.text.heading,
});

export const metricTitle = style({
    margin: '0 0 6px',
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
    gap: '12px',
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

export const effectList = style({
    display: 'grid',
    gap: '6px',
    margin: 0,
    paddingLeft: '18px',
});

export const multistructureStatus = style({
    display: 'grid',
    gap: '8px',
});

export const multistructureCandidate = style({
    display: 'grid',
    gap: '8px',
    padding: '10px',
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.app,
    borderRadius: 8,
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
    gap: '12px',
});

export const wallCategory = style({
    display: 'grid',
    gap: '8px',
});

export const wallCategoryTitle = style({
    margin: 0,
    color: vars.color.text.heading,
    fontSize: '1rem',
});

export const wallCardList = style({
    display: 'grid',
    gap: '8px',
});

export const wallCard = style({
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '12px',
    alignItems: 'start',
    padding: '12px',
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.surface,
    borderRadius: 8,
    color: vars.color.text.primary,
});

export const wallCardTitle = style({
    margin: '0 0 8px',
    color: vars.color.text.heading,
    fontSize: '0.95rem',
});

export const wallBuildButton = style({
    padding: '6px 12px',
    borderRadius: 6,
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
    padding: '6px 12px',
    borderRadius: 6,
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
    padding: '12px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: 8,
    background: vars.color.background.surface,
    color: vars.color.text.muted,
    lineHeight: 1.4,
});

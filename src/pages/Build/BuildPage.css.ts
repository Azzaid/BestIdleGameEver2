import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';

export const buildPage = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '24px',
});

export const pageHeader = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '16px',
});

export const pageTitle = style({
  margin: 0,
  fontSize: '32px',
});

export const pageSubtitle = style({
  margin: '6px 0 0',
  maxWidth: '720px',
  color: vars.color.text.primary,
  opacity: 0.78,
});

export const assemblyGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
  gap: '20px',
  alignItems: 'stretch',
  '@media': {
    '(max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const towerPreview = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(240px, 0.8fr) minmax(260px, 1fr)',
  gap: '16px',
  minHeight: '340px',
  padding: '16px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '8px',
  backgroundColor: vars.color.background.surface,
  '@media': {
    '(max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const towerImage = style({
  position: 'relative',
  minHeight: '280px',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '8px',
  background: `linear-gradient(180deg, ${vars.color.background.surface}, ${vars.color.background.surfaceHover})`,
});

export const slotList = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '8px',
});

export const slotButton = style({
  display: 'grid',
  gridTemplateColumns: '130px minmax(0, 1fr)',
  gap: '12px',
  alignItems: 'center',
  minHeight: '48px',
  padding: '10px 12px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
  textAlign: 'left',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      borderColor: vars.color.brand.primary,
    },
  },
  '@media': {
    '(max-width: 520px)': {
      gridTemplateColumns: '1fr',
      gap: '4px',
    },
  },
});

export const slotButtonActive = style({
  borderColor: vars.color.brand.primary,
  backgroundColor: vars.color.state.selectedBg,
});

export const slotLabel = style({
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
});

export const slotPartName = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const towerStats = style({
  padding: '16px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '8px',
  backgroundColor: vars.color.background.surface,
});

export const panelTitle = style({
  margin: 0,
  fontSize: '20px',
});

export const panelSubtitle = style({
  margin: '4px 0 0',
  color: vars.color.text.primary,
  opacity: 0.72,
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
  gap: '8px',
  marginTop: '14px',
});

export const statItem = style({
  minHeight: '64px',
  padding: '10px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
});

export const statLabel = style({
  display: 'block',
  fontSize: '12px',
  opacity: 0.7,
});

export const statValue = style({
  display: 'block',
  marginTop: '4px',
  fontSize: '16px',
});

export const summaryBlock = style({
  marginTop: '16px',
});

export const summaryTitle = style({
  margin: '0 0 8px',
  fontSize: '15px',
});

export const inlineList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
});

export const costPill = style({
  padding: '4px 8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '999px',
  fontSize: '12px',
});

export const missingCostPill = style({
  padding: '4px 8px',
  border: `1px solid ${vars.color.state.error}`,
  borderRadius: '999px',
  color: vars.color.state.error,
  fontSize: '12px',
  fontWeight: 700,
});

export const emptyText = style({
  color: vars.color.text.primary,
  opacity: 0.65,
});

export const synergyList = style({
  display: 'grid',
  gap: '8px',
});

export const synergyItem = style({
  display: 'grid',
  gap: '3px',
  padding: '8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.state.selectedBg,
});

export const warningList = style({
  display: 'grid',
  gap: '6px',
});

export const warningItem = style({
  padding: '7px 8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  color: vars.color.text.primary,
  backgroundColor: vars.color.state.selectedBg,
});

export const partsPanel = style({
  padding: '16px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '8px',
  backgroundColor: vars.color.background.surface,
});

export const partsHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '12px',
  flexWrap: 'wrap',
});

export const columnChooser = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
});

export const columnToggle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
});

export const tableContainer = style({
  maxHeight: '420px',
  overflow: 'auto',
});

export const partsTable = style({
  width: '100%',
  minWidth: '940px',
  borderCollapse: 'separate',
  borderSpacing: '0 8px',
});

export const tableHead = style({});

export const tableHeaderCell = style({
  padding: '8px 10px',
  textAlign: 'left',
  fontSize: '13px',
  color: vars.color.text.primary,
});

export const headerContent = style({
  display: 'grid',
  gap: '6px',
});

export const filterInput = style({
  width: '100%',
  minWidth: 0,
  padding: '6px 8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
});

export const tableRow = style({
  backgroundColor: vars.color.background.surface,
});

export const tableCell = style({
  padding: '10px',
  borderTop: `1px solid ${vars.color.border.default}`,
  borderBottom: `1px solid ${vars.color.border.default}`,
  fontSize: '14px',
  selectors: {
    '&:first-child': {
      borderLeft: `1px solid ${vars.color.border.default}`,
      borderTopLeftRadius: '6px',
      borderBottomLeftRadius: '6px',
    },
    '&:last-child': {
      borderRight: `1px solid ${vars.color.border.default}`,
      borderTopRightRadius: '6px',
      borderBottomRightRadius: '6px',
    },
  },
});

export const selectedRow = style({
  outline: `2px solid ${vars.color.brand.primary}`,
});

export const partNameCell = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
});

export const keywords = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '5px',
});

export const keyword = style({
  padding: '3px 7px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '999px',
  fontSize: '12px',
  backgroundColor: vars.color.state.selectedBg,
});

export const installButton = style({
  minWidth: '78px',
  padding: '7px 10px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.brand.primary,
  color: vars.color.text.inverse,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
  },
});

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

export const towerSelector = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: '8px',
  '@media': {
    '(max-width: 760px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
});

export const towerSelectorButton = style({
  display: 'grid',
  gap: '4px',
  minHeight: '54px',
  padding: '9px 10px',
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
});

export const towerSelectorButtonActive = style({
  borderColor: vars.color.brand.primary,
  backgroundColor: vars.color.state.selectedBg,
});

export const towerSelectorName = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.text.heading,
  fontWeight: 800,
});

export const towerSelectorStatus = style({
  color: vars.color.text.muted,
  fontSize: '0.78rem',
  fontWeight: 700,
  textTransform: 'uppercase',
});

export const towerPreview = style({
  display: 'block',
  minHeight: '340px',
  padding: '16px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '8px',
  backgroundColor: vars.color.background.surface,
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
  gap: '3px',
  minHeight: '48px',
  padding: '8px 10px',
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
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '8px',
  backgroundColor: vars.color.background.surface,
});

export const slotStrip = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: '8px',
  padding: '10px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '8px',
  backgroundColor: vars.color.background.surface,
  '@media': {
    '(max-width: 1000px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    '(max-width: 640px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
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

export const statsActions = style({
  display: 'flex',
  gap: '10px',
  marginTop: 'auto',
  paddingTop: '18px',
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
  maxHeight: '360px',
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

export const removeButton = style({
  minWidth: '78px',
  padding: '7px 10px',
  border: `1px solid ${vars.color.state.error}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  color: vars.color.state.error,
  cursor: 'pointer',
  fontWeight: 700,
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
  },
});

export const rebuildButton = style({
  flex: 1,
  minHeight: '40px',
  padding: '8px 12px',
  border: `1px solid ${vars.color.brand.primary}`,
  borderRadius: '6px',
  backgroundColor: vars.color.brand.primary,
  color: vars.color.text.inverse,
  fontWeight: 700,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
  },
});

export const cancelButton = style({
  flex: 1,
  minHeight: '40px',
  padding: '8px 12px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
  },
});

export const paginationBar = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginTop: '12px',
  flexWrap: 'wrap',
});

export const paginationControls = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const paginationButton = style({
  minHeight: '34px',
  padding: '6px 10px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const paginationSummary = style({
  fontSize: '13px',
  color: vars.color.text.primary,
  opacity: 0.75,
});

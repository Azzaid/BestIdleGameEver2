import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';

export const buildPage = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  maxWidth: '1280px',
  margin: '0 auto',
});

export const assemblyPanel = style({
  overflow: 'hidden',
});

export const towerSelector = style({
  display: 'flex',
  gap: '2px',
  overflowX: 'auto',
  padding: '6px 8px 0',
});

export const towerSelectorButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: '180px',
  minHeight: '32px',
  padding: '6px 12px',
  border: `1px solid ${vars.color.border.default}`,
  borderBottom: 0,
  borderRadius: '6px 6px 0 0',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      borderColor: vars.color.brand.primary,
    },
  },
});

export const towerSelectorButtonActive = style({
  borderColor: vars.color.brand.primary,
  backgroundColor: vars.color.state.selectedBg,
  color: vars.color.text.heading,
});

export const towerSelectorName = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '13px',
  fontWeight: 700,
});

export const assemblyGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(260px, 1fr) minmax(0, 2fr)',
    backgroundColor: vars.color.background.surface,
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: '8px',
  gap: 0,
  alignItems: 'stretch',
  '@media': {
    '(max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const towerPreview = style({
  display: 'flex',
  minHeight: '340px',
  borderRight: `1px solid ${vars.color.border.default}`,
  '@media': {
    '(max-width: 900px)': {
      borderRight: 0,
      borderBottom: `1px solid ${vars.color.border.default}`,
    },
  },
});

export const towerImage = style({
  flex: 1,
  position: 'relative',
  minHeight: '340px',
  overflow: 'hidden',
  borderRadius: '8px',
  background: `linear-gradient(180deg, ${vars.color.background.surface}, ${vars.color.background.surfaceHover})`,
});

export const slotButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '30px',
  padding: '5px 10px',
  border: `1px solid ${vars.color.border.default}`,
  borderBottom: 0,
  borderRadius: '6px 6px 0 0',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      borderColor: vars.color.brand.primary,
    },
  },
});

export const slotButtonActive = style({
  borderColor: vars.color.brand.primary,
  backgroundColor: vars.color.state.selectedBg,
  color: vars.color.text.heading,
});

export const slotLabel = style({
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
});

export const towerStats = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
    borderRadius: '8px',
  backgroundColor: vars.color.background.surface,
});

export const slotStrip = style({
  display: 'flex',
  gap: '2px',
  position: 'relative',
  overflow: 'visible',
  padding: '6px 8px 0',
});

export const panelTitle = style({
  margin: 0,
  fontSize: '20px',
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

export const statsActionsCentered = style({
  justifyContent: 'center',
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
  overflow: 'hidden',
});

export const columnDropdown = style({
  position: 'relative',
  marginLeft: 'auto',
  flex: '0 0 auto',
});

export const columnDropdownSummary = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  minHeight: '30px',
  padding: '5px 9px',
  border: `1px solid ${vars.color.border.default}`,
  borderBottom: 0,
  borderRadius: '6px 6px 0 0',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
  fontSize: '13px',
  cursor: 'pointer',
  listStyle: 'none',
  selectors: {
    '&::marker': {
      content: '',
    },
    '&::-webkit-details-marker': {
      display: 'none',
    },
    '&:hover': {
      borderColor: vars.color.brand.primary,
    },
  },
});

export const columnDropdownMenu = style({
  position: 'absolute',
  top: 'calc(100% + 1px)',
  right: 0,
  zIndex: 10,
  display: 'grid',
  gap: '8px',
  minWidth: '180px',
  padding: '10px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)',
});

export const gearIcon = style({
  lineHeight: 1,
  fontSize: '15px',
});

export const columnToggle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  whiteSpace: 'nowrap',
});

export const tableContainer = style({
  maxHeight: '360px',
  overflow: 'auto',
  padding: '0 16px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: '8px',
    backgroundColor: vars.color.background.surface,
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

export const clearHeaderButton = style({
  minHeight: '28px',
  padding: '4px 9px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: 'pointer',
  textTransform: 'lowercase',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
  },
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

export const buildButtonCentered = style({
  flex: '0 1 180px',
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
  padding: '12px 16px 16px',
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

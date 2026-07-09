import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';

export const buildPage = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '10px max(10px, env(safe-area-inset-right, 0px)) max(10px, env(safe-area-inset-bottom, 0px)) max(10px, env(safe-area-inset-left, 0px))',
  '@media': {
    '(max-width: 700px)': {
      gap: '8px',
      padding: '6px max(6px, env(safe-area-inset-right, 0px)) max(10px, env(safe-area-inset-bottom, 0px)) max(6px, env(safe-area-inset-left, 0px))',
    },
  },
});

export const assemblyPanel = style({
  overflow: 'hidden',
});

export const towerSelector = style({
  display: 'flex',
  gap: '2px',
  overflowX: 'auto',
  padding: '4px 6px 0',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const towerSelectorButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: '180px',
  minHeight: '28px',
  padding: '4px 9px',
  border: `1px solid ${vars.color.border.default}`,
  borderBottom: 0,
  borderRadius: '4px 4px 0 0',
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
    borderRadius: '4px',
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
  minHeight: '300px',
  borderRight: `1px solid ${vars.color.border.default}`,
  '@media': {
    '(max-width: 900px)': {
      borderRight: 0,
      borderBottom: `1px solid ${vars.color.border.default}`,
    },
    '(max-width: 700px)': {
      minHeight: '220px',
    },
  },
});

export const towerImage = style({
  flex: 1,
  position: 'relative',
  minHeight: '300px',
  overflow: 'hidden',
  borderRadius: '4px',
  background: `linear-gradient(180deg, ${vars.color.background.surface}, ${vars.color.background.surfaceHover})`,
  '@media': {
    '(max-width: 700px)': {
      minHeight: '220px',
    },
  },
});

export const slotButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '26px',
  padding: '4px 8px',
  border: `1px solid ${vars.color.border.default}`,
  borderBottom: 0,
  borderRadius: '4px 4px 0 0',
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
  padding: '10px',
    borderRadius: '4px',
  backgroundColor: vars.color.background.surface,
  '@media': {
    '(max-width: 700px)': {
      padding: '8px',
    },
  },
});

export const slotStrip = style({
  display: 'flex',
  gap: '2px',
  position: 'relative',
  overflowX: 'auto',
  padding: '4px 6px 0',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const panelTitle = style({
  margin: 0,
  fontSize: '16px',
});

export const weightCapacityPanel = style({
  display: 'grid',
  gap: '6px',
  marginTop: '8px',
  padding: '8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
  backgroundColor: vars.color.state.selectedBg,
});

export const weightCapacityPanelOver = style({
  borderColor: vars.color.state.error,
});

export const weightCapacityHeader = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '8px',
});

export const weightCapacityLabel = style({
  minWidth: 0,
  color: vars.color.text.primary,
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
});

export const weightCapacityValue = style({
  flex: '0 0 auto',
  color: vars.color.text.heading,
  fontSize: '13px',
});

export const weightCapacityTrack = style({
  position: 'relative',
  height: '9px',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
  backgroundColor: vars.color.background.surface,
});

export const weightCapacityFill = style({
  position: 'absolute',
  inset: '0 auto 0 0',
  maxWidth: '100%',
  borderRadius: '4px',
  backgroundColor: vars.color.brand.primary,
});

export const weightCapacityFillOver = style({
  backgroundColor: vars.color.state.error,
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
  gap: '6px',
  marginTop: '8px',
});

export const statItem = style({
  minHeight: '48px',
  padding: '7px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
});

export const statLabel = style({
  display: 'block',
  fontSize: '12px',
  opacity: 0.7,
});

export const statValue = style({
  display: 'block',
  marginTop: '2px',
  fontSize: '14px',
});

export const summaryBlock = style({
  marginTop: '10px',
});

export const statsActions = style({
  display: 'flex',
  gap: '6px',
  marginTop: 'auto',
  paddingTop: '10px',
  '@media': {
    '(max-width: 520px)': {
      flexDirection: 'column',
    },
  },
});

export const statsActionsCentered = style({
  justifyContent: 'center',
});

export const summaryTitle = style({
  margin: '0 0 5px',
  fontSize: '13px',
});

export const inlineList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
});

export const costPill = style({
  padding: '2px 6px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '3px',
  fontSize: '12px',
});

export const missingCostPill = style({
  padding: '2px 6px',
  border: `1px solid ${vars.color.state.error}`,
  borderRadius: '3px',
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
  gap: '5px',
});

export const synergyItem = style({
  display: 'grid',
  gap: '3px',
  padding: '6px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
  backgroundColor: vars.color.state.selectedBg,
});

export const warningList = style({
  display: 'grid',
  gap: '4px',
});

export const warningItem = style({
  padding: '5px 7px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
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
  minHeight: '26px',
  padding: '4px 7px',
  border: `1px solid ${vars.color.border.default}`,
  borderBottom: 0,
  borderRadius: '4px 4px 0 0',
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
  gap: '6px',
  minWidth: '180px',
  padding: '8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
  backgroundColor: vars.color.background.surface,
  boxShadow: '0 8px 18px rgba(0, 0, 0, 0.18)',
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
  padding: '0 6px',
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: '4px',
    backgroundColor: vars.color.background.surface,
  WebkitOverflowScrolling: 'touch',
  '@media': {
    '(max-width: 700px)': {
      padding: '0 4px',
    },
  },
});

export const partsTable = style({
  width: '100%',
  minWidth: '780px',
  borderCollapse: 'separate',
  borderSpacing: '0 3px',
  '@media': {
    '(max-width: 700px)': {
      minWidth: '560px',
    },
  },
});

export const tableHead = style({});

export const tableHeaderCell = style({
  padding: '4px 6px',
  textAlign: 'left',
  fontSize: '12px',
  color: vars.color.text.primary,
});

export const weightHeaderCell = style({
  width: '58px',
  textAlign: 'center',
});

export const clearHeaderButton = style({
  minHeight: '24px',
  padding: '3px 7px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '3px',
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
  gap: '4px',
});

export const tableRow = style({
  backgroundColor: vars.color.background.surface,
  cursor: 'pointer',
});

export const tableCell = style({
  padding: '5px 6px',
  borderTop: `1px solid ${vars.color.border.default}`,
  borderBottom: `1px solid ${vars.color.border.default}`,
  fontSize: '13px',
  verticalAlign: 'top',
  selectors: {
    '&:first-child': {
      borderLeft: `1px solid ${vars.color.border.default}`,
      borderTopLeftRadius: '3px',
      borderBottomLeftRadius: '3px',
    },
    '&:last-child': {
      borderRight: `1px solid ${vars.color.border.default}`,
      borderTopRightRadius: '3px',
      borderBottomRightRadius: '3px',
    },
  },
  '@media': {
    '(max-width: 700px)': {
      padding: '4px 5px',
      fontSize: '12px',
    },
  },
});

export const weightCell = style({
  width: '58px',
  textAlign: 'center',
});

export const weightValue = style({
  display: 'inline-block',
  minWidth: '2ch',
  textAlign: 'center',
});

export const selectedRow = style({
  outline: `2px solid ${vars.color.brand.primary}`,
});

export const partNameCell = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexWrap: 'wrap',
});

export const keywords = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
});

export const keyword = style({
  padding: '1px 5px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '3px',
  fontSize: '12px',
  backgroundColor: vars.color.state.selectedBg,
});

export const modifierRows = style({
  display: 'grid',
  gap: '3px',
});

export const modifierRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(88px, 1fr) max-content',
  gap: '8px',
  alignItems: 'baseline',
  whiteSpace: 'nowrap',
});

export const installButton = style({
  minWidth: '78px',
  padding: '4px 7px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '3px',
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
  padding: '4px 7px',
  border: `1px solid ${vars.color.state.error}`,
  borderRadius: '3px',
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
  minHeight: '32px',
  padding: '6px 10px',
  border: `1px solid ${vars.color.brand.primary}`,
  borderRadius: '3px',
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

export const compactActionButton = style({
  minWidth: '28px',
  width: '28px',
  minHeight: '28px',
  padding: 0,
  fontSize: '18px',
  lineHeight: 1,
  fontWeight: 800,
});

export const buildButtonCentered = style({
  flex: '0 1 180px',
});

export const cancelButton = style({
  flex: 1,
  minHeight: '32px',
  padding: '6px 10px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '3px',
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
  gap: '8px',
  padding: '8px 10px 10px',
  flexWrap: 'wrap',
});

export const paginationControls = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const paginationButton = style({
  minHeight: '28px',
  padding: '4px 8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '3px',
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

export const partDetailsShade = style({
  position: 'fixed',
  inset: 0,
  zIndex: 40,
  pointerEvents: 'none',
  backgroundColor: 'rgba(0, 0, 0, 0)',
  transition: 'background-color 160ms ease',
});

export const partDetailsShadeOpen = style({
  pointerEvents: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.28)',
});

export const partDetailsSheet = style({
  position: 'fixed',
  left: '50%',
  bottom: 0,
  zIndex: 41,
  display: 'grid',
  gap: '10px',
  width: 'min(760px, calc(100vw - 20px))',
  maxHeight: 'min(76vh, 620px)',
  overflowY: 'auto',
  padding: '12px',
  border: `1px solid ${vars.color.border.default}`,
  borderBottom: 0,
  borderRadius: '8px 8px 0 0',
  backgroundColor: vars.color.background.surface,
  boxShadow: '0 -14px 32px rgba(0, 0, 0, 0.24)',
  transform: 'translate(-50%, calc(100% + 18px))',
  transition: 'transform 190ms ease',
  pointerEvents: 'none',
  '@media': {
    '(max-width: 700px)': {
      width: '100vw',
      maxHeight: '82vh',
      padding: '10px',
      borderLeft: 0,
      borderRight: 0,
    },
  },
});

export const partDetailsSheetOpen = style({
  transform: 'translate(-50%, 0)',
  pointerEvents: 'auto',
});

export const partDetailsHeader = style({
  display: 'grid',
  gridTemplateColumns: '92px minmax(0, 1fr) max-content',
  gap: '10px',
  alignItems: 'start',
  '@media': {
    '(max-width: 520px)': {
      gridTemplateColumns: '70px minmax(0, 1fr) max-content',
    },
  },
});

export const partPreviewFrame = style({
  display: 'grid',
  placeItems: 'center',
  width: '92px',
  height: '72px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
  backgroundColor: vars.color.background.surfaceHover,
  overflow: 'hidden',
  '@media': {
    '(max-width: 520px)': {
      width: '70px',
      height: '58px',
    },
  },
});

export const partPreviewImage = style({
  maxWidth: '88%',
  maxHeight: '88%',
  objectFit: 'contain',
});

export const partDetailsIntro = style({
  minWidth: 0,
});

export const partVectorLabel = style({
  display: 'inline-block',
  marginBottom: '3px',
  color: vars.color.text.primary,
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  opacity: 0.72,
});

export const partDetailsTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: '18px',
});

export const partDetailsDescription = style({
  margin: '4px 0 0',
  color: vars.color.text.primary,
  fontSize: '13px',
  lineHeight: 1.35,
});

export const partDetailsCloseButton = style({
  width: '28px',
  height: '28px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '3px',
  backgroundColor: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: 'pointer',
});

export const partDetailsSection = style({
  display: 'grid',
  gap: '6px',
});

export const valueList = style({
  display: 'grid',
  gap: '4px',
});

export const valueRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) max-content',
  gap: '12px',
  padding: '5px 7px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
  backgroundColor: vars.color.background.surfaceHover,
  fontSize: '13px',
});

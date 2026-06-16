import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';

export const page = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(300px, 380px) minmax(0, 1fr)',
  gap: '16px',
  minHeight: '100%',
  padding: '16px',
  color: vars.color.text.primary,
});

export const panel = style({
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '8px',
  background: vars.color.background.surface,
  boxShadow: vars.color.shadow.card,
});

export const tablePanel = style([
  panel,
  {
    overflow: 'hidden',
  },
]);

export const tableHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '14px',
  borderBottom: `1px solid ${vars.color.border.default}`,
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: '1.1rem',
});

export const subtitle = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: '0.85rem',
});

export const tableWrap = style({
  maxHeight: 'calc(100vh - 220px)',
  overflow: 'auto',
});

export const partsTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.85rem',
});

export const tableHeadCell = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  padding: '9px 10px',
  borderBottom: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.navbar,
  color: vars.color.text.heading,
  textAlign: 'left',
});

export const partRow = style({
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      background: vars.color.background.surfaceHover,
    },
  },
});

export const selectedPartRow = style([
  partRow,
  {
    background: vars.color.state.selectedBg,
    boxShadow: `inset 3px 0 0 ${vars.color.state.selectedBorder}`,
  },
]);

export const tableCell = style({
  padding: '9px 10px',
  borderBottom: `1px solid ${vars.color.border.default}`,
  verticalAlign: 'top',
});

export const partName = style({
  display: 'block',
  color: vars.color.text.heading,
  fontWeight: 700,
});

export const muted = style({
  color: vars.color.text.muted,
});

export const editorGrid = style({
  display: 'grid',
  gridTemplateRows: 'auto minmax(360px, 1fr) auto',
  gap: '16px',
  minWidth: 0,
});

export const controlsPanel = style([
  panel,
  {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(110px, 1fr))',
    gap: '12px',
    padding: '14px',
    alignItems: 'end',
  },
]);

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  minWidth: 0,
});

export const label = style({
  color: vars.color.text.muted,
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
});

export const input = style({
  minHeight: '36px',
  minWidth: 0,
  padding: '7px 9px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  background: vars.color.background.app,
  color: vars.color.text.primary,
  font: 'inherit',
});

export const buttonGroup = style({
  display: 'flex',
  gap: '6px',
});

export const button = style({
  minWidth: '36px',
  minHeight: '36px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: 'pointer',
  fontWeight: 800,
  selectors: {
    '&:hover': {
      borderColor: vars.color.border.focus,
      background: vars.color.background.surfaceHover,
    },
  },
});

export const stagePanel = style([
  panel,
  {
    display: 'grid',
    gridTemplateRows: '1fr auto',
    overflow: 'hidden',
  },
]);

export const stage = style({
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  minHeight: '420px',
  overflow: 'auto',
  background: `linear-gradient(45deg, ${vars.color.background.app} 25%, transparent 25%),
    linear-gradient(-45deg, ${vars.color.background.app} 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, ${vars.color.background.app} 75%),
    linear-gradient(-45deg, transparent 75%, ${vars.color.background.app} 75%)`,
  backgroundColor: vars.color.background.surfaceHover,
  backgroundSize: '22px 22px',
  backgroundPosition: '0 0, 0 11px, 11px -11px, -11px 0',
});

export const svg = style({
  display: 'block',
  maxWidth: '100%',
  maxHeight: '72vh',
  touchAction: 'none',
});

export const emptyStage = style({
  maxWidth: '460px',
  padding: '28px',
  color: vars.color.text.muted,
  textAlign: 'center',
});

export const socketPoint = style({
  cursor: 'grab',
  filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.45))',
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

export const socketLabel = style({
  paintOrder: 'stroke',
  stroke: vars.color.background.surface,
  strokeWidth: 4,
  fill: vars.color.text.heading,
  fontSize: '18px',
  fontWeight: 800,
  pointerEvents: 'none',
});

export const socketsPanel = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '8px',
  padding: '10px',
  borderTop: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
});

export const socketCard = style({
  display: 'grid',
  gap: '3px',
  padding: '8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  background: vars.color.background.app,
  fontSize: '0.8rem',
});

export const socketName = style({
  color: vars.color.text.heading,
  fontWeight: 800,
});

export const jsonPanel = style([
  panel,
  {
    display: 'grid',
    gridTemplateRows: 'auto minmax(160px, 1fr)',
    overflow: 'hidden',
  },
]);

export const jsonHeader = style({
  padding: '12px 14px',
  borderBottom: `1px solid ${vars.color.border.default}`,
});

export const jsonOutput = style({
  margin: 0,
  padding: '14px',
  overflow: 'auto',
  background: vars.color.background.app,
  color: vars.color.text.primary,
  fontSize: '0.82rem',
  lineHeight: 1.45,
});

export const noAssetBadge = style({
  display: 'inline-flex',
  width: 'max-content',
  padding: '2px 6px',
  borderRadius: '6px',
  background: vars.color.state.warning,
  color: vars.color.text.inverse,
  fontSize: '0.72rem',
  fontWeight: 800,
});

export const assetBadge = style([
  noAssetBadge,
  {
    background: vars.color.state.success,
  },
]);

export const targetSizeFields = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '6px',
});

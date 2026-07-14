import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';
import * as hud from '../../theme/hud.css.ts';

export const researchPage = style({
  padding: '10px max(10px, env(safe-area-inset-right, 0px)) max(10px, env(safe-area-inset-bottom, 0px)) max(10px, env(safe-area-inset-left, 0px))',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  '@media': {
    '(max-width: 700px)': {
      padding: '6px max(6px, env(safe-area-inset-right, 0px)) max(10px, env(safe-area-inset-bottom, 0px)) max(6px, env(safe-area-inset-left, 0px))',
    },
  },
});

export const researchHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  gap: '6px',
  flexWrap: 'wrap',
  '@media': {
    '(max-width: 700px)': {
      marginBottom: '6px',
    },
  },
});

export const researchPoints = style([
  hud.compactPanel,
  {
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '6px 9px',
  '@media': {
    '(max-width: 700px)': {
      fontSize: '13px',
      padding: '5px 8px',
    },
  },
  },
]);

export const researchFilters = style({});

export const researchSelect = style([
  hud.compactPanel,
  {
  padding: '5px 8px',
  color: vars.color.text.primary,
  fontSize: '13px',
  maxWidth: '100%',
  },
]);

export const researchTree = style([
  hud.compactPanel,
  {
  position: 'relative',
  width: '100%',
  height: '100%',
  maxHeight: '100%',
  overflow: 'hidden',
  overscrollBehavior: 'contain',
  touchAction: 'none',
  minHeight: 0,
  },
]);

export const researchTreeControls = style({
  position: 'absolute',
  top: '8px',
  right: '8px',
  zIndex: 2,
  display: 'flex',
  gap: '6px',
  '@media': {
    '(max-width: 700px)': {
      top: '6px',
      right: '6px',
      gap: '4px',
    },
  },
});

export const researchTreeControl = style([
  hud.secondaryButton,
  {
  minHeight: '28px',
  padding: '3px 8px',
  '@media': {
    '(max-width: 700px)': {
      minHeight: '32px',
      padding: '3px 7px',
    },
  },
  },
]);

export const treeCanvas = style({
  position: 'relative',
  width: '100%',
  height: '100%',
});

export const treeQuadrant = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'auto',
});

export const mirrorX = style({
  transform: 'scaleX(-1)',
  transformOrigin: 'center',
});

export const mirrorY = style({
  transform: 'scaleY(-1)',
  transformOrigin: 'center',
});

export const nodeLabel = style({
  transform: 'scaleX(-1) scaleY(-1)',
});

export const researchNode = style({
  position: 'absolute',
  width: '132px',
  backgroundColor: vars.color.background.surface,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '4px',
  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.16)',
  padding: '7px',
  transition: 'transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
      borderColor: vars.color.border.selected,
      boxShadow: '0 3px 0 rgba(0, 0, 0, 0.18)',
    },
  },
});

export const researchNodeLocked = style({
  backgroundColor: vars.color.background.navbar,
  color: vars.color.text.muted,
  cursor: 'not-allowed',
});

export const researchNodeUnlocked = style({
  border: `2px solid ${vars.color.state.success}`,
});

export const researchNodeResearched = style({
  backgroundColor: vars.color.state.selectedBg,
  border: `2px solid ${vars.color.state.success}`,
});

export const nodeContent = style({});

export const nodeContentTitle = style({
  margin: '0 0 3px 0',
  fontSize: '13px',
});

export const nodeContentP = style({
  margin: '0 0 5px 0',
  fontSize: '11px',
  color: vars.color.text.muted,
});

export const nodeCost = style({
  fontWeight: 'bold',
  fontSize: '12px',
  marginBottom: '3px',
});

export const nodeCategory = style({
  fontSize: '11px',
  color: vars.color.text.muted,
  backgroundColor: vars.color.background.app,
  padding: '1px 5px',
  borderRadius: '3px',
  display: 'inline-block',
  marginBottom: '3px',
});

export const nodeKeywords = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '3px',
});

export const keyword = style({
  backgroundColor: vars.color.background.app,
  color: vars.color.text.muted,
  fontSize: '10px',
  padding: '1px 5px',
  borderRadius: '3px',
});

export const connections = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
});

export const connection = style({
  strokeWidth: 2,
  strokeDasharray: '5, 5',
});

export const connectionLocked = style({
  stroke: vars.color.border.strong,
});

export const connectionResearched = style({
  stroke: vars.color.state.success,
  strokeDasharray: 'none',
});

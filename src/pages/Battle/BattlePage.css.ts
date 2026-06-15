import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';

export const battlePage = style({
  height: '100%',
  minHeight: '560px',
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
  backgroundColor: vars.color.background.app,
});

export const battleShell = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'grid',
  placeItems: 'center',
});

export const battleShellSiege = style({
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '10px',
      zIndex: 1,
      pointerEvents: 'none',
      border: `2px solid ${vars.color.state.warning}`,
      borderRadius: '8px',
      boxShadow: `inset 0 0 36px color-mix(in srgb, ${vars.color.state.warning} 28%, transparent)`,
      opacity: 0.75,
    },
  },
});

export const battleHud = style({
  position: 'absolute',
  top: '12px',
  left: '12px',
  zIndex: 2,
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  color: vars.color.text.primary,
});

export const battleMetric = style({
  display: 'grid',
  gap: '2px',
  minWidth: '128px',
  padding: '8px 10px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  boxShadow: vars.color.shadow.card,
});

export const battleMetricLabel = style({
  color: vars.color.text.muted,
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
});

export const battleMetricValue = style({
  color: vars.color.text.heading,
  fontSize: '1.1rem',
  fontWeight: 800,
});

export const battleNotice = style({
  position: 'absolute',
  left: '50%',
  bottom: '18px',
  zIndex: 2,
  width: 'min(680px, calc(100% - 32px))',
  transform: 'translateX(-50%)',
  padding: '12px 14px',
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  boxShadow: vars.color.shadow.popover,
  color: vars.color.text.heading,
  fontWeight: 700,
  textAlign: 'center',
});

export const battleLocked = style({
  display: 'grid',
  placeItems: 'center',
  alignContent: 'center',
  gap: '12px',
  padding: '32px',
  textAlign: 'center',
  color: vars.color.text.primary,
});

export const battleLockedTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: '2rem',
});

export const battleLockedText = style({
  margin: 0,
  maxWidth: '520px',
});

export const battleLockedLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '40px',
  padding: '8px 14px',
  borderRadius: '6px',
  border: `1px solid ${vars.color.brand.primary}`,
  background: vars.color.brand.primary,
  color: vars.color.text.inverse,
  textDecoration: 'none',
  fontWeight: 700,
});

import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';

export const battlePage = style({
  height: '100%',
  minHeight: 0,
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
  backgroundColor: vars.color.background.app,
  '@media': {
    '(min-width: 760px) and (min-height: 680px)': {
      minHeight: '560px',
    },
  },
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
      inset: '0px',
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
  top: '52px',
  left: '12px',
  zIndex: 2,
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  color: vars.color.text.primary,
  '@media': {
    '(max-width: 700px)': {
      top: '42px',
      left: '8px',
      right: '8px',
      gap: '6px',
    },
  },
});

export const battleProgress = style({
  position: 'absolute',
  left: '50%',
  zIndex: 2,
  width: 'min(720px, calc(100% - 32px))',
  transform: 'translateX(-50%)',
  display: 'grid',
  gap: '6px',
  pointerEvents: 'none',
});

export const siegeProgress = style({
  top: '12px',
});

export const pressureProgress = style({
  bottom: '12px',
});

export const progressLabel = style({
  color: vars.color.text.primary,
  fontSize: '0.78rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  textShadow: '0 1px 2px rgb(0 0 0 / 0.55)',
});

export const progressTrack = style({
  height: '12px',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: '6px',
  backgroundColor: 'color-mix(in srgb, black 34%, transparent)',
  boxShadow: vars.color.shadow.card,
});

export const progressFill = style({
  height: '100%',
  borderRadius: 'inherit',
  transition: 'width 180ms ease-out',
});

export const siegeProgressFill = style([
  progressFill,
  {
    background: `linear-gradient(90deg, ${vars.color.state.warning}, ${vars.color.state.error})`,
  },
]);

export const pressureProgressFill = style([
  progressFill,
  {
    background: `linear-gradient(90deg, ${vars.color.brand.primary}, ${vars.color.state.warning})`,
  },
]);

export const battleMetric = style({
  display: 'grid',
  gap: '2px',
  minWidth: '128px',
  padding: '8px 10px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  backgroundColor: vars.color.background.surface,
  boxShadow: vars.color.shadow.card,
  '@media': {
    '(max-width: 700px)': {
      minWidth: '96px',
      padding: '6px 8px',
    },
  },
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
  '@media': {
    '(max-width: 700px)': {
      fontSize: '0.95rem',
    },
  },
});

export const battleNotice = style({
  position: 'absolute',
  left: '50%',
  bottom: 'max(42px, env(safe-area-inset-bottom, 0px))',
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
  '@media': {
    '(max-width: 700px)': {
      bottom: 'max(34px, env(safe-area-inset-bottom, 0px))',
      padding: '10px 12px',
      fontSize: '0.9rem',
    },
  },
});

export const battleLocked = style({
  display: 'grid',
  placeItems: 'center',
  alignContent: 'center',
  gap: '12px',
  padding: 'clamp(18px, 6vw, 32px)',
  textAlign: 'center',
  color: vars.color.text.primary,
});

export const battleLockedTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: 'clamp(1.45rem, 8vw, 2rem)',
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

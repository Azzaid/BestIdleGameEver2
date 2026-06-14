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

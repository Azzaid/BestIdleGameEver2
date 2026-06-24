import { style } from '@vanilla-extract/css';
import { vars } from './theme/theme.css.ts';

export const appContainer = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const appNav = style({
  backgroundColor: vars.color.background.navbar,
  boxSizing: 'border-box',
  minHeight: '36px',
  maxHeight: '40px',
  padding: '0 10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: 100,
  transition: 'min-height 140ms ease, max-height 140ms ease, padding 140ms ease, opacity 100ms ease, transform 140ms ease, box-shadow 140ms ease',
});

export const appNavHidden = style({
  minHeight: 0,
  maxHeight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  opacity: 0,
  pointerEvents: 'none',
  transform: 'translateY(-100%)',
  boxShadow: 'none',
});

export const appTitle = style({
  display: 'none',
  fontSize: '0.95rem',
  fontWeight: 800,
  whiteSpace: 'nowrap',
  '@media': {
    'screen and (min-width: 1100px)': {
      display: 'block',
    },
  },
});

export const navLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: 0,
});

export const debugToggle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  minHeight: '26px',
  padding: '2px 7px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  color: vars.color.text.primary,
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  userSelect: 'none',
});

export const navLinks = style({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  minWidth: 0,
  overflowX: 'auto',
  scrollbarWidth: 'none',
});

export const navBarItem = style({
    margin: 0,
    padding: 0,
});

export const navBarLink = style({
        display: 'block',
        textDecoration: 'none',
        padding: '9px 9px',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
        fontSize: '0.84rem',
        fontWeight: 700,
    selectors: {
        '&:hover': {
            backgroundColor: vars.color.border.focus,
        },
    }
});

export const navBarLinkBlocked = style([
  navBarLink,
  {
    color: vars.color.text.muted,
    opacity: 0.65,
  },
]);

export const appContent = style({
  flex: 1,
  overflow: 'auto',
  backgroundColor: vars.color.background.app,
});

export const themeSwitcher = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const blockedPage = style({
  display: 'grid',
  placeItems: 'center',
  alignContent: 'center',
  gap: '12px',
  minHeight: '100%',
  padding: '32px',
  color: vars.color.text.primary,
  textAlign: 'center',
});

export const blockedTitle = style({
  margin: 0,
  color: vars.color.state.error,
  fontSize: '2rem',
});

export const blockedText = style({
  margin: 0,
  maxWidth: '520px',
  color: vars.color.text.primary,
});

export const blockedLink = style({
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

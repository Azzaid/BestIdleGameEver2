import { style } from '@vanilla-extract/css';
import { vars } from './theme/theme.css.ts';

export const appContainer = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  backgroundColor: vars.color.background.app,
});

export const appNav = style({
  backgroundColor: vars.color.background.navbar,
  boxSizing: 'border-box',
  minHeight: 'calc(30px + env(safe-area-inset-top, 0px))',
  maxHeight: 'calc(38px + env(safe-area-inset-top, 0px))',
  padding: 'env(safe-area-inset-top, 0px) max(6px, env(safe-area-inset-right, 0px)) 0 max(6px, env(safe-area-inset-left, 0px))',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '6px',
  overflow: 'hidden',
  borderBottom: `1px solid ${vars.color.border.strong}`,
  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.12)',
  zIndex: 100,
  transition: 'min-height 140ms ease, max-height 140ms ease, padding 140ms ease, opacity 100ms ease, transform 140ms ease, box-shadow 140ms ease',
});

export const appNavHidden = style({
  minHeight: 0,
  maxHeight: 0,
  paddingTop: 0,
  paddingRight: 'max(10px, env(safe-area-inset-right, 0px))',
  paddingBottom: 0,
  paddingLeft: 'max(10px, env(safe-area-inset-left, 0px))',
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
  gap: '6px',
  minWidth: 0,
  flex: '0 0 auto',
});

export const debugToggle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  minHeight: '24px',
  padding: '2px 6px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '3px',
  color: vars.color.text.primary,
  fontSize: '0.72rem',
  fontWeight: 700,
  cursor: 'pointer',
  userSelect: 'none',
});

export const navLinks = style({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-start',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  minWidth: 0,
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
  scrollbarWidth: 'none',
  WebkitOverflowScrolling: 'touch',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  '@media': {
    'screen and (min-width: 760px)': {
      justifyContent: 'center',
    },
  },
});

export const navBarItem = style({
    margin: 0,
    padding: 0,
});

export const navBarLink = style({
        display: 'block',
        textDecoration: 'none',
        minHeight: '30px',
        padding: '5px 8px',
        transition: 'background-color 0.12s',
        whiteSpace: 'nowrap',
        fontSize: '0.78rem',
        fontWeight: 700,
        lineHeight: '18px',
    selectors: {
        '&:hover': {
            backgroundColor: vars.color.border.focus,
        },
    },
    '@media': {
      '(max-width: 700px)': {
        minHeight: '34px',
        padding: '8px 9px',
      },
    },
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
  minHeight: 0,
  overflow: 'auto',
  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'contain',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  backgroundColor: vars.color.background.app,
});

export const themeSwitcher = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: '0 0 auto',
});

export const blockedPage = style({
  display: 'grid',
  placeItems: 'center',
  alignContent: 'center',
  gap: '8px',
  minHeight: '100%',
  padding: 'clamp(12px, 4vw, 20px)',
  paddingBottom: 'max(clamp(12px, 4vw, 20px), env(safe-area-inset-bottom, 0px))',
  color: vars.color.text.primary,
  textAlign: 'center',
});

export const blockedTitle = style({
  margin: 0,
  color: vars.color.state.error,
  fontSize: 'clamp(1.25rem, 6vw, 1.6rem)',
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
  minHeight: '32px',
  padding: '6px 10px',
  borderRadius: '3px',
  border: `1px solid ${vars.color.brand.primary}`,
  background: vars.color.brand.primary,
  color: vars.color.text.inverse,
  textDecoration: 'none',
  fontWeight: 700,
});

import { style } from '@vanilla-extract/css';
import { vars } from './theme/theme.css.ts';

export const appContainer = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const appNav = style({
  backgroundColor: vars.color.background.navbar,
  padding: '0 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: 100,
});

export const appTitle = style({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  padding: '15px 0',
});

export const navLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
});

export const debugToggle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  minHeight: '32px',
  padding: '4px 8px',
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: '6px',
  color: vars.color.text.primary,
  fontSize: '0.85rem',
  fontWeight: 700,
  cursor: 'pointer',
  userSelect: 'none',
});

export const navLinks = style({
  display: 'flex',
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const navBarItem = style({
    margin: 0,
    padding: 0,
});

export const navBarLink = style({
        display: 'block',
        textDecoration: 'none',
        padding: '20px 15px',
        transition: 'background-color 0.2s',
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

import { style } from '@vanilla-extract/css';
import { vars } from './theme/theme.css.ts';

export const appContainer = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const appNav = style({
  backgroundColor: vars.bgHi,
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
            backgroundColor: vars.focus,
        },
    }
});

export const appContent = style({
  flex: 1,
  overflow: 'auto',
  backgroundColor: vars.bg,
});

export const themeSwitcher = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

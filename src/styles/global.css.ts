import { globalStyle } from '@vanilla-extract/css';
import { vars } from '../theme/theme.css.ts';

globalStyle(':root', {
  fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  lineHeight: '1.5',
  fontWeight: '400',
  color: vars.color.text.primary,
  backgroundColor: vars.color.background.app,
  fontSynthesis: 'none',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle('*', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

globalStyle('html, body', {
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  overscrollBehavior: 'none',
});

globalStyle('body', {
  margin: 0,
  padding: 0,
  minWidth: '320px',
  minHeight: '100dvh',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
});

globalStyle('h1', {
  fontSize: '2em',
  lineHeight: '1.2',
  marginBottom: '20px',
  color: vars.color.text.heading,
});

globalStyle('h2', {
  fontSize: '1.5em',
  marginBottom: '15px',
  color: vars.color.text.heading,
});

globalStyle('h3', {
  fontSize: '1.2em',
  marginBottom: '10px',
  color: vars.color.text.heading,
});

globalStyle('p', {
  marginBottom: '15px',
});

globalStyle('a', {
  color: vars.color.brand.primary,
  textDecoration: 'none',
});

globalStyle('a:hover', {
  textDecoration: 'underline',
});

globalStyle('button', {
  borderRadius: '4px',
  border: '1px solid transparent',
  padding: '8px 16px',
  minHeight: '36px',
  fontSize: '14px',
  fontWeight: '500',
  fontFamily: 'inherit',
  backgroundColor: vars.color.brand.primary,
  color: vars.color.text.primary,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '@media': {
    '(max-width: 700px)': {
      minHeight: '44px',
    },
  },
});

globalStyle('button:hover', {
  backgroundColor: vars.color.brand.primaryHover,
});

globalStyle('button:focus, button:focus-visible', {
  outline: `2px solid ${vars.color.border.focus}`,
  outlineOffset: '2px',
});

globalStyle('#root', {
  width: '100%',
  height: '100dvh',
  margin: 0,
  padding: 0,
});

globalStyle('input, select, textarea, button', {
  font: 'inherit',
});

globalStyle('.text-center', { textAlign: 'center' });

globalStyle('.mt-1', { marginTop: '0.25rem' });
globalStyle('.mt-2', { marginTop: '0.5rem' });
globalStyle('.mt-3', { marginTop: '1rem' });
globalStyle('.mt-4', { marginTop: '1.5rem' });
globalStyle('.mt-5', { marginTop: '3rem' });

globalStyle('.mb-1', { marginBottom: '0.25rem' });
globalStyle('.mb-2', { marginBottom: '0.5rem' });
globalStyle('.mb-3', { marginBottom: '1rem' });
globalStyle('.mb-4', { marginBottom: '1.5rem' });
globalStyle('.mb-5', { marginBottom: '3rem' });

globalStyle('@media (max-width: 768px)', {});

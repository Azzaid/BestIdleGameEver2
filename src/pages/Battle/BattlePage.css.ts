import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';

export const battlePage = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '20px',
});

export const canvasContainer = style({
  flex: 1,
  margin: '20px 0',
  border: `2px solid ${vars.bgHi}`,
  borderRadius: '5px',
  overflow: 'hidden',
  minHeight: '500px',
});

export const battleCanvas = style({
  width: '100%',
  height: '100%',
  display: 'block',
});

export const battleControls = style({
  backgroundColor: '#f0f0f0',
  padding: '15px',
  borderRadius: '5px',
  marginTop: '10px',
});

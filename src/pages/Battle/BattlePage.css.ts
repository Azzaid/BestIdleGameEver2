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

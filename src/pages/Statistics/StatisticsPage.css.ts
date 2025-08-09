import { style } from '@vanilla-extract/css';
import { vars } from '../../theme/theme.css.ts';

export const statisticsPage = style({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const statSummary = style({
  display: 'flex',
  gap: '20px',
  marginBottom: '30px',
  flexWrap: 'wrap',
});

export const statCard = style({
  flex: 1,
  minWidth: '250px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const statCardTitle = style({
  marginTop: 0,
  marginBottom: '15px',
  color: '#333',
  borderBottom: '1px solid #ddd',
  paddingBottom: '8px',
});

export const statValues = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const statValue = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const label = style({
  color: '#666',
  fontSize: '14px',
});

export const value = style({
  fontWeight: 'bold',
  fontSize: '16px',
  color: '#333',
});

export const graphsContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '30px',
  flex: 1,
});

export const graphWrapper = style({
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  height: '300px',
});

export const statGraph = style({
  width: '100%',
  height: '100%',
});

import { style } from '@vanilla-extract/css';

export const cityPage = style({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const cityContainer = style({
  display: 'flex',
  flex: 1,
  marginBottom: '20px',
});

export const cityCanvas = style({
  flex: 1,
  minHeight: '600px',
  border: '2px solid #333',
  borderRadius: '5px',
  backgroundColor: '#f0f0f0',
});

export const buildingInfo = style({
  width: '250px',
  marginLeft: '20px',
  padding: '15px',
  backgroundColor: '#f5f5f5',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const buildingInfoTitle = style({
  marginTop: 0,
  color: '#333',
  borderBottom: '1px solid #ddd',
  paddingBottom: '8px',
});

export const buildingInfoText = style({
  margin: '8px 0',
  color: '#555',
});

export const buildingInfoButton = style({
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '10px',
  fontWeight: 'bold',
  transition: 'background-color 0.2s',
  selectors: {
    '&:hover': { backgroundColor: '#45a049' },
  },
});

export const cityControls = style({
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '#f5f5f5',
  padding: '15px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const resources = style({
  display: 'flex',
  gap: '20px',
});

export const resource = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const resourceName = style({
  fontSize: '14px',
  color: '#555',
});

export const resourceValue = style({
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
});

export const actions = style({
  display: 'flex',
  gap: '10px',
});

export const actionButton = style({
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'background-color 0.2s',
  selectors: {
    '&:hover': { backgroundColor: '#2980b9' },
  },
});

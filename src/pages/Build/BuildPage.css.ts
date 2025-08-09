import { style } from '@vanilla-extract/css';

export const buildPage = style({
  padding: '20px',
  maxWidth: '1200px',
  margin: '0 auto',
});

export const towerPreview = style({
  display: 'flex',
  marginBottom: '30px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '20px',
});

export const towerImage = style({
  flex: 1,
  minHeight: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px dashed #ccc',
  marginRight: '20px',
});

export const towerPlaceholder = style({
  fontSize: '24px',
  color: '#888',
});

export const towerStats = style({
  flex: 1,
  padding: '15px',
  backgroundColor: 'white',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

// Tabs
export const tabsContainer = style({
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
  flexWrap: 'wrap',
});

export const tabButton = style({
  backgroundColor: '#e9eef3',
  color: '#333',
  border: '1px solid #cdd6df',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  selectors: {
    '&:hover': { backgroundColor: '#dde6f0' },
  },
});

export const tabButtonActive = style({
  backgroundColor: '#cfe4ff',
  borderColor: '#8db9ff',
  fontWeight: 'bold',
});

// Parts table
export const controlsRow = style({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '12px 0',
  flexWrap: 'wrap',
});

export const columnChooser = style({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
});

export const filterInput = style({
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid #cdd6df',
  fontSize: '13px',
});

export const tableContainer = style({
  maxHeight: '320px',
  overflow: 'auto',
  marginTop: '8px',
});

export const partsTable = style({
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 8px',
  marginBottom: '24px',
});

export const tableHead = style({});
export const tableHeaderCell = style({
  textAlign: 'left',
  fontSize: '14px',
  color: '#555',
  padding: '8px 12px',
});

export const tableRow = style({
  backgroundColor: 'white',
  border: '1px solid #ddd',
  borderRadius: '8px',
});

export const tableCell = style({
  padding: '10px 12px',
  fontSize: '14px',
  color: '#333',
});

export const selectedRow = style({
  outline: '2px solid #4CAF50',
  backgroundColor: '#f0fff0',
});

// Legacy grid styles below kept (unused after tabs), can be removed later if desired
export const componentSelection = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
});

export const componentSlot = style({
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '20px',
});

export const componentOptions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const componentOption = style({
  backgroundColor: 'white',
  border: '2px solid #ddd',
  borderRadius: '5px',
  padding: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      borderColor: '#aaa',
      transform: 'translateY(-2px)',
    },
  },
});

export const componentOptionSelected = style({
  borderColor: '#4CAF50',
  backgroundColor: '#f0fff0',
});

export const componentOptionTitle = style({
  margin: '0 0 5px 0',
  color: '#333',
});

export const componentOptionDesc = style({
  margin: '0 0 10px 0',
  color: '#666',
  fontSize: '14px',
});

export const keywords = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '5px',
});

export const keyword = style({
  backgroundColor: '#e0e0e0',
  color: '#555',
  fontSize: '12px',
  padding: '3px 8px',
  borderRadius: '12px',
});

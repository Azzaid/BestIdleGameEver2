import { style } from '@vanilla-extract/css';

export const researchPage = style({
  padding: '20px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const researchHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

export const researchPoints = style({
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '10px 15px',
  backgroundColor: '#f0f0f0',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const researchFilters = style({});

export const researchSelect = style({
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '16px',
});

export const researchTree = style({
  position: 'relative',
  height: '100%',
  maxHeight: '100%',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  overflow: 'hidden',
  minHeight: 0,
});

export const treeCanvas = style({
  position: 'relative',
  width: '100%',
  height: '100%',
});

export const treeQuadrant = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'auto',
});

export const mirrorX = style({
  transform: 'scaleX(-1)',
  transformOrigin: 'center',
});

export const mirrorY = style({
  transform: 'scaleY(-1)',
  transformOrigin: 'center',
});

export const nodeLabel = style({
  transform: 'scaleX(-1) scaleY(-1)',
});

export const researchNode = style({
  position: 'absolute',
  width: '150px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  padding: '10px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    },
  },
});

export const researchNodeLocked = style({
  backgroundColor: '#e0e0e0',
  color: '#888',
  cursor: 'not-allowed',
});

export const researchNodeUnlocked = style({
  border: '2px solid #4CAF50',
});

export const researchNodeResearched = style({
  backgroundColor: '#e8f5e9',
  border: '2px solid #2E7D32',
});

export const nodeContent = style({});

export const nodeContentTitle = style({
  margin: '0 0 5px 0',
  fontSize: '16px',
});

export const nodeContentP = style({
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: '#666',
});

export const nodeCost = style({
  fontWeight: 'bold',
  fontSize: '14px',
  marginBottom: '5px',
});

export const nodeCategory = style({
  fontSize: '12px',
  color: '#555',
  backgroundColor: '#eee',
  padding: '2px 6px',
  borderRadius: '10px',
  display: 'inline-block',
  marginBottom: '5px',
});

export const nodeKeywords = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
});

export const keyword = style({
  backgroundColor: '#e0e0e0',
  color: '#555',
  fontSize: '10px',
  padding: '2px 6px',
  borderRadius: '10px',
});

export const connections = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
});

export const connection = style({
  strokeWidth: 2,
  strokeDasharray: '5, 5',
});

export const connectionLocked = style({
  stroke: '#aaa',
});

export const connectionResearched = style({
  stroke: '#4CAF50',
  strokeDasharray: 'none',
});

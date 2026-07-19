import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "248px minmax(0, 1fr) 288px",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const panel = style({
  minHeight: 0,
  overflow: "auto",
  padding: "10px",
  borderRight: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
});

export const detailsPanel = style([
  panel,
  {
    borderRight: 0,
    borderLeft: `1px solid ${vars.color.border.default}`,
  },
]);

export const heading = style({
  margin: "0 0 8px",
  fontSize: "0.95rem",
  color: vars.color.text.heading,
});

export const previewArea = style({
  display: "grid",
  placeItems: "center",
  minHeight: "132px",
  marginBottom: "10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  background: vars.color.background.app,
});

export const mapScroll = style({
  minHeight: 0,
  width: "100%",
  height: "100%",
  overflow: "auto",
  overscrollBehavior: "contain",
  background: vars.color.background.app,
});

export const mapBoard = style({
  display: "grid",
  alignItems: "start",
  gap: "14px",
  width: "max-content",
  minWidth: "100%",
  padding: "12px",
});

export const emptyMap = style({
  display: "grid",
  placeItems: "center",
  height: "100%",
  color: vars.color.text.muted,
  fontWeight: 800,
});

export const lane = style({
  display: "grid",
  gridTemplateColumns: "112px max-content",
  width: "max-content",
  minWidth: "100%",
  minHeight: "148px",
  border: `1px solid ${vars.color.border.default}`,
  borderLeft: "5px solid var(--vector-color)",
  borderRadius: "6px",
  background: vars.color.background.surface,
  boxShadow: "0 1px 0 rgba(0, 0, 0, 0.14)",
});

export const laneHeader = style({
  position: "sticky",
  left: 0,
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "10px",
  borderRight: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.surface,
  color: vars.color.text.heading,
  fontSize: "0.85rem",
  fontWeight: 900,
});

export const laneSwatch = style({
  width: "10px",
  height: "28px",
  borderRadius: "999px",
  background: "var(--vector-color)",
  boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.38)",
});

export const branchStack = style({
  display: "grid",
  alignContent: "start",
  gap: "10px",
  width: "max-content",
  minWidth: 0,
  padding: "10px",
});

export const branch = style({
  display: "grid",
  gridTemplateColumns: "174px 180px max-content",
  width: "max-content",
  alignItems: "stretch",
  minWidth: 0,
  marginTop: "3px",
  border: `3px solid color-mix(in srgb, var(--vector-color) 38%, ${vars.color.border.default})`,
  borderBottom: `1px solid color-mix(in srgb, var(--vector-color) 38%, ${vars.color.border.default})`,
  borderRadius: "6px",
  background: `linear-gradient(90deg, color-mix(in srgb, var(--vector-color) 8%, transparent), ${vars.color.background.app} 24%)`,
});

export const gateColumn = style({
  display: "grid",
  alignContent: "start",
  gap: "8px",
  minWidth: 0,
  minHeight: "100%",
  padding: "9px",
  background: `linear-gradient(180deg, color-mix(in srgb, var(--card-color) 18%, transparent), ${vars.color.background.surface} 58%)`,
  color: vars.color.text.primary,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      borderColor: vars.color.brand.primary,
    },
  },
});

export const unlockColumn = style({
  display: "grid",
  alignContent: "start",
  gap: "7px",
  width: "180px",
  minWidth: 0,
  padding: "7px",
  borderLeft: `3px solid color-mix(in srgb, var(--vector-color) 42%, ${vars.color.border.default})`,
  background: vars.color.background.app,
});

export const childBranchStack = style({
  display: "grid",
  alignContent: "start",
  gap: "8px",
  width: "max-content",
  minWidth: 0,
});

export const branchHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  minWidth: 0,
  color: vars.color.text.heading,
  fontSize: "0.78rem",
  fontWeight: 900,
});

export const gateColumnHidden = style({
  borderColor: vars.color.border.default,
  borderStyle: "dashed",
  background: vars.color.background.surface,
  color: vars.color.text.muted,
  cursor: "default",
  boxShadow: "none",
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.default,
    },
  },
});

export const hiddenGateText = style({
  display: "grid",
  gap: "4px",
  fontSize: "0.78rem",
  fontWeight: 800,
});

export const branchBadge = style({
  maxWidth: "48%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  padding: "2px 6px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "999px",
  color: vars.color.text.muted,
  background: vars.color.background.surface,
  fontSize: "0.68rem",
});

export const contentGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "7px",
  alignItems: "start",
});

export const contentCard = style({
  display: "grid",
  gap: "5px",
  minWidth: 0,
  minHeight: "50px",
  padding: "0 7px",
  border: "1px solid var(--card-color)",
  borderRadius: "5px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "inset 3px 0 0 var(--card-color)",
  selectors: {
    "&:hover": {
      borderColor: vars.color.brand.primary,
    },
  },
});

export const cardSelected = style({
  outline: `3px solid ${vars.color.border.selected}`,
  outlineOffset: "1px",
});

export const cardKind_research = style({
  borderRadius: "999px",
});

export const cardKind_building = style({});

export const cardKind_towerPart = style({
  borderRadius: "999px",
});

export const cardKind_structure = style({
  borderStyle: "dashed",
});

export const cardMeta = style({
  display: "flex",
  alignItems: "center",
  gap: "5px",
  minWidth: 0,
  color: vars.color.text.muted,
  fontSize: "0.68rem",
  fontWeight: 900,
  textTransform: "uppercase",
});

export const cardHeading = style({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  minWidth: 0,
});

export const kindIcon = style({
  display: "inline-grid",
  placeItems: "center",
  flex: "0 0 auto",
  width: "18px",
  height: "18px",
  borderRadius: "999px",
  background: "var(--card-color, var(--vector-color))",
  color: "white",
  fontSize: "0.65rem",
  fontWeight: 900,
});

export const cardTitle = style({
  minWidth: 0,
  color: vars.color.text.heading,
  fontSize: "0.82rem",
  lineHeight: 1.18,
  overflowWrap: "anywhere",
});

export const gateTitle = style([
  cardTitle,
  {
    fontSize: "0.95rem",
    lineHeight: 1.16,
  },
]);

export const cardSubline = style({
  minWidth: 0,
  color: vars.color.text.muted,
  fontSize: "0.72rem",
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const gateRequirementRow = style({
  display: "grid",
  gap: "5px",
  minWidth: 0,
});

export const gateRequirementLabel = style({
  color: vars.color.text.muted,
  fontSize: "0.66rem",
  fontWeight: 900,
  textTransform: "uppercase",
});

export const gateRequirementChip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  width: "100%",
  minWidth: 0,
  minHeight: "28px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "5px",
  padding: "3px 6px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  fontSize: "0.72rem",
  fontWeight: 800,
  cursor: "pointer",
  textAlign: "left",
  overflowWrap: "anywhere",
  boxShadow: "inset 3px 0 0 var(--card-color)",
  selectors: {
    "&:hover": {
      borderColor: vars.color.brand.primary,
    },
  },
});

export const towerPartShelf = style({
  display: "grid",
  gap: "5px",
  paddingTop: "2px",
});

export const shelfLabel = style({
  color: vars.color.text.muted,
  fontSize: "0.68rem",
  fontWeight: 900,
  textTransform: "uppercase",
});

export const partChipGrid = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "5px",
});

export const childPartRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
  marginTop: "2px",
});

export const partChip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  maxWidth: "100%",
  minHeight: "28px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "999px",
  padding: "3px 8px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  fontSize: "0.72rem",
  fontWeight: 800,
  cursor: "pointer",
});

export const childPartChip = style([
  partChip,
  {
    minHeight: "24px",
    padding: "2px 6px",
    fontSize: "0.68rem",
  },
]);

export const spritePreview = style({
  display: "block",
  maxWidth: "112px",
  maxHeight: "112px",
  objectFit: "contain",
  imageRendering: "pixelated",
});

export const emptyPreview = style({
  display: "grid",
  placeItems: "center",
  width: "112px",
  height: "112px",
  border: `1px dashed ${vars.color.border.default}`,
  borderRadius: "6px",
  color: vars.color.text.muted,
  fontSize: "0.78rem",
  fontWeight: 700,
});

export const editButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: "32px",
  marginBottom: "10px",
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: "4px",
  background: vars.color.background.surface,
  color: vars.color.text.heading,
  fontSize: "0.85rem",
  fontWeight: 800,
  textDecoration: "none",
  selectors: {
    "&:hover": {
      borderColor: vars.color.brand.primary,
      color: vars.color.brand.primary,
    },
  },
});

export const description = style({
  margin: "0 0 10px",
  color: vars.color.text.primary,
  fontSize: "0.86rem",
  lineHeight: 1.45,
});

export const field = style({
  display: "grid",
  gap: "6px",
  marginBottom: "8px",
});

export const label = style({
  fontSize: "0.78rem",
  fontWeight: 700,
  color: vars.color.text.muted,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "30px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "5px 7px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
});

export const checkList = style({
  display: "grid",
  gap: "6px",
});

export const checkItem = style({
  display: "flex",
  gap: "6px",
  alignItems: "center",
  fontSize: "0.9rem",
});

export const list = style({
  margin: 0,
  paddingLeft: "18px",
});

export const statList = style({
  display: "grid",
  gap: "5px",
  margin: 0,
});

export const statRow = style({
  display: "grid",
  gridTemplateColumns: "92px minmax(0, 1fr)",
  gap: "8px",
  fontSize: "0.82rem",
});

export const statTerm = style({
  color: vars.color.text.muted,
  fontWeight: 700,
});

export const statValue = style({
  minWidth: 0,
  margin: 0,
  color: vars.color.text.primary,
  overflowWrap: "anywhere",
});

export const tagList = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "5px",
});

export const tag = style({
  padding: "2px 6px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "999px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  fontSize: "0.76rem",
  fontWeight: 700,
});

export const muted = style({
  color: vars.color.text.muted,
});

export const warning = style({
  marginTop: "14px",
  padding: "7px",
  borderRadius: "4px",
  border: `1px solid ${vars.color.state.warning}`,
  background: vars.color.background.surface,
});

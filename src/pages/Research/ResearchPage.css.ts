import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";
import * as hud from "../../theme/hud.css.ts";

export const researchPage = style([
  hud.compactPanel,
  {
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflow: "auto",
    overscrollBehavior: "contain",
    background: vars.color.background.app,
    color: vars.color.text.primary,
  },
]);

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
  gridTemplateColumns: "220px 260px max-content",
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
});

export const nextGate = style({
  background: vars.color.background.surface,
  color: vars.color.text.muted,
});

export const gateColumnHidden = style({
  borderColor: vars.color.border.default,
  borderStyle: "dashed",
  background: vars.color.background.surface,
  color: vars.color.text.muted,
  boxShadow: "none",
});

export const unlockColumn = style({
  display: "grid",
  alignContent: "start",
  gap: "10px",
  width: "260px",
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

export const contentSection = style({
  display: "grid",
  alignContent: "start",
  gap: "6px",
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

export const gateTitle = style({
  minWidth: 0,
  color: vars.color.text.heading,
  fontSize: "0.95rem",
  lineHeight: 1.16,
  overflowWrap: "anywhere",
  selectors: {
    [`${nextGate} &`]: {
      color: vars.color.text.muted,
    },
  },
});

export const cardTitle = style({
  minWidth: 0,
  color: vars.color.text.heading,
  fontSize: "0.82rem",
  lineHeight: 1.18,
  overflowWrap: "anywhere",
});

export const description = style({
  margin: 0,
  color: vars.color.text.primary,
  fontSize: "0.86rem",
  lineHeight: 1.45,
});

export const shelfLabel = style({
  color: vars.color.text.muted,
  fontSize: "0.68rem",
  fontWeight: 900,
  textTransform: "uppercase",
});

export const contentCard = style({
  display: "grid",
  gap: "5px",
  minWidth: 0,
  padding: "7px",
  border: "1px solid var(--card-color)",
  borderRadius: "5px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  textAlign: "left",
  boxShadow: "inset 3px 0 0 var(--card-color)",
});

export const contentDescription = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: "0.76rem",
  lineHeight: 1.35,
});

export const partChipGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "6px",
});

export const partChip = style([
  contentCard,
  {
    borderRadius: "999px",
  },
]);

export const emptySection = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: "0.78rem",
  lineHeight: 1.35,
});

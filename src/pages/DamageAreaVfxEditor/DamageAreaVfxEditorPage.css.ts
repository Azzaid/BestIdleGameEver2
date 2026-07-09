import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "300px minmax(0, 1fr)",
  gap: "8px",
  minHeight: "100%",
  padding: "8px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  "@media": {
    "(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const panel = style({
  display: "grid",
  alignContent: "start",
  gap: "10px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  padding: "8px",
  background: vars.color.background.surface,
});

export const innerPanel = style({
  display: "grid",
  alignContent: "start",
  gap: "8px",
  minWidth: 0,
});

export const header = style({
  display: "grid",
  gap: "4px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1rem",
});

export const subtitle = style({
  margin: 0,
  color: vars.color.text.muted,
  fontSize: "0.88rem",
});

export const form = style({
  display: "grid",
  gap: "6px",
});

export const field = style({
  display: "grid",
  gap: "5px",
});

export const fieldGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "6px",
});

export const label = style({
  color: vars.color.text.muted,
  fontSize: "0.72rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "30px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "5px 7px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "30px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "5px 8px",
  background: vars.color.brand.primary,
  color: vars.color.text.inverse,
  cursor: "pointer",
  fontWeight: 800,
  selectors: {
    "&:disabled": {
      cursor: "wait",
      opacity: 0.65,
    },
  },
});

export const status = style({
  color: vars.color.text.muted,
  fontSize: "0.84rem",
});

export const error = style({
  color: vars.color.state.error,
  fontSize: "0.84rem",
  fontWeight: 800,
});

export const previewStage = style({
  display: "grid",
  placeItems: "center",
  minHeight: "360px",
  overflow: "hidden",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.app,
  backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%)",
  backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
  backgroundSize: "24px 24px",
});

export const previewCircle = style({
  borderRadius: "50%",
  backgroundRepeat: "repeat",
  backgroundSize: "180px 180px",
  boxShadow: `0 0 0 1px ${vars.color.border.strong}, 0 0 32px rgba(112, 180, 76, 0.3)`,
});

export const previewCircleFrame = style({
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  borderRadius: "50%",
  boxShadow: `0 0 0 1px ${vars.color.border.strong}, 0 0 32px rgba(112, 180, 76, 0.3)`,
});

export const previewCentered = style({
  width: "100%",
  height: "100%",
  objectFit: "fill",
});

export const previewCircularTile = style({
  position: "relative",
  borderRadius: "50%",
  boxShadow: `0 0 0 1px ${vars.color.border.strong}, 0 0 32px rgba(112, 180, 76, 0.3)`,
});

export const previewCircularTilePiece = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  objectFit: "fill",
  transformOrigin: "50% 50%",
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 320px",
  gap: "8px",
  "@media": {
    "(max-width: 1080px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const tableWrap = style({
  overflow: "auto",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.surface,
});

export const table = style({
  width: "100%",
  minWidth: "980px",
  borderCollapse: "collapse",
});

export const headCell = style({
  padding: "7px 9px",
  borderBottom: `1px solid ${vars.color.border.default}`,
  background: vars.color.background.app,
  color: vars.color.text.heading,
  fontSize: "0.76rem",
  textAlign: "left",
  textTransform: "uppercase",
});

export const cell = style({
  padding: "10px 12px",
  borderBottom: `1px solid ${vars.color.border.default}`,
  verticalAlign: "middle",
});

export const mono = style({
  overflowWrap: "anywhere",
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.82rem",
});

export const assetGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
  gap: "6px",
});

export const assetButton = style({
  display: "grid",
  gap: "5px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  padding: "6px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  cursor: "pointer",
  textAlign: "left",
});

export const assetButtonSelected = style([
  assetButton,
  {
    borderColor: vars.color.brand.primary,
    boxShadow: `0 0 0 1px ${vars.color.brand.primary}`,
  },
]);

export const thumbnail = style({
  width: "100%",
  aspectRatio: "1",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.surface,
  objectFit: "contain",
});

export const assetLabel = style({
  overflowWrap: "anywhere",
  color: vars.color.text.muted,
  fontSize: "0.78rem",
});

export const empty = style({
  color: vars.color.text.muted,
  fontSize: "0.9rem",
});

import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gridTemplateColumns: "320px minmax(0, 1fr)",
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

export const previewPanel = style([
  panel,
  {
    minHeight: "560px",
  },
]);

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

export const field = style({
  display: "grid",
  gap: "5px",
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

export const sliderRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 54px",
  gap: "8px",
  alignItems: "center",
});

export const slider = style({
  width: "100%",
  accentColor: vars.color.brand.primary,
});

export const sliderValue = style({
  display: "grid",
  placeItems: "center",
  minHeight: "28px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  background: vars.color.background.app,
  color: vars.color.text.heading,
  fontSize: "0.82rem",
  fontWeight: 800,
});

export const dropGrid = style({
  display: "grid",
  gap: "6px",
});

export const dropZone = style({
  display: "grid",
  gap: "4px",
  minHeight: "78px",
  border: `1px dashed ${vars.color.border.default}`,
  borderRadius: "4px",
  padding: "9px",
  background: vars.color.background.app,
  cursor: "pointer",
});

export const dropZoneActive = style({
  borderColor: vars.color.brand.primary,
  background: vars.color.background.surfaceHover,
});

export const dropLabel = style({
  color: vars.color.text.heading,
  fontSize: "0.9rem",
  fontWeight: 800,
});

export const dropMeta = style({
  color: vars.color.text.muted,
  fontSize: "0.78rem",
  overflowWrap: "anywhere",
});

export const fileInput = style({
  width: "100%",
  minWidth: 0,
  color: vars.color.text.muted,
  fontSize: "0.78rem",
});

export const layerList = style({
  display: "grid",
  gap: "6px",
});

export const layerRow = style({
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  padding: "7px",
  background: vars.color.background.app,
});

export const layerDetails = style({
  display: "grid",
  gap: "8px",
});

export const layerHeader = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "8px",
  alignItems: "center",
});

export const layerName = style({
  color: vars.color.text.heading,
  fontSize: "0.82rem",
  fontWeight: 800,
});

export const layerSource = style({
  color: vars.color.text.muted,
  fontSize: "0.76rem",
  overflowWrap: "anywhere",
});

export const zoomField = style({
  display: "grid",
  gap: "4px",
});

export const zoomLabel = style({
  color: vars.color.text.muted,
  fontSize: "0.68rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const clearButton = style({
  minHeight: "28px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "3px",
  padding: "4px 8px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontWeight: 800,
  selectors: {
    "&:disabled": {
      cursor: "default",
      opacity: 0.45,
    },
  },
});

export const previewStage = style({
  display: "grid",
  placeItems: "center",
  minHeight: "100%",
  overflow: "auto",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  background: vars.color.background.app,
});

export const previewSvg = style({
  display: "block",
  width: "min(76vw, 720px)",
  maxWidth: "100%",
  height: "auto",
  color: vars.color.brand.primary,
  imageRendering: "pixelated",
});

export const previewFallback = style({
  fill: vars.color.background.surfaceHover,
});

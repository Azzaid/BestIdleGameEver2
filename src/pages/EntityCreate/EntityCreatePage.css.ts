import {style} from "@vanilla-extract/css";
import {vars} from "../../theme/theme.css.ts";

export const page = style({
  display: "grid",
  gap: "10px",
  minHeight: "100%",
  padding: "12px",
  color: vars.color.text.primary,
});

export const formPanel = style({
  display: "grid",
  alignContent: "start",
  gap: "10px",
});

export const previewPanel = style({
  display: "grid",
  gap: "8px",
  minHeight: 0,
});

export const header = style({
  display: "grid",
  gap: "2px",
});

export const title = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "1.15rem",
});

export const subtitle = style({
  margin: 0,
  color: vars.color.text.muted,
});

export const section = style({
  display: "grid",
  gap: "8px",
  padding: "10px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  background: vars.color.background.surface,
});

export const sectionHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
});

export const sectionTitle = style({
  margin: 0,
  color: vars.color.text.heading,
  fontSize: "0.86rem",
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "8px",
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const field = style({
  display: "grid",
  gap: "4px",
});

export const fullWidth = style({
  gridColumn: "1 / -1",
});

export const label = style({
  color: vars.color.text.muted,
  fontSize: "0.68rem",
  fontWeight: 800,
  textTransform: "uppercase",
});

export const input = style({
  minHeight: "30px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "5px 7px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
});

export const textarea = style([
  input,
  {
    minHeight: "70px",
    resize: "vertical",
    fontFamily: "inherit",
  },
]);

export const toggle = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  minHeight: "30px",
  color: vars.color.text.primary,
  fontWeight: 700,
});

export const idPreview = style({
  minHeight: "30px",
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  overflowWrap: "anywhere",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "5px 7px",
  background: vars.color.background.app,
  color: vars.color.text.heading,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  fontSize: "0.85rem",
});

export const rowList = style({
  display: "grid",
  gap: "8px",
});

export const row = style({
  display: "grid",
  gridTemplateColumns: "minmax(150px, 1fr) minmax(180px, 1.2fr) repeat(2, minmax(90px, 0.6fr)) auto",
  gap: "6px",
  alignItems: "end",
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const effectRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(130px, 1fr)) repeat(3, minmax(80px, 0.6fr)) auto",
  gap: "6px",
  alignItems: "end",
  "@media": {
    "(max-width: 920px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const requirementRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(160px, 1fr) minmax(180px, 1.3fr) minmax(90px, 0.6fr) auto",
  gap: "6px",
  alignItems: "end",
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const idRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1fr) auto",
  gap: "6px",
  alignItems: "end",
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "30px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "5px 8px",
  background: vars.color.background.app,
  color: vars.color.text.primary,
  fontWeight: 800,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const primaryButton = style([
  button,
  {
    borderColor: vars.color.brand.primary,
    background: vars.color.brand.primary,
    color: vars.color.text.inverse,
    selectors: {
      "&:disabled": {
        cursor: "wait",
        opacity: 0.7,
      },
    },
  },
]);

export const dangerButton = style([
  button,
  {
    color: vars.color.state.error,
  },
]);

export const mono = style({
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
});

export const preview = style({
  minHeight: "120px",
  maxHeight: "360px",
  overflow: "auto",
  margin: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "10px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  fontSize: "0.8rem",
  lineHeight: 1.4,
});

export const previewToggle = style({
  display: "inline-flex",
  justifySelf: "start",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "30px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "5px 8px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  fontWeight: 800,
  cursor: "pointer",
});

export const hint = style({
  color: vars.color.text.muted,
  fontSize: "0.84rem",
});

export const saveRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "10px",
  flexWrap: "wrap",
});

export const statusText = style({
  color: vars.color.text.muted,
  fontSize: "0.86rem",
});

export const errorText = style({
  color: vars.color.state.error,
  fontSize: "0.86rem",
  fontWeight: 700,
});

export const multiSelect = style({
  display: "grid",
  gap: "6px",
  minHeight: "36px",
  minWidth: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "5px",
  background: vars.color.background.app,
});

export const chipList = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "5px",
});

export const chip = style({
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "999px",
  padding: "3px 7px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontSize: "0.78rem",
});

export const multiSearch = style({
  minWidth: 0,
  border: 0,
  outline: 0,
  background: "transparent",
  color: vars.color.text.primary,
});

export const optionList = style({
  display: "grid",
  gap: "3px",
  maxHeight: "170px",
  overflow: "auto",
});

export const option = style({
  border: 0,
  borderRadius: "4px",
  padding: "5px 7px",
  background: "transparent",
  color: vars.color.text.primary,
  cursor: "pointer",
  textAlign: "left",
  selectors: {
    "&:hover": {
      background: vars.color.background.surface,
    },
  },
});

export const visualAssetGrid = style({
  display: "grid",
  gridTemplateColumns: "minmax(220px, 0.9fr) minmax(240px, 1.1fr)",
  gap: "10px",
  "@media": {
    "(max-width: 720px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const spriteCard = style({
  position: "relative",
  display: "grid",
  gridTemplateRows: "96px auto auto",
  gap: "6px",
  alignItems: "center",
  justifyItems: "center",
  minHeight: "150px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "8px",
  background: vars.color.background.app,
});

export const spriteThumb = style({
  display: "block",
  width: "96px",
  height: "96px",
  objectFit: "contain",
  borderRadius: "6px",
  background: vars.color.background.surface,
});

export const spriteRemoveButton = style({
  position: "absolute",
  top: "6px",
  right: "6px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  border: `1px solid ${vars.color.state.error}`,
  borderRadius: "999px",
  background: vars.color.background.surface,
  color: vars.color.state.error,
  cursor: "pointer",
  fontWeight: 900,
  lineHeight: 1,
});

export const spriteCaption = style({
  width: "100%",
  overflowWrap: "anywhere",
  color: vars.color.text.muted,
  fontSize: "0.74rem",
  textAlign: "center",
});

export const spriteReplaceButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "28px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "4px 8px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  cursor: "pointer",
  fontSize: "0.78rem",
  fontWeight: 800,
});

export const spriteDropZone = style({
  display: "grid",
  placeItems: "center",
  gap: "4px",
  minHeight: "150px",
  border: `1px dashed ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "12px",
  background: vars.color.background.app,
  cursor: "pointer",
  textAlign: "center",
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const spriteDropTitle = style({
  color: vars.color.text.heading,
  fontWeight: 900,
});

export const requiredSpriteField = style({
  display: "grid",
  gap: "6px",
  minWidth: 0,
});

export const sourceSpriteList = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(240px, 1fr))",
  gap: "8px",
  "@media": {
    "(max-width: 760px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const requiredSpriteCard = style({
  display: "grid",
  gridTemplateColumns: "64px minmax(0, 1fr) auto",
  gap: "8px",
  alignItems: "center",
  minHeight: "82px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "8px",
  background: vars.color.background.app,
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "64px minmax(0, 1fr)",
    },
  },
});

export const requiredSpriteThumb = style({
  display: "block",
  width: "64px",
  height: "64px",
  objectFit: "contain",
  borderRadius: "6px",
  background: vars.color.background.surface,
});

export const requiredSpriteActions = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "6px",
  flexWrap: "wrap",
});

export const requiredSpriteDropZone = style({
  display: "grid",
  placeItems: "center",
  gap: "4px",
  minHeight: "82px",
  border: `1px dashed ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "10px",
  background: vars.color.background.app,
  cursor: "pointer",
  textAlign: "center",
  selectors: {
    "&:hover": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const fileInput = style({
  display: "none",
});

export const visualPreviewBox = style({
  display: "grid",
  alignContent: "start",
  gap: "8px",
  minHeight: "120px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "8px",
  padding: "8px",
  background: vars.color.background.app,
});

export const visualPreviewImage = style({
  display: "block",
  maxWidth: "100%",
  maxHeight: "180px",
  objectFit: "contain",
  borderRadius: "6px",
  background: vars.color.background.surface,
});

export const visualMetadataPreview = style({
  maxHeight: "180px",
  overflow: "auto",
  margin: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "6px",
  padding: "8px",
  background: vars.color.background.surface,
  color: vars.color.text.primary,
  fontSize: "0.76rem",
  lineHeight: 1.35,
});

import type {RootState} from "../../models/store/appStore.ts";

export const selectHexBackgroundEditorUpload = (state: RootState) => state.hexBackgroundEditor.upload;
export const selectHexBackgroundEditorFilters = (state: RootState) => state.hexBackgroundEditor.filters;

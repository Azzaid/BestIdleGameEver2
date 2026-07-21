import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {CITY_BIOMES, CITY_HEX_BACKGROUND_TYPES} from "../../models/city/hexBackgrounds.ts";
import type {
  HexBackgroundEditorFilters,
  HexBackgroundEditorState,
  HexBackgroundEditorUploadSelection,
} from "../../models/store/hexBackgroundEditor.ts";

const initialState: HexBackgroundEditorState = {
  upload: {
    type: CITY_HEX_BACKGROUND_TYPES.background,
    biome: CITY_BIOMES.plains,
    vector: "medieval",
  },
  filters: {
    query: "",
    type: "",
    biome: "",
    vector: "",
  },
};

const hexBackgroundEditorSlice = createSlice({
  name: "hexBackgroundEditor",
  initialState,
  reducers: {
    setHexBackgroundUploadSelection: (state, action: PayloadAction<Partial<HexBackgroundEditorUploadSelection>>) => {
      state.upload = {
        ...state.upload,
        ...action.payload,
      };
    },
    setHexBackgroundEditorFilters: (state, action: PayloadAction<Partial<HexBackgroundEditorFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
  },
});

export const {
  setHexBackgroundEditorFilters,
  setHexBackgroundUploadSelection,
} = hexBackgroundEditorSlice.actions;

export default hexBackgroundEditorSlice;

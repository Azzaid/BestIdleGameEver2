import type {DevelopmentVectorKey} from "../DevlopmentVector.ts";
import type {CityBiome, CityHexBackgroundType} from "../city/hexBackgrounds.ts";

export type HexBackgroundEditorUploadSelection = {
  type: CityHexBackgroundType;
  biome: CityBiome;
  vector: DevelopmentVectorKey;
};

export type HexBackgroundEditorFilters = {
  query: string;
  type: "" | CityHexBackgroundType;
  biome: "" | CityBiome;
  vector: "" | DevelopmentVectorKey;
};

export type HexBackgroundEditorState = {
  upload: HexBackgroundEditorUploadSelection;
  filters: HexBackgroundEditorFilters;
};

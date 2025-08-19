import type {RootState} from "../index.ts";

export const selectCityHexes = (state: RootState) => state.city.hexes;
export const selectCityCellRadius = (state: RootState) => state.city.cellRadius;
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export type IdAuditStatusFilter = "ok" | "missing" | "none" | "any";

export type IdAuditFiltersState = {
  search: string;
  categoryFilter: string;
  dataFilter: IdAuditStatusFilter;
  progressionFilter: IdAuditStatusFilter;
  assetFilter: IdAuditStatusFilter;
  problemsOnly: boolean;
};

export type DevToolsState = {
  idAudit: IdAuditFiltersState;
};

export const initialDevToolsState: DevToolsState = {
  idAudit: {
    search: "",
    categoryFilter: "all",
    dataFilter: "any",
    progressionFilter: "any",
    assetFilter: "any",
    problemsOnly: false,
  },
};

const devToolsSlice = createSlice({
  name: "devTools",
  initialState: initialDevToolsState,
  reducers: {
    setIdAuditFilters: (state, action: PayloadAction<Partial<IdAuditFiltersState>>) => {
      state.idAudit = {
        ...state.idAudit,
        ...action.payload,
      };
    },
  },
});

export const { setIdAuditFilters } = devToolsSlice.actions;

export default devToolsSlice;

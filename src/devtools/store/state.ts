import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export type IdAuditStatusFilter = "ok" | "missing" | "none" | "any";
export type IdAuditBaseColumnId = "category" | "path" | "id" | "name" | "data" | "progression" | "assets" | "notes" | "edit";

export type IdAuditFiltersState = {
  search: string;
  categoryFilter: string;
  dataFilter: IdAuditStatusFilter;
  progressionFilter: IdAuditStatusFilter;
  assetFilter: IdAuditStatusFilter;
  problemsOnly: boolean;
};

export type IdAuditColumnsState = {
  visibleBaseColumns: Record<IdAuditBaseColumnId, boolean>;
  visibleValueIds: Record<string, boolean>;
};

export type IdAuditState = IdAuditFiltersState & IdAuditColumnsState;

export type DevToolsState = {
  idAudit: IdAuditState;
};

export const idAuditBaseColumnIds: readonly IdAuditBaseColumnId[] = [
  "category",
  "path",
  "id",
  "name",
  "data",
  "progression",
  "assets",
  "notes",
  "edit",
];

export const defaultVisibleIdAuditBaseColumns = Object.fromEntries(
  idAuditBaseColumnIds.map(columnId => [columnId, true]),
) as Record<IdAuditBaseColumnId, boolean>;

export const initialDevToolsState: DevToolsState = {
  idAudit: {
    search: "",
    categoryFilter: "all",
    dataFilter: "any",
    progressionFilter: "any",
    assetFilter: "any",
    problemsOnly: false,
    visibleBaseColumns: defaultVisibleIdAuditBaseColumns,
    visibleValueIds: {},
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
    setIdAuditBaseColumnVisibility: (state, action: PayloadAction<{columnId: IdAuditBaseColumnId; visible: boolean}>) => {
      state.idAudit.visibleBaseColumns[action.payload.columnId] = action.payload.visible;
    },
    setIdAuditValueColumnVisibility: (state, action: PayloadAction<{valueId: string; visible: boolean}>) => {
      state.idAudit.visibleValueIds[action.payload.valueId] = action.payload.visible;
    },
    setAllIdAuditValueColumnVisibility: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.idAudit.visibleValueIds = action.payload;
    },
  },
});

export const {
  setAllIdAuditValueColumnVisibility,
  setIdAuditBaseColumnVisibility,
  setIdAuditFilters,
  setIdAuditValueColumnVisibility,
} = devToolsSlice.actions;

export default devToolsSlice;

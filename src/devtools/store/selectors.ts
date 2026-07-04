import type { DevToolsRootState } from "./index.ts";

export const selectIdAuditFilters = (state: DevToolsRootState) => state.idAudit;

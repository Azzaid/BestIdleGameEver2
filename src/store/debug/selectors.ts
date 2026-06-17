import type { RootState } from "../../models/store/appStore.ts";

export const selectIsDebugModeEnabled = (state: RootState): boolean => state.debug.enabled;

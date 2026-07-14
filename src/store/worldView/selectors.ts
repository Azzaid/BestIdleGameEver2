import type {RootState} from "../../models/store/appStore.ts";
import type {WorldViewMode} from "../../models/store/worldView.ts";

export const selectWorldViewMode = (state: RootState): WorldViewMode => state.worldView.mode;
export const selectIsCityViewMode = (state: RootState): boolean => state.worldView.mode === "city";
export const selectIsBattleViewMode = (state: RootState): boolean => state.worldView.mode === "battle";
export const selectIsTowerViewMode = (state: RootState): boolean => state.worldView.mode === "tower";

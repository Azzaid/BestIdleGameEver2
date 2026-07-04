import { configureStore } from "@reduxjs/toolkit";
import devToolsSlice from "./state.ts";
import { loadDevToolsState, saveDevToolsState } from "./persistence.ts";

export const devToolsStore = configureStore({
  reducer: devToolsSlice.reducer,
  preloadedState: loadDevToolsState(),
});

devToolsStore.subscribe(() => {
  saveDevToolsState(devToolsStore.getState());
});

export type DevToolsDispatch = typeof devToolsStore.dispatch;
export type DevToolsRootState = ReturnType<typeof devToolsStore.getState>;

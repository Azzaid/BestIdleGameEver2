import { useSyncExternalStore } from "react";
import { devToolsStore, type DevToolsDispatch, type DevToolsRootState } from "./index.ts";

export function useDevToolsDispatch(): DevToolsDispatch {
  return devToolsStore.dispatch;
}

export function useDevToolsSelector<TValue>(selector: (state: DevToolsRootState) => TValue): TValue {
  return useSyncExternalStore(
    devToolsStore.subscribe,
    () => selector(devToolsStore.getState()),
    () => selector(devToolsStore.getState()),
  );
}

import type { store } from '../../store/index.ts';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import type {RootState} from "../index.ts";

export const selectPurchasedTechsIds = (state: RootState): string[] => state.research.purchasedTechsIds;

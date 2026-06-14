import type {RootState} from "../../models/store/appStore.ts";

export const selectPurchasedTechsIds = (state: RootState): string[] => state.research.purchasedTechsIds;

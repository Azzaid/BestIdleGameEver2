import type {Requirement} from "../models/progression/requirements.ts";

export const requires = {
  buildingKeywordExists(keyword: string): Requirement {
    return {type: "buildingKeywordExists", keyword};
  },
  buildingExists(buildingId: string): Requirement {
    return {type: "buildingExists", buildingId};
  },
  technologyUnlocked(technologyId: string): Requirement {
    return {type: "technologyUnlocked", technologyId};
  },
  globalFlagExists(flagId: string): Requirement {
    return {type: "globalFlagExists", flagId};
  },
  globalFlagMissing(flagId: string): Requirement {
    return {type: "globalFlagMissing", flagId};
  },
  homogeneousValueAtLeast(valueId: string, amount: number): Requirement {
    return {type: "homogeneousValueAtLeast", valueId, amount};
  },
  homogeneousValueLessThan(valueId: string, amount: number): Requirement {
    return {type: "homogeneousValueLessThan", valueId, amount};
  },
};

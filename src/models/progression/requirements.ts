import type {CityResolution} from "../city/Adjancency.ts";

export type Requirement =
  | { type: "buildingKeywordExists"; keyword: string }
  | { type: "buildingExists"; buildingId: string }
  | { type: "technologyUnlocked"; technologyId: string }
  | { type: "homogeneousValueAtLeast"; valueId: string; amount: number }
  | { type: "homogeneousValueLessThan"; valueId: string; amount: number };

export type RequirementGate = {
  requirements?: Requirement[];
};

export type RequirementResolutionData = {
  resolvedCityData: CityResolution;
  unlockedTechnologyIds: ReadonlySet<string>;
};

export function areRequirementsMet(
  requirements: readonly Requirement[] | undefined,
  data: RequirementResolutionData,
): boolean {
  return (requirements ?? []).every((requirement) => isRequirementMet(requirement, data));
}

export function isRequirementMet(
  requirement: Requirement,
  data: RequirementResolutionData,
): boolean {
  if (requirement.type === "buildingKeywordExists") {
    return data.resolvedCityData.buildingKeywords.has(requirement.keyword);
  }

  if (requirement.type === "buildingExists") {
    return data.resolvedCityData.buildingIds.has(requirement.buildingId);
  }

  if (requirement.type === "technologyUnlocked") {
    return data.unlockedTechnologyIds.has(requirement.technologyId);
  }

  if (requirement.type === "homogeneousValueAtLeast") {
    return (data.resolvedCityData.homogeneousValues[requirement.valueId] ?? 0) >= requirement.amount;
  }

  return (data.resolvedCityData.homogeneousValues[requirement.valueId] ?? 0) < requirement.amount;
}

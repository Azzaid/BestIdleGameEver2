import {HOMOGENEOUS_VALUE_IDS} from "../homogeneousValues/index.ts";
import type {GlobalModifierDefinition} from "../../models/globalEvents.ts";

export const GLOBAL_MODIFIERS: Record<string, GlobalModifierDefinition> = {
  fungal_inheritance: {
    id: "fungal_inheritance",
    title: "Fungal Inheritance",
    description: "Carries a portion of each city's fungal production forward.",
    applyRules: [
      {
        type: "addHomogeneousValue",
        stateKey: "fungiBonus",
        valueId: HOMOGENEOUS_VALUE_IDS.resourceFungi,
        valueField: "produced",
        multiplier: 0.1,
      },
    ],
    effects: [
      {
        valueId: HOMOGENEOUS_VALUE_IDS.resourceFungi,
        additionalKeywords: ["production"],
        additive: {stateKey: "fungiBonus"},
          multiplier: 1,
      },
    ],
  },
};

export const GLOBAL_MODIFIER_LIST = Object.values(GLOBAL_MODIFIERS);

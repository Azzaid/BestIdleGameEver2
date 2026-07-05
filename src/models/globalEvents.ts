import type {HomogeneousValueEffect, HomogeneousValueId, HomogeneousValueTotals} from "./homogeneousValues.ts";
import type {HomogeneousValueEntitySource} from "./homogeneousValueResolution.ts";
import {areRequirementsMet, type Requirement, type RequirementResolutionData} from "./progression/requirements.ts";

type GlobalModifierValueField = "available" | "produced" | "upkeep";

export type GlobalEventTrigger =
  | {type: "manual"; triggerId?: string}
  | {type: "gameStarted"}
  | {type: "requirementsMet"}
  | {type: "cityAbandoned"}
  | {type: "cityExpanded"}
  | {type: "cityMigrated"}
  | {type: "migration"}
  | {type: "buildingConstructed"; buildingId?: string}
  | {type: "buildingDiscovered"; buildingId?: string}
  | {type: "siegeStarted"}
  | {type: "siegeSucceeded"}
  | {type: "siegeFailed"}
  | {type: "siegeEnded"}
  | {type: "technologyUnlocked"; technologyId?: string};

export type GlobalSignal = GlobalEventTrigger;

export type GlobalSignalRequirementSnapshot = {
  buildingIds: string[];
  buildingKeywords: string[];
  technologyIds: string[];
  globalFlagIds: string[];
  homogeneousValues: Record<string, number>;
};

export type GlobalSignalMessage = {
  signal: GlobalSignal;
  requirementSnapshot?: GlobalSignalRequirementSnapshot;
  modifierContext?: GlobalModifierApplyContext;
};

export type GlobalEventAction =
  | {type: "applyGlobalModifier"; modifierId: string}
  | {type: "removeGlobalModifier"; modifierId: string}
  | {type: "abandonCity"}
  | {type: "triggerEnding"; endingId: string}
  | {type: "showCutscene"; cutsceneId: string}
  | {type: "unlockTechnology"; technologyId: string}
  | {type: "addFlag"; flagId: string}
  | {type: "removeFlag"; flagId: string};

export type GlobalEventNotificationLevel = "silent" | "notify" | "force";

export type GlobalEventDefinition = {
  id: string;
  title: string;
  description?: string;
  notificationLevel?: GlobalEventNotificationLevel;
  hint?: string;
  eventsToForesee?: string[];
  imageSrc?: string;
  imageAlt?: string;
  trigger: GlobalEventTrigger;
  requirements?: Requirement[];
  requirement?: Requirement[];
  blockRequirements?: Requirement[];
  blockRequirement?: Requirement[];
  once?: boolean;
  priority?: number;
  actions: GlobalEventAction[];
};

export type GlobalModifierNumericTemplate =
  | number
  | {
    stateKey: string;
    multiplier?: number;
    additive?: number;
  };

export type EffectTemplate = Omit<HomogeneousValueEffect, "additive" | "multiplier"> & {
  additive?: GlobalModifierNumericTemplate | null;
  multiplier?: GlobalModifierNumericTemplate | null;
};

export type GlobalModifierApplyRule =
  | {
    type: "addHomogeneousValue";
    stateKey: string;
    valueId: HomogeneousValueId;
    valueField?: GlobalModifierValueField;
    multiplier?: number;
    additive?: number;
  }
  | {
    type: "addStateValue";
    stateKey: string;
    amount: number;
  }
  | {
    type: "setStateValue";
    stateKey: string;
    amount: number;
  }
  | {
    type: "maxStateValue";
    stateKey: string;
    amount: number;
  };

export type GlobalModifierDefinition = {
  id: string;
  title: string;
  description?: string;
  applyRules: GlobalModifierApplyRule[];
  effects: EffectTemplate[];
};

export type GlobalModifierState = {
  values: Record<string, number>;
};

export type GlobalModifierInstance = {
  modifierId: string;
  state: GlobalModifierState;
  appliedCount: number;
};

export type GlobalModifierApplyContext = {
  availableValues?: HomogeneousValueTotals;
  producedValues?: HomogeneousValueTotals;
  upkeepValues?: HomogeneousValueTotals;
};

export function getRunnableGlobalEvents(
  definitions: readonly GlobalEventDefinition[],
  trigger: GlobalEventTrigger,
  data: RequirementResolutionData,
  executedEventIds: ReadonlySet<string>,
): GlobalEventDefinition[] {
  return definitions
    .filter(definition => isGlobalEventRunnable(definition, trigger, data, executedEventIds))
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));
}

export function isGlobalEventRunnable(
  definition: GlobalEventDefinition,
  trigger: GlobalEventTrigger,
  data: RequirementResolutionData,
  executedEventIds: ReadonlySet<string>,
): boolean {
  if (definition.once && executedEventIds.has(definition.id)) return false;
  if (!doGlobalEventTriggersMatch(definition.trigger, trigger)) return false;
  if (!areRequirementsMet(getGlobalEventRequirements(definition), data)) return false;
  if (!areGlobalEventBlockRequirementsClear(definition, data)) return false;

  return true;
}

export function doGlobalEventTriggersMatch(
  definitionTrigger: GlobalEventTrigger,
  trigger: GlobalEventTrigger,
): boolean {
  if (definitionTrigger.type !== trigger.type) return false;

  if (definitionTrigger.type === "manual") {
    return definitionTrigger.triggerId === undefined
      || trigger.type === "manual" && definitionTrigger.triggerId === trigger.triggerId;
  }

  if (definitionTrigger.type === "technologyUnlocked") {
    return definitionTrigger.technologyId === undefined
      || trigger.type === "technologyUnlocked" && definitionTrigger.technologyId === trigger.technologyId;
  }

  if (definitionTrigger.type === "buildingConstructed") {
    return definitionTrigger.buildingId === undefined
      || trigger.type === "buildingConstructed" && definitionTrigger.buildingId === trigger.buildingId;
  }

  if (definitionTrigger.type === "buildingDiscovered") {
    return definitionTrigger.buildingId === undefined
      || trigger.type === "buildingDiscovered" && definitionTrigger.buildingId === trigger.buildingId;
  }

  return true;
}

export function applyGlobalModifierDefinition(
  definition: GlobalModifierDefinition,
  existingInstance: GlobalModifierInstance | undefined,
  context: GlobalModifierApplyContext,
): GlobalModifierInstance {
  const nextInstance: GlobalModifierInstance = {
    modifierId: definition.id,
    state: {
      values: {...(existingInstance?.state.values ?? {})},
    },
    appliedCount: existingInstance?.appliedCount ?? 0,
  };

  for (const rule of definition.applyRules) {
    applyGlobalModifierRule(nextInstance.state, rule, context);
  }

  nextInstance.appliedCount += 1;
  return nextInstance;
}

export function resolveGlobalModifierEffects(
  definition: GlobalModifierDefinition,
  instance: GlobalModifierInstance,
): HomogeneousValueEffect[] {
  return definition.effects.map(effect => ({
    ...effect,
    additive: resolveNumericTemplate(effect.additive, instance.state),
    multiplier: resolveNumericTemplate(effect.multiplier, instance.state),
  }));
}

export function createGlobalModifierHomogeneousEntities(
  definitions: Record<string, GlobalModifierDefinition>,
  instances: Record<string, GlobalModifierInstance>,
): HomogeneousValueEntitySource[] {
  return Object.values(instances)
    .map((instance): HomogeneousValueEntitySource | null => {
      const definition = definitions[instance.modifierId];
      if (!definition) return null;

      return {
        id: `globalModifier:${instance.modifierId}`,
        contentId: instance.modifierId,
        entityType: "globalModifier",
        keywords: ["globalModifier"],
        values: resolveGlobalModifierEffects(definition, instance),
      };
    })
    .filter((entity): entity is HomogeneousValueEntitySource => Boolean(entity));
}

function applyGlobalModifierRule(
  state: GlobalModifierState,
  rule: GlobalModifierApplyRule,
  context: GlobalModifierApplyContext,
): void {
  if (rule.type === "setStateValue") {
    state.values[rule.stateKey] = rule.amount;
    return;
  }

  if (rule.type === "addStateValue") {
    state.values[rule.stateKey] = getStateValue(state, rule.stateKey) + rule.amount;
    return;
  }

  if (rule.type === "maxStateValue") {
    state.values[rule.stateKey] = Math.max(getStateValue(state, rule.stateKey), rule.amount);
    return;
  }

  const sourceValue = getContextValue(context, rule.valueField ?? "available", rule.valueId);
  state.values[rule.stateKey] = getStateValue(state, rule.stateKey)
    + sourceValue * (rule.multiplier ?? 1)
    + (rule.additive ?? 0);
}

function getGlobalEventRequirements(definition: GlobalEventDefinition): readonly Requirement[] | undefined {
  return definition.requirements ?? definition.requirement;
}

function areGlobalEventBlockRequirementsClear(
  definition: GlobalEventDefinition,
  data: RequirementResolutionData,
): boolean {
  const blockRequirements = definition.blockRequirements ?? definition.blockRequirement;
  if (!blockRequirements || blockRequirements.length === 0) return true;

  return !areRequirementsMet(blockRequirements, data);
}

function resolveNumericTemplate(
  template: GlobalModifierNumericTemplate | null | undefined,
  state: GlobalModifierState,
): number | null | undefined {
  if (template === undefined || template === null || typeof template === "number") return template;

  return getStateValue(state, template.stateKey) * (template.multiplier ?? 1) + (template.additive ?? 0);
}

function getStateValue(state: GlobalModifierState, stateKey: string): number {
  return state.values[stateKey] ?? 0;
}

function getContextValue(
  context: GlobalModifierApplyContext,
  valueField: GlobalModifierValueField,
  valueId: HomogeneousValueId,
): number {
  if (valueField === "produced") return context.producedValues?.[valueId] ?? 0;
  if (valueField === "upkeep") return context.upkeepValues?.[valueId] ?? 0;

  return context.availableValues?.[valueId] ?? 0;
}

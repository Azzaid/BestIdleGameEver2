import type {GlobalModifierDefinition} from "../../models/globalEvents.ts";
import globalModifierDefinitions from "./modifiers.json";

export const GLOBAL_MODIFIERS: Record<string, GlobalModifierDefinition> = Object.fromEntries(
  (globalModifierDefinitions as GlobalModifierDefinition[]).map(definition => [definition.id, definition]),
);

export const GLOBAL_MODIFIER_LIST = Object.values(GLOBAL_MODIFIERS);

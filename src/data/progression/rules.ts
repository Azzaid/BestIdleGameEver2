import {defineProgression} from "./progression.ts";
import {AETHER_PROGRESSION_RULES} from "./rules/aether.ts";
import {MEDIEVAL_PROGRESSION_RULES} from "./rules/medieval.ts";
import {NATURE_PROGRESSION_RULES} from "./rules/nature.ts";
import {TECH_PROGRESSION_RULES} from "./rules/tech.ts";

export const PROGRESSION_RULES = defineProgression([
  ...MEDIEVAL_PROGRESSION_RULES,
  ...NATURE_PROGRESSION_RULES,
  ...AETHER_PROGRESSION_RULES,
  ...TECH_PROGRESSION_RULES,
]);

import {aetherTechnologies} from "./aether.ts";
import {medievalTechnologies} from "./medieval.ts";
import {natureTechnologies} from "./nature.ts";
import {techTechnologies} from "./tech.ts";

export const technologies = {
  tech: techTechnologies,
  nature: natureTechnologies,
  medieval: medievalTechnologies,
  aether: aetherTechnologies,
} as const;

export const technologyIds = Object.values(technologies).flatMap(group => Object.values(group));

/*
Checklist when adding a technology id:
1. Add the id here, in the vector file that owns it.
2. Add the research node under src/data/research/<vector>.ts using this identifier.
3. Add its progression rule in src/data/progression/rules/<vector>.ts.
4. Add unlock rules for buildings, tower parts, structures, or later systems it enables.
5. Keep parentId / alsoRequires aligned with progression requirements.
6. Open /progression and /ids to check graph and registry validation.
*/

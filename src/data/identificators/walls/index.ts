import {aetherWalls} from "./aether.ts";
import {medievalWalls} from "./medieval.ts";
import {natureWalls} from "./nature.ts";
import {techWalls} from "./tech.ts";

export const walls = {
  tech: techWalls,
  nature: natureWalls,
  medieval: medievalWalls,
  aether: aetherWalls,
} as const;

export const wallIds = Object.values(walls).flatMap(group => Object.values(group));

/*
Checklist when adding a wall segment id:
1. Add the id here, in the vector file that owns it.
2. Add the WallBuilding definition under src/data/wall/segments/<vector>.ts using this identifier.
3. Check wall selectors, wall resolution, and battle pressure behavior.
4. Add unlock rules once wall segment progression is gated.
5. Open /city and /ids to check that the id has data.
*/

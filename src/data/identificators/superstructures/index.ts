import {aetherSuperstructures} from "./aether.ts";
import {medievalSuperstructures} from "./medieval.ts";
import {natureSuperstructures} from "./nature.ts";
import {techSuperstructures} from "./tech.ts";

export const superstructures = {
  tech: techSuperstructures,
  nature: natureSuperstructures,
  medieval: medievalSuperstructures,
  aether: aetherSuperstructures,
} as const;

export const superstructureIds = Object.values(superstructures).flatMap(group => Object.values(group));

/*
Checklist when adding a wall superstructure id:
1. Add the id here, in the vector file that owns it.
2. Add the WallBuilding definition under src/data/wallSuperstructures/<vector>.ts using this identifier.
3. Check city wall-top build controls and wall resolution behavior.
4. Add unlock rules once superstructure progression is gated.
5. Open /city and /ids to check that the id has data.
*/

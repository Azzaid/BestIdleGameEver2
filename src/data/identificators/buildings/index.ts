import {aetherBuildings} from "./aether.ts";
import {medievalBuildings} from "./medieval.ts";
import {natureBuildings} from "./nature.ts";
import {techBuildings} from "./tech.ts";

export const buildings = {
  tech: techBuildings,
  nature: natureBuildings,
  medieval: medievalBuildings,
  aether: aetherBuildings,
} as const;

export const buildingIds = Object.values(buildings).flatMap(group => Object.values(group));

/*
Checklist when adding a building id:
1. Add the id here, in the vector file that owns it.
2. Add the building definition under src/data/buildings/<vector>.ts using this identifier.
3. Add or update unlock rules in src/data/progression/rules/<vector>.ts when the building is gated.
4. Add structure adjacency references in src/data/buildings/<vector>.ts when the building participates in a multistructure.
5. Add a sprite mapping under src/models/sprites/buildings when the building needs art.
6. Open /ids and check that the row has data, unlocks, and asset status you expect.
*/

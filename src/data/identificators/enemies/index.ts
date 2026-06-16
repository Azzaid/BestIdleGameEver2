import {wastelandEnemies} from "./wasteland.ts";

export const enemies = {
  wasteland: wastelandEnemies,
} as const;

export const enemyIds = Object.values(enemies).flatMap(group => Object.values(group));

/*
Checklist when adding an enemy id:
1. Add the id here, in the biome file that owns it.
2. Add the EnemyBlueprint under src/data/enemies/<biome>.ts using this identifier.
3. Add or update spawn pools, wave planning, or biome/region links when those systems exist.
4. Add sprite assets and texture keys for battle rendering.
5. Open /battle and /ids to check that the id has data and expected assets.
*/

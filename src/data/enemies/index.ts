import type {EnemyBlueprint, EnemyBlueprintAtlas} from "../../models/battle/enemyBlueprints.ts";
import {wastelandEnemies} from "./wasteland.ts";

export const BATTLE_ENEMY_BLUEPRINTS_ATLAS: EnemyBlueprintAtlas = {
  wasteland: wastelandEnemies,
};

export const BATTLE_ENEMY_BLUEPRINTS: Record<string, EnemyBlueprint> = Object.values(BATTLE_ENEMY_BLUEPRINTS_ATLAS).reduce(
  (allEnemies, enemies) => ({...allEnemies, ...enemies}),
  {},
);

export const BATTLE_ENEMY_IDS = Object.keys(BATTLE_ENEMY_BLUEPRINTS);

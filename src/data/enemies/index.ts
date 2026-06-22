import type {EnemyBlueprint, EnemyBlueprintAtlas} from "../../models/battle/enemyBlueprints.ts";
import wastelandEnemyDefinitions from "./wasteland.json";

type EnemyDefinition = Omit<EnemyBlueprint, "keywords" | "createMovement"> & {
  keywords: string[];
  movement?: {
    kind: "wallboundWobble";
    speedPixelsPerSecond: number;
    wobbleAmplitudePixels?: number;
  };
};

export const BATTLE_ENEMY_BLUEPRINTS_ATLAS: EnemyBlueprintAtlas = {
  wasteland: buildEnemies(wastelandEnemyDefinitions as EnemyDefinition[]),
};

export const BATTLE_ENEMY_BLUEPRINTS: Record<string, EnemyBlueprint> = Object.values(BATTLE_ENEMY_BLUEPRINTS_ATLAS).reduce(
  (allEnemies, enemies) => ({...allEnemies, ...enemies}),
  {},
);

export const BATTLE_ENEMY_IDS = Object.keys(BATTLE_ENEMY_BLUEPRINTS);

function buildEnemies(definitions: readonly EnemyDefinition[]): Record<string, EnemyBlueprint> {
  return Object.fromEntries(definitions.map(definition => [
    definition.id,
    {
      ...definition,
      keywords: new Set(definition.keywords),
      createMovement: createMovement(definition),
    },
  ]));
}

function createMovement(definition: EnemyDefinition): EnemyBlueprint["createMovement"] {
  if (definition.movement?.kind !== "wallboundWobble") {
    throw new Error(`Enemy "${definition.id}" is missing a supported movement definition.`);
  }

  const {speedPixelsPerSecond, wobbleAmplitudePixels = 0} = definition.movement;

  return (spawnX, _spawnY, world) => ({
    kind: "wobble",
    baseSpeedPixelsPerSecond: speedPixelsPerSecond,
    wobbleAmplitudePixels,
    wobbleFrequencyHz: 0.25,
    timeAliveSeconds: 0,
    goalY: world.config.wallContactY,
    initialX: spawnX,
  });
}

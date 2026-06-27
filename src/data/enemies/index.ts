import type {EnemyBlueprint, EnemyBlueprintAtlas} from "../../models/battle/enemyBlueprints.ts";
import wastelandEnemyDefinitions from "./wasteland.json";
import {ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY} from "./visuals.ts";

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
      sprite: {
        ...definition.sprite,
        targetSpriteSize: ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY[definition.sprite.textureKey]?.metadata?.targetSpriteSize,
        rotationDegrees: ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY[definition.sprite.textureKey]?.metadata?.rotationDegrees,
      },
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

  return (spawnX, _spawnY, world, modifiers) => ({
    kind: "wobble",
    baseSpeedPixelsPerSecond: speedPixelsPerSecond * (modifiers?.speedMultiplier ?? 1),
    wobbleAmplitudePixels,
    wobbleFrequencyHz: 0.25 * (modifiers?.wobbleFrequencyMultiplier ?? 1),
    timeAliveSeconds: modifiers?.wobblePhaseOffsetSeconds ?? 0,
    goalY: world.config.wallContactY,
    initialX: spawnX,
  });
}

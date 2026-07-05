import type {EnemyBlueprint, EnemyBlueprintAtlas} from "../../models/battle/enemyBlueprints.ts";
import wastelandEnemyDefinitions from "./wasteland.json";
import {ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY} from "./visuals.ts";

type EnemyMovementKind = "wallboundWobble" | "straight" | "randomLines" | "blink";

type EnemyDefinition = Omit<EnemyBlueprint, "keywords" | "createMovement"> & {
  keywords: string[];
  movement?: {
    kind: EnemyMovementKind;
    speedPixelsPerSecond: number;
    wobbleAmplitudePixels?: number;
    sameTrajectoryTimeSeconds?: number;
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
  if (!definition.movement) {
    throw new Error(`Enemy "${definition.id}" is missing a supported movement definition.`);
  }

  const {
    kind,
    speedPixelsPerSecond,
    wobbleAmplitudePixels = 0,
    sameTrajectoryTimeSeconds = 1,
  } = definition.movement;

  switch (kind) {
    case "wallboundWobble":
      return (spawnX, _spawnY, world, modifiers) => ({
        kind: "wobble",
        baseSpeedPixelsPerSecond: speedPixelsPerSecond * (modifiers?.speedMultiplier ?? 1),
        wobbleAmplitudePixels,
        wobbleFrequencyHz: 0.25 * (modifiers?.wobbleFrequencyMultiplier ?? 1),
        timeAliveSeconds: modifiers?.wobblePhaseOffsetSeconds ?? 0,
        goalY: world.config.wallContactY,
        initialX: spawnX,
      });
    case "straight":
      return (_spawnX, _spawnY, _world, modifiers) => ({
        kind: "linear",
        velocityPixelsPerSecond: {
          x: 0,
          y: speedPixelsPerSecond * (modifiers?.speedMultiplier ?? 1),
        },
      });
    case "randomLines":
      return (_spawnX, _spawnY, world, modifiers) => ({
        kind: "polyline",
        speedPixelsPerSecond: speedPixelsPerSecond * (modifiers?.speedMultiplier ?? 1),
        lateralSpeedPixelsPerSecond: wobbleAmplitudePixels,
        sameTrajectoryTimeSeconds: Math.max(0.05, sameTrajectoryTimeSeconds),
        trajectoryRemainingSeconds: 0,
        currentTarget: null,
        bounds: {
          x0: 24,
          y0: -48,
          x1: world.config.battlefieldWidth - 24,
          y1: world.config.wallContactY,
        },
      });
    case "blink":
      return (_spawnX, _spawnY, world, modifiers) => ({
        kind: "blink",
        driftVelocity: {
          x: 0,
          y: speedPixelsPerSecond * (modifiers?.speedMultiplier ?? 1),
        },
        blinkDistancePixels: Math.max(12, wobbleAmplitudePixels * 2),
        blinkCooldownSeconds: 1.4,
        blinkRemainingSeconds: 0.7 + Math.random() * 0.7,
        bounds: {
          x0: 24,
          y0: -48,
          x1: world.config.battlefieldWidth - 24,
          y1: world.config.wallContactY,
        },
      });
    default: {
      const unsupportedKind: never = kind;
      throw new Error(`Enemy "${definition.id}" has unsupported movement kind "${unsupportedKind}".`);
    }
  }
}

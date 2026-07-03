import * as PIXI from 'pixi.js';
import type {
  TowerVisualDefinition,
  TowerVisualNodeDefinition,
  TowerVisualPartDefinition,
  TowerVisualPoint,
  TowerVisualRenderOptions,
  TowerVisualSize,
  BuiltTowerVisualContainer,
} from '../../../models/battle/towerVisual.ts';

const defaultFallbackSize: TowerVisualSize = { width: 56, height: 36 };

function getSafePoint(point: TowerVisualPoint | undefined, warningMessage: string, warn: (message: string) => void) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    warn(warningMessage);
    return { x: 0, y: 0 };
  }

  return point;
}

function canUseSprite(part: TowerVisualPartDefinition, warn: (message: string) => void) {
  const spriteInfo = part.sprite;
  if (!spriteInfo) return false;

  const keys = spriteInfo.animated && spriteInfo.animationFrames?.length
    ? spriteInfo.animationFrames
    : [spriteInfo.textureKey];

  const missingKeys = keys.filter((key) => !PIXI.Assets.cache.has(key));
  if (missingKeys.length > 0) {
    warn(`Tower visual part "${part.id}" is missing sprite asset(s): ${missingKeys.join(', ')}. Using fallback visual.`);
    return false;
  }

  return true;
}

function createFallbackPartDisplay(
  part: TowerVisualPartDefinition,
  options: Required<TowerVisualRenderOptions>
) {
  const size = part.fallbackSize ?? defaultFallbackSize;
  const display = new PIXI.Container();

  const body = new PIXI.Graphics();
  body
    .rect(-size.width / 2, -size.height / 2, size.width, size.height)
    .fill(options.fallbackFillColor)
    .stroke({ color: options.fallbackBorderColor, width: 2 });
  display.addChild(body);

  const label = new PIXI.Text({
    text: part.id,
    style: {
      fill: options.fallbackTextColor,
      fontFamily: 'Arial, sans-serif',
      fontSize: 9,
      fontWeight: '700',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: Math.max(20, size.width - 8),
    },
  });
  label.anchor.set(0.5);
  display.addChild(label);

  return display;
}

function createPartDisplay(
  part: TowerVisualPartDefinition,
  options: Required<TowerVisualRenderOptions>
) {
  const display = new PIXI.Container();

  if (canUseSprite(part, options.warn) && part.sprite) {
    if (part.sprite.animated && part.sprite.animationFrames?.length) {
      const frames = part.sprite.animationFrames.map((key) => PIXI.Texture.from(key));
      const animatedSprite = new PIXI.AnimatedSprite(frames);
      animatedSprite.anchor.set(0.5);
      animatedSprite.rotation = (part.rotationDegrees ?? 0) * Math.PI / 180;
      if (part.targetSpriteSize) {
        animatedSprite.width = part.targetSpriteSize.width;
        animatedSprite.height = part.targetSpriteSize.height;
      }
      animatedSprite.animationSpeed = (part.sprite.fps ?? 8) / 60;
      animatedSprite.play();
      display.addChild(animatedSprite);
      return display;
    }

    const sprite = new PIXI.Sprite(PIXI.Texture.from(part.sprite.textureKey));
    sprite.anchor.set(0.5);
    sprite.rotation = (part.rotationDegrees ?? 0) * Math.PI / 180;
    if (part.targetSpriteSize) {
      sprite.width = part.targetSpriteSize.width;
      sprite.height = part.targetSpriteSize.height;
    }
    display.addChild(sprite);
    return display;
  }

  return createFallbackPartDisplay(part, options);
}

function buildNode(
  nodeDefinition: TowerVisualNodeDefinition,
  options: Required<TowerVisualRenderOptions>,
  partContainers: Map<string, PIXI.Container>,
  rootContainer: PIXI.Container,
  nodePosition: TowerVisualPoint
) {
  const part = nodeDefinition.part;
  const partContainer = new PIXI.Container();
  partContainer.sortableChildren = true;
  partContainer.zIndex = part.renderLayer ?? 0;
  partContainer.label = part.id;
  partContainer.position.set(nodePosition.x, nodePosition.y);

  if (part.visible !== false) {
    const partDisplay = createPartDisplay(part, options);
    partContainer.addChild(partDisplay);
  }
  partContainers.set(part.id, partContainer);
  rootContainer.addChild(partContainer);

  for (const attachment of nodeDefinition.attachments ?? []) {
    const parentSocketPosition = getSafePoint(
      part.outputSockets[attachment.parentSocket],
      `Tower visual part "${part.id}" is missing output socket "${attachment.parentSocket}". Using part origin.`,
      options.warn
    );
    const childRootSocketPosition = getSafePoint(
      attachment.child.part.rootSocket,
      `Tower visual part "${attachment.child.part.id}" has an invalid root socket. Using part origin.`,
      options.warn
    );

    buildNode(
      attachment.child,
      options,
      partContainers,
      rootContainer,
      {
        x: nodePosition.x + parentSocketPosition.x - childRootSocketPosition.x,
        y: nodePosition.y + parentSocketPosition.y - childRootSocketPosition.y,
      }
    );
  }

  return partContainer;
}

export function buildTowerVisualContainer(
  towerVisualDefinition: TowerVisualDefinition,
  renderOptions: TowerVisualRenderOptions = {}
): BuiltTowerVisualContainer {
  const options: Required<TowerVisualRenderOptions> = {
    warn: renderOptions.warn ?? console.warn,
    fallbackFillColor: renderOptions.fallbackFillColor ?? 0x31415f,
    fallbackBorderColor: renderOptions.fallbackBorderColor ?? 0xd9e2ff,
    fallbackTextColor: renderOptions.fallbackTextColor ?? 0xffffff,
  };

  const container = new PIXI.Container();
  container.sortableChildren = true;

  const partContainers = new Map<string, PIXI.Container>();
  buildNode(towerVisualDefinition.root, options, partContainers, container, { x: 0, y: 0 });

  return { container, partContainers };
}

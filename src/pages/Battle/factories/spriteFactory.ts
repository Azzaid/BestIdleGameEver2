import * as PIXI from 'pixi.js';
import type { SpriteInfo } from '../../../models/battle/spriteInfo.ts';

/** Creates a static Sprite or AnimatedSprite from SpriteInfo. */
export function createDisplayFromSpriteInfo(info: SpriteInfo): PIXI.ContainerChild {
  const keys = info.animated && info.animationFrames?.length ? info.animationFrames : [info.textureKey];
  const hasAllTextures = keys.every((key) => PIXI.Assets.cache.has(key));
  const display = new PIXI.Container();

  if (!hasAllTextures) {
    const gfx = new PIXI.Graphics();
    gfx.circle(0, 0, 12).fill(0xd9e2ff).stroke({ color: 0x31415f, width: 2 });
    display.addChild(gfx);
    return display;
  }

  if (info.animated && info.animationFrames && info.animationFrames.length > 0) {
    const frames = info.animationFrames.map(k => PIXI.Texture.from(k));
    const anim = new PIXI.AnimatedSprite(frames);
    anim.anchor.set(0.5);
    anim.animationSpeed = (info.fps ?? 8) / 60;
    applySpriteVisualMetadata(anim, info);
    anim.play();
    display.addChild(anim);
    return display;
  } else {
    const sprite = new PIXI.Sprite(PIXI.Texture.from(info.textureKey));
    sprite.anchor.set(0.5);
    applySpriteVisualMetadata(sprite, info);
    display.addChild(sprite);
    return display;
  }
}

function applySpriteVisualMetadata(sprite: PIXI.Sprite | PIXI.AnimatedSprite, info: SpriteInfo) {
  sprite.rotation = (info.rotationDegrees ?? 0) * Math.PI / 180;

  if (info.targetSpriteSize) {
    sprite.width = info.targetSpriteSize.width;
    sprite.height = info.targetSpriteSize.height;
  }
}

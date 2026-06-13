import * as PIXI from 'pixi.js';
import type { SpriteInfo } from '../../../models/battle/spriteInfo.ts';

/** Creates a static Sprite or AnimatedSprite from SpriteInfo. */
export function createDisplayFromSpriteInfo(info: SpriteInfo): PIXI.ContainerChild {
  const keys = info.animated && info.animationFrames?.length ? info.animationFrames : [info.textureKey];
  const hasAllTextures = keys.every((key) => PIXI.Assets.cache.has(key));

  if (!hasAllTextures) {
    const gfx = new PIXI.Graphics();
    gfx.circle(0, 0, 12).fill(0xd9e2ff).stroke({ color: 0x31415f, width: 2 });
    return gfx;
  }

  if (info.animated && info.animationFrames && info.animationFrames.length > 0) {
    const frames = info.animationFrames.map(k => PIXI.Texture.from(k));
    const anim = new PIXI.AnimatedSprite(frames);
    anim.anchor.set(0.5);
    anim.animationSpeed = (info.fps ?? 8) / 60;
    anim.play();
    return anim;
  } else {
    const sprite = new PIXI.Sprite(PIXI.Texture.from(info.textureKey));
    sprite.anchor.set(0.5);
    return sprite;
  }
}

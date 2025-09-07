import * as PIXI from 'pixi.js';
import { SpriteInfo } from '../../../models/battle/spriteInfo.ts';

/** Creates a static Sprite or AnimatedSprite from SpriteInfo. */
export function createDisplayFromSpriteInfo(info: SpriteInfo): PIXI.DisplayObject {
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

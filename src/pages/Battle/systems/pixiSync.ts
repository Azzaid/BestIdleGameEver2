import * as PIXI from 'pixi.js';
import { World } from '../core/world';

/** Minimal sync: ensure every entity with Transform has a placeholder sprite until you attach real ones. */
export function PixiSyncSystem(world: World) {
  for (const [entityId, tf] of world.transforms) {
    let display = world.sprites.get(entityId);
    if (!display) {
      const gfx = new PIXI.Graphics();
      gfx.beginFill(0xffffff).drawRect(-16, -16, 32, 32).endFill();
      const sprite = world.config.app.renderer.generateTexture(gfx);
      const sp = new PIXI.Sprite(sprite);
      sp.anchor.set(0.5);
      sp.zIndex = 5;
      world.worldLayer.addChild(sp);
      world.sprites.set(entityId, sp);
      display = sp;
    }
    (display as any).position?.set(tf.position.x, tf.position.y);
    (display as any).rotation = tf.rotationRadians ?? 0;
  }
}

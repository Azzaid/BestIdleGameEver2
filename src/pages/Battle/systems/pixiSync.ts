import * as PIXI from 'pixi.js';
import type { World } from '../../../models/battle/world.ts';

/** Minimal sync: ensure every entity with Transform has a placeholder sprite until you attach real ones. */
export function PixiSyncSystem(world: World) {
  for (const [entityId, tf] of world.transforms) {
    let display = world.sprites.get(entityId);
    if (!display) {
      const gfx = new PIXI.Graphics();
      gfx.rect(-16, -16, 32, 32).fill(0xffffff);
      gfx.zIndex = 5;
      world.worldLayer.addChild(gfx);
      world.sprites.set(entityId, gfx);
      display = gfx;
    }
    display.position.set(tf.position.x, tf.position.y);
    display.rotation = world.enemiesData.has(entityId) ? 0 : tf.rotationRadians ?? 0;
    const enemy = world.enemiesData.get(entityId);
    if (enemy) {
      display.alpha = enemy.cloakRange > 0 ? enemy.cloakVisibility : 1;
    }
  }
}

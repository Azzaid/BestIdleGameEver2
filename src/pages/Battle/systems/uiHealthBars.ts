import * as PIXI from 'pixi.js';
import type { World } from '../../../models/battle/world.ts';

/** Tiny HP bar above enemies. */
export function HealthBarSystem(world: World) {
  for (const [enemyId, enemy] of world.enemiesData) {
    const tf = world.transforms.get(enemyId);
    const hp = world.healths.get(enemyId);
    if (!tf || !hp) continue;

    let bar = world.healthBars.get(enemyId);
    if (!bar) {
      bar = new PIXI.Graphics();
      bar.zIndex = 100;
      world.worldLayer.addChild(bar);
      world.healthBars.set(enemyId, bar);
    }
    const width = Math.max(24, Math.min(48, enemy.hitRadius * 2));
    const height = 3;
    const x = tf.position.x - width / 2;
    const y = tf.position.y - (enemy.hitRadius + 10);

    const ratio = Math.max(0, Math.min(1, hp.hitPoints / hp.maxHitPoints));
    bar.clear();
    bar.beginFill(0x000000, 0.6).drawRect(x, y, width, height).endFill();
    bar.beginFill(0x3ad66e).drawRect(x, y, width * ratio, height).endFill();
  }
}

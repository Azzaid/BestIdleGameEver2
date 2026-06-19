import type { World } from '../../../models/battle/world.ts';

export function MovementSystem(world: World, dt: number) {
  for (const [id, mv] of world.movements) {
    const tf = world.transforms.get(id);
    if (!tf) continue;

    switch (mv.kind) {
      case 'linear': {
        tf.position.x += mv.velocityPixelsPerSecond.x * dt;
        tf.position.y += mv.velocityPixelsPerSecond.y * dt;
        tf.rotationRadians = Math.atan2(mv.velocityPixelsPerSecond.y, mv.velocityPixelsPerSecond.x);
        break;
      }
      case 'wobble': {
        mv.timeAliveSeconds += dt;
        tf.position.y += mv.baseSpeedPixelsPerSecond * dt;
        const offset = Math.sin(mv.timeAliveSeconds * 2 * Math.PI * mv.wobbleFrequencyHz) * mv.wobbleAmplitudePixels;
        tf.position.x = mv.initialX + offset;
        tf.rotationRadians = Math.PI / 2;
        break;
      }
      case 'polyline': {
        const wp = mv.waypoints[mv.currentIndex];
        if (wp) {
          const dx = wp.x - tf.position.x;
          const dy = wp.y - tf.position.y;
          const dist = Math.hypot(dx, dy);
          const step = mv.speedPixelsPerSecond * dt;
          if (dist <= step) {
            tf.position.x = wp.x; tf.position.y = wp.y; mv.currentIndex++;
          } else {
            tf.position.x += (dx / dist) * step;
            tf.position.y += (dy / dist) * step;
          }
          tf.rotationRadians = Math.atan2(dy, dx);
        }
        break;
      }
      case 'wander': {
        mv.retargetRemainingSeconds -= dt;
        if (mv.retargetRemainingSeconds <= 0 || !mv.currentTarget) {
          mv.retargetRemainingSeconds = mv.retargetCooldownSeconds;
          const angle = Math.random() * Math.PI * 2;
          const r = mv.jitterRadius;
          mv.currentTarget = { x: tf.position.x + Math.cos(angle) * r, y: tf.position.y + Math.sin(angle) * r };
        }
        const dx = mv.currentTarget.x - tf.position.x;
        const dy = mv.currentTarget.y - tf.position.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1e-3) {
          const step = mv.speedPixelsPerSecond * dt;
          const ux = dx / dist, uy = dy / dist;
          tf.position.x += ux * step; tf.position.y += uy * step;
          tf.rotationRadians = Math.atan2(uy, ux);
        }
        break;
      }
      case 'flee': {
        const dx = tf.position.x - mv.threatPoint.x;
        const dy = tf.position.y - mv.threatPoint.y;
        const dist = Math.hypot(dx, dy) || 1;
        tf.position.x += (dx / dist) * mv.speedPixelsPerSecond * dt;
        tf.position.y += (dy / dist) * mv.speedPixelsPerSecond * dt;
        tf.rotationRadians = Math.atan2(dy, dx);
        break;
      }
      case 'blink': {
        mv.blinkRemainingSeconds -= dt;
        tf.position.x += mv.driftVelocity.x * dt;
        tf.position.y += mv.driftVelocity.y * dt;
        if (mv.blinkRemainingSeconds <= 0) {
          mv.blinkRemainingSeconds = mv.blinkCooldownSeconds;
          const angle = Math.random() * Math.PI * 2;
          const nx = tf.position.x + Math.cos(angle) * mv.blinkDistancePixels;
          const ny = tf.position.y + Math.sin(angle) * mv.blinkDistancePixels;
          if (mv.bounds) {
            tf.position.x = Math.max(mv.bounds.x0, Math.min(nx, mv.bounds.x1));
            tf.position.y = Math.max(mv.bounds.y0, Math.min(ny, mv.bounds.y1));
          } else {
            tf.position.x = nx; tf.position.y = ny;
          }
        }
        break;
      }
    }

    stopEnemyAtWall(world, id);
  }
}

function stopEnemyAtWall(world: World, id: number) {
  const enemy = world.enemiesData.get(id);
  const tf = world.transforms.get(id);
  if (!enemy || !tf) return;

  const wallContactY = world.config.wallContactY - enemy.hitRadius;
  if (tf.position.y < wallContactY) return;

  tf.position.y = wallContactY;
  tf.rotationRadians = Math.PI / 2;
  world.movements.delete(id);
}

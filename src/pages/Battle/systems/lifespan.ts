import { World } from '../core/world';

export function LifespanSystem(world: World, dt: number) {
  for (const [id, life] of world.lifespans) {
    life.remainingSeconds -= dt;
    if (life.remainingSeconds <= 0) world.toRemove.add(id);
  }
}

import type { MovementController } from './movement.ts';

export type EnemyKind = 'melee' | 'ranged';
export type EnemyMode = 'walk' | 'attack';

export interface EnemyData {
  name: string;
  kind: EnemyKind;
  mode: EnemyMode;
  hitRadius: number;       // used for collision + hp bar width
  shotDistance?: number;   // for ranged pressure threshold
  pressure: number;        // siege pressure contribution
  keywords: Set<string>;   // e.g. "armored", "flying"
  walkMovement: MovementController;
  attackMovement: MovementController;
}

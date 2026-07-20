import type { MovementController } from './movement.ts';

export type EnemyKind = 'melee' | 'ranged';
export type EnemyMode = 'walk' | 'attack';

export interface EnemyData {
  name: string;
  kind: EnemyKind;
  mode: EnemyMode;
  hitRadius: number;       // used for collision + hp bar width
  cloakRange: number;      // distance from battlefield top before targetable
  cloakVisibility: number; // 0 transparent, 1 fully revealed
  shotDistance?: number;   // for ranged pressure threshold
  pressure: number;        // siege pressure contribution
  strengthCost: number;    // wave budget contribution used by siege progress
  keywords: Set<string>;   // e.g. "armored", "flying"
  walkMovement: MovementController;
  attackMovement: MovementController;
}

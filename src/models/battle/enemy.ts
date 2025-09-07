export type EnemyKind = 'melee' | 'ranged';

export interface EnemyData {
  name: string;
  kind: EnemyKind;
  hitRadius: number;       // used for collision + hp bar width
  shotDistance?: number;   // for ranged pressure threshold
  pressure: number;        // siege pressure contribution
  keywords: Set<string>;   // e.g. "armored", "flying"
}

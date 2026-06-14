import type { EnemyData } from './enemy.ts';

export interface ProjectileForDamage {
  baseDamage: number;
  keywords: Set<string>;
}

export type DamageModifier = (raw: number, proj: ProjectileForDamage, enemy: EnemyData) => number;

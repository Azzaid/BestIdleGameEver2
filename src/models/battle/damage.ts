import type { EnemyData } from './enemy.ts';
import type { Health } from './health.ts';

export interface ProjectileForDamage {
  baseDamage: number;
  keywords: Set<string>;
}

export type DamageModifier = (
  raw: number,
  proj: ProjectileForDamage,
  enemy: EnemyData,
  health: Health,
) => number;

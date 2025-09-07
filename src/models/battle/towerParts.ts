import type { GunSlotDirection } from './tower.ts';
import type { SpriteInfo } from './spriteInfo.ts';

export interface TowerModifiers {
  rotationSpeed: number;
  reloadSpeed: number;
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  aoeRadius: number;
  targetingDistanceLimit: number;
  retargetCooldownSeconds: number;
}

export interface GunPart {
  id: string;
  name: string;
  sprite: SpriteInfo;
  attachmentOffset: { x: number; y: number };
  keywords: Set<string>;
  modifiers?: Partial<TowerModifiers>;
  children?: GunPart[]; // chain within a slot
}

export interface TowerBuild {
  slots: Partial<Record<GunSlotDirection, GunPart[]>>;
}

export interface TowerStatsResolved {
  rotationSpeed: number;
  reloadSpeed: number;
  burstCount: number;
  projectileDamage: number;
  projectileSpeed: number;
  aoeRadius: number;
  targetingDistanceLimit: number;
  retargetCooldownSeconds: number;
  keywords: Set<string>;
}

export const BASE_TOWER: TowerStatsResolved = {
  rotationSpeed: 2.5,
  reloadSpeed: 1.0,
  burstCount: 1,
  projectileDamage: 10,
  projectileSpeed: 500,
  aoeRadius: 0,
  targetingDistanceLimit: 360,
  retargetCooldownSeconds: 0.25,
  keywords: new Set(),
};

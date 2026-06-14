import type { GunSlotDirection } from './tower.ts';
import type { SpriteInfo } from './spriteInfo.ts';

export interface PartVisual {
  id: string;
  sprite: SpriteInfo;
  attachmentOffset: { x: number; y: number };
}

export interface GunVisualBuild {
  slots: Partial<Record<GunSlotDirection, PartVisual[]>>;
  origin: { x: number; y: number };
}

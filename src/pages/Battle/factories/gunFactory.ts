import * as PIXI from 'pixi.js';
import { GunSlotDirection } from '../../../models/battle/tower.ts';
import { SpriteInfo } from '../../../models/battle/spriteInfo.ts';
import { createDisplayFromSpriteInfo } from './spriteFactory';

/** Visual-only representation of a gun built from slot chains. */
export interface PartVisual {
  id: string;
  sprite: SpriteInfo;
  attachmentOffset: { x: number; y: number };
}

export interface GunVisualBuild {
  slots: Partial<Record<GunSlotDirection, PartVisual[]>>;
  /** World position of slot-0 root (used as shared pivot origin). */
  origin: { x: number; y: number };
}

/** Composes a PIXI.Container for the gun. Children are placed per slot chain with cumulative offsets. */
export function createGunContainer(build: GunVisualBuild): { container: PIXI.Container; partNodes: Map<string, PIXI.DisplayObject> } {
  const container = new PIXI.Container();
  container.sortableChildren = true;
  // We treat container position = origin; rotation around this origin
  container.position.set(build.origin.x, build.origin.y);
  const partNodes = new Map<string, PIXI.DisplayObject>();

  const slotDirs: GunSlotDirection[] = [0, 1, 2, 3];
  for (const dir of slotDirs) {
    const chain = build.slots[dir];
    if (!chain || chain.length === 0) continue;

    // Each slot gets its own sub-container so we can debug/animate per slot if needed
    const slotContainer = new PIXI.Container();
    slotContainer.position.set(0, 0);
    container.addChild(slotContainer);

    let cursorX = 0;
    let cursorY = 0;

    for (const part of chain) {
      const node = createDisplayFromSpriteInfo(part.sprite);
      node.position.set(cursorX, cursorY);
      slotContainer.addChild(node);
      partNodes.set(part.id, node);
      cursorX += part.attachmentOffset.x;
      cursorY += part.attachmentOffset.y;
    }
  }

  return { container, partNodes };
}

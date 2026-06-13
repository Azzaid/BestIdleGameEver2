import type { SpriteInfo } from './spriteInfo.ts';

export interface TowerVisualPoint {
  x: number;
  y: number;
}

export interface TowerVisualSize {
  width: number;
  height: number;
}

export interface TowerVisualPartDefinition {
  id: string;
  sprite?: SpriteInfo;
  rootSocket: TowerVisualPoint;
  outputSockets: Record<string, TowerVisualPoint>;
  fallbackSize?: TowerVisualSize;
  renderLayer?: number;
}

export interface TowerVisualAttachmentDefinition {
  parentSocket: string;
  child: TowerVisualNodeDefinition;
}

export interface TowerVisualNodeDefinition {
  part: TowerVisualPartDefinition;
  attachments?: TowerVisualAttachmentDefinition[];
}

export interface TowerVisualDefinition {
  root: TowerVisualNodeDefinition;
}

import type * as PIXI from 'pixi.js';
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
  visible?: boolean;
  rootSocket: TowerVisualPoint;
  outputSockets: Record<string, TowerVisualPoint>;
  targetSpriteSize?: TowerVisualSize;
  rotationDegrees?: number;
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

export type VisualSlotLayout = Pick<TowerVisualPartDefinition, 'rootSocket' | 'outputSockets' | 'targetSpriteSize' | 'fallbackSize' | 'renderLayer'>;

export interface TowerVisualRenderOptions {
  warn?: (message: string) => void;
  fallbackFillColor?: number;
  fallbackBorderColor?: number;
  fallbackTextColor?: number;
}

export interface BuiltTowerVisualContainer {
  container: PIXI.Container;
  partContainers: Map<string, PIXI.Container>;
}

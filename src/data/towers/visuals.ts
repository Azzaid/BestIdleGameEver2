import type { TowerAssemblyResolved, TowerPartSlot } from '../../models/battle/towerParts.ts';
import type {
  TowerVisualAttachmentDefinition,
  TowerVisualNodeDefinition,
  TowerVisualPartDefinition,
  TowerVisualDefinition,
  VisualSlotLayout,
} from '../../models/battle/towerVisual.ts';

const slotVisualLayouts: Record<TowerPartSlot, VisualSlotLayout> = {
  base: {
    rootSocket: { x: 0, y: 18 },
    outputSockets: {
      barrel: { x: 0, y: -34 },
      aimSystem: { x: 0, y: -52 },
      loadingSystem: { x: -38, y: -20 },
      launchSystem: { x: 38, y: -20 },
    },
    fallbackSize: { width: 120, height: 38 },
    renderLayer: 0,
  },
  barrel: {
    rootSocket: { x: -42, y: 0 },
    outputSockets: {
      ammo: { x: -8, y: 0 },
      barrelAttachment: { x: 48, y: 0 },
    },
    fallbackSize: { width: 104, height: 22 },
    renderLayer: 4,
  },
  ammo: {
    rootSocket: { x: 0, y: 0 },
    outputSockets: {},
    fallbackSize: { width: 30, height: 30 },
    renderLayer: 3,
  },
  aimSystem: {
    rootSocket: { x: 0, y: 18 },
    outputSockets: {},
    fallbackSize: { width: 58, height: 32 },
    renderLayer: 5,
  },
  barrelAttachment: {
    rootSocket: { x: -18, y: 0 },
    outputSockets: {},
    fallbackSize: { width: 38, height: 26 },
    renderLayer: 6,
  },
  loadingSystem: {
    rootSocket: { x: 18, y: 0 },
    outputSockets: {},
    fallbackSize: { width: 48, height: 34 },
    renderLayer: 2,
  },
  launchSystem: {
    rootSocket: { x: -18, y: 0 },
    outputSockets: {},
    fallbackSize: { width: 48, height: 34 },
    renderLayer: 2,
  },
};

function createVisualPartForSlot(slot: TowerPartSlot, resolvedTower: TowerAssemblyResolved): TowerVisualPartDefinition {
  const selectedPart = resolvedTower.selectedParts[slot];
  const layout = slotVisualLayouts[slot];

  return {
    id: selectedPart?.id ?? `empty_${slot}`,
    sprite: selectedPart?.sprite,
    ...layout,
  };
}

function createNodeForSlot(slot: TowerPartSlot, resolvedTower: TowerAssemblyResolved): TowerVisualNodeDefinition {
  return {
    part: createVisualPartForSlot(slot, resolvedTower),
  };
}

export function createTowerVisualDefinitionFromAssembly(
  resolvedTower: TowerAssemblyResolved
): TowerVisualDefinition {
  const barrelNode = createNodeForSlot('barrel', resolvedTower);
  barrelNode.attachments = [
    {
      parentSocket: 'ammo',
      child: createNodeForSlot('ammo', resolvedTower),
    },
    {
      parentSocket: 'barrelAttachment',
      child: createNodeForSlot('barrelAttachment', resolvedTower),
    },
  ];

  const baseAttachments: TowerVisualAttachmentDefinition[] = [
    {
      parentSocket: 'barrel',
      child: barrelNode,
    },
    {
      parentSocket: 'aimSystem',
      child: createNodeForSlot('aimSystem', resolvedTower),
    },
    {
      parentSocket: 'loadingSystem',
      child: createNodeForSlot('loadingSystem', resolvedTower),
    },
    {
      parentSocket: 'launchSystem',
      child: createNodeForSlot('launchSystem', resolvedTower),
    },
  ];

  return {
    root: {
      part: createVisualPartForSlot('base', resolvedTower),
      attachments: baseAttachments,
    },
  };
}

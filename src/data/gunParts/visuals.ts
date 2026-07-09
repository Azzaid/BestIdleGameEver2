import type { TowerAssemblyResolved, TowerPartSlot } from '../../models/battle/towerParts.ts';
import type {
  TowerVisualAttachmentDefinition,
  TowerVisualNodeDefinition,
  TowerVisualPartDefinition,
  TowerVisualDefinition,
  VisualSlotLayout,
} from '../../models/battle/towerVisual.ts';
import { TOWER_PART_VISUAL_METADATA } from './partVisualMetadata.ts';
import { DEFAULT_TOWER_PART_Z_INDEX } from './renderLayers.ts';

const slotVisualLayouts: Record<TowerPartSlot, VisualSlotLayout> = {
  platform: {
    rootSocket: { x: 0, y: 18 },
    outputSockets: {},
    renderLayer: DEFAULT_TOWER_PART_Z_INDEX.platform,
  },
  barrel: {
    rootSocket: { x: -42, y: 0 },
    outputSockets: {
      barrelAttachment: { x: 48, y: 0 },
      muzzle: { x: 56, y: 0 },
    },
    renderLayer: DEFAULT_TOWER_PART_Z_INDEX.barrel,
  },
  ammo: {
    rootSocket: { x: 0, y: 0 },
    outputSockets: {},
    renderLayer: DEFAULT_TOWER_PART_Z_INDEX.ammo,
  },
  aimSystem: {
    rootSocket: { x: 0, y: 18 },
    outputSockets: {},
    renderLayer: DEFAULT_TOWER_PART_Z_INDEX.aimSystem,
  },
  barrelAttachment: {
    rootSocket: { x: -18, y: 0 },
    outputSockets: {},
    renderLayer: DEFAULT_TOWER_PART_Z_INDEX.barrelAttachment,
  },
  loadingSystem: {
    rootSocket: { x: 18, y: 0 },
    outputSockets: {},
    renderLayer: DEFAULT_TOWER_PART_Z_INDEX.loadingSystem,
  },
  launchSystem: {
    rootSocket: { x: 0, y: 0 },
    outputSockets: {
      platform: { x: -38, y: 20 },
      ammo: { x: -52, y: -20 },
      barrel: { x: 38, y: -18 },
      aimSystem: { x: 0, y: -52 },
      loadingSystem: { x: -38, y: -8 },
    },
    renderLayer: DEFAULT_TOWER_PART_Z_INDEX.launchSystem,
  },
};

function createVisualPartForSlot(slot: TowerPartSlot, resolvedTower: TowerAssemblyResolved): TowerVisualPartDefinition {
  const selectedPart = resolvedTower.selectedParts[slot];
  const layout = slotVisualLayouts[slot];
  const visualTextureKey = selectedPart?.sprite.textureKey ?? selectedPart?.id;
  const visualMetadata = visualTextureKey ? TOWER_PART_VISUAL_METADATA[visualTextureKey] : undefined;

  return {
    id: selectedPart?.id ?? `empty_${slot}`,
    sprite: selectedPart?.sprite,
    ...layout,
    renderLayer: selectedPart?.zIndex ?? layout.renderLayer,
    rootSocket: visualMetadata?.inputSocket ?? layout.rootSocket,
    outputSockets: {
      ...layout.outputSockets,
      ...visualMetadata?.outputSockets,
    },
    sourceSpriteSize: visualMetadata?.sourceSpriteSize,
    zoom: visualMetadata?.zoom,
    rotationDegrees: visualMetadata?.rotationDegrees,
  };
}

function createNodeForInstalledSlot(
  slot: TowerPartSlot,
  resolvedTower: TowerAssemblyResolved
): TowerVisualNodeDefinition | undefined {
  if (!resolvedTower.selectedParts[slot]) return undefined;

  return {
    part: createVisualPartForSlot(slot, resolvedTower),
  };
}

function createRootNode(resolvedTower: TowerAssemblyResolved): TowerVisualNodeDefinition {
  if (resolvedTower.selectedParts.launchSystem) {
    return {
      part: createVisualPartForSlot('launchSystem', resolvedTower),
    };
  }

  const launchSystemLayout = slotVisualLayouts.launchSystem;

  return {
    part: {
      id: 'tower_visual_anchor',
      visible: false,
      ...launchSystemLayout,
    },
  };
}

function createAttachment(
  parentSocket: string,
  child: TowerVisualNodeDefinition | undefined
): TowerVisualAttachmentDefinition | undefined {
  if (!child) return undefined;

  return {
    parentSocket,
    child,
  };
}

function compactAttachments(
  attachments: Array<TowerVisualAttachmentDefinition | undefined>
): TowerVisualAttachmentDefinition[] | undefined {
  const installedAttachments = attachments.filter((attachment): attachment is TowerVisualAttachmentDefinition => Boolean(attachment));
  return installedAttachments.length > 0 ? installedAttachments : undefined;
}

export function createTowerVisualDefinitionFromAssembly(
  resolvedTower: TowerAssemblyResolved
): TowerVisualDefinition {
  const barrelNode = createNodeForInstalledSlot('barrel', resolvedTower);

  if (barrelNode) {
    barrelNode.attachments = compactAttachments([
      createAttachment('barrelAttachment', createNodeForInstalledSlot('barrelAttachment', resolvedTower)),
    ]);
  }

  const rootNode = createRootNode(resolvedTower);
  rootNode.attachments = compactAttachments([
    createAttachment('platform', createNodeForInstalledSlot('platform', resolvedTower)),
    createAttachment('ammo', createNodeForInstalledSlot('ammo', resolvedTower)),
    createAttachment('barrel', barrelNode),
    createAttachment('aimSystem', createNodeForInstalledSlot('aimSystem', resolvedTower)),
    createAttachment('loadingSystem', createNodeForInstalledSlot('loadingSystem', resolvedTower)),
  ]);

  return {
    root: rootNode,
  };
}

export function findTowerVisualSocketOffset(
  towerVisualDefinition: TowerVisualDefinition,
  partId: string,
  socketName: string
) {
  function findInNode(node: TowerVisualNodeDefinition, nodeOffset: { x: number; y: number }): { x: number; y: number } | undefined {
    if (node.part.id === partId) {
      const socket = node.part.outputSockets[socketName];
      if (socket) {
        return {
          x: nodeOffset.x + socket.x,
          y: nodeOffset.y + socket.y,
        };
      }
    }

    for (const attachment of node.attachments ?? []) {
      const parentSocket = node.part.outputSockets[attachment.parentSocket];
      if (!parentSocket) continue;

      const childRootSocket = attachment.child.part.rootSocket;
      const childOffset = {
        x: nodeOffset.x + parentSocket.x - childRootSocket.x,
        y: nodeOffset.y + parentSocket.y - childRootSocket.y,
      };
      const found = findInNode(attachment.child, childOffset);
      if (found) return found;
    }

    return undefined;
  }

  return findInNode(towerVisualDefinition.root, { x: 0, y: 0 });
}

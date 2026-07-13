import type { TowerAssemblyResolved } from '../battle/towerParts.ts';
import type { BattlefieldTerrainHex } from '../battle/battlefieldTerrain.ts';
import type { BattleWallSegment } from '../battle/wallSegment.ts';

export interface TowerAssemblyPreviewProps {
  resolvedTower: TowerAssemblyResolved;
  wallSegments: BattleWallSegment[];
  terrainHexes: readonly BattlefieldTerrainHex[];
  towerWorldPosition: { x: number; y: number };
  wallY: number;
}

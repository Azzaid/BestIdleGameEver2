import type { HexCell } from './HexGrid.ts';
import type { WallBuilding, WallResolution } from './Wall.ts';
import type { PlacedBuilding } from './Building.ts';
import type { StructureDetectionResult } from './multistructureDetection.ts';

export type SelectedHexPanelProps = {
    selectedHex: HexCell;
    selectedBuilding?: PlacedBuilding;
    selectedWallBuilding?: WallBuilding;
    selectedWallTopBuilding?: WallBuilding;
    structureCandidates: StructureDetectionResult[];
    isPartOfCompleteStructure: boolean;
    wallResolution: WallResolution;
    blocked: boolean;
    blockedReason: string;
    onDemolish: () => void;
};

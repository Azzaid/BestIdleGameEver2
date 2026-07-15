import type { HexCell } from './HexGrid.ts';
import type { WallBuilding, WallResolution } from './Wall.ts';
import type { PlacedBuilding } from './Building.ts';
import type { HomogeneousResolvedEntity } from '../homogeneousValueResolution.ts';
import type { DevelopmentVectorValue } from '../DevlopmentVector.ts';

export type SelectedHexPanelProps = {
    selectedHex: HexCell;
    selectedBuilding?: PlacedBuilding;
    selectedResolvedEntity?: HomogeneousResolvedEntity;
    selectedWallBuilding?: WallBuilding;
    selectedWallTopBuilding?: WallBuilding;
    panelVector?: DevelopmentVectorValue;
    isPartOfCompleteStructure: boolean;
    wallResolution: WallResolution;
    blocked: boolean;
    blockedReason: string;
    isLost: boolean;
    lostReason: string;
    emphasizeEditWallTopTower?: boolean;
    onClose: () => void;
    onDemolish: () => void;
    onDemolishWallTop: () => void;
    onEditWallTopTower: () => void;
};

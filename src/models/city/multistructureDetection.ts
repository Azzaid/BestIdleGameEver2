import type {StructureDefinition} from "../../data/structures/index.ts";
import type {HexCell} from "./HexGrid.ts";

export type StructureRequirementMatch = {
    buildingId: string;
    hex: HexCell;
};

export type StructureDetectionResult = {
    structure: StructureDefinition;
    coreHex: HexCell;
    matchedSatellites: StructureRequirementMatch[];
    missingBuildingIds: string[];
    isComplete: boolean;
};

export function detectMultistructures(
    hexes: readonly HexCell[],
    structures: readonly StructureDefinition[],
): StructureDetectionResult[] {
    return structures.flatMap(structure => {
        return hexes
            .filter(hex => isCityBuilding(hex, structure.coreBuildingId))
            .map(coreHex => detectStructureAtCore(hexes, structure, coreHex));
    });
}

export function getCompleteStructureIds(
    hexes: readonly HexCell[],
    structures: readonly StructureDefinition[],
): Set<string> {
    return new Set(
        detectMultistructures(hexes, structures)
            .filter(result => result.isComplete)
            .map(result => result.structure.id),
    );
}

function detectStructureAtCore(
    hexes: readonly HexCell[],
    structure: StructureDefinition,
    coreHex: HexCell,
): StructureDetectionResult {
    const adjacentHexes = hexes.filter(hex => {
        return hex.kind === "city"
            && hex.cellKey !== coreHex.cellKey
            && getAxialDistance(coreHex, hex) === 1;
    });

    const availableByBuildingId = new Map<string, HexCell[]>();
    adjacentHexes.forEach(hex => {
        if (!hex.buildingKey) return;

        const matches = availableByBuildingId.get(hex.buildingKey) ?? [];
        matches.push(hex);
        availableByBuildingId.set(hex.buildingKey, matches);
    });

    const usedHexKeys = new Set<string>();
    const matchedSatellites: StructureRequirementMatch[] = [];
    const missingBuildingIds: string[] = [];

    structure.requiredAdjacentBuildingIds.forEach(buildingId => {
        const match = availableByBuildingId
            .get(buildingId)
            ?.find(hex => !usedHexKeys.has(hex.cellKey));

        if (!match) {
            missingBuildingIds.push(buildingId);
            return;
        }

        usedHexKeys.add(match.cellKey);
        matchedSatellites.push({buildingId, hex: match});
    });

    return {
        structure,
        coreHex,
        matchedSatellites,
        missingBuildingIds,
        isComplete: missingBuildingIds.length === 0,
    };
}

function isCityBuilding(hex: HexCell, buildingId: string): boolean {
    return hex.kind === "city" && hex.buildingKey === buildingId;
}

function getAxialDistance(a: HexCell, b: HexCell): number {
    const deltaColumn = a.column - b.column;
    const deltaRow = a.row - b.row;
    return (Math.abs(deltaColumn) + Math.abs(deltaRow) + Math.abs(deltaColumn + deltaRow)) / 2;
}

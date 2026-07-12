import type {StructureDefinition} from "../../data/buildings/index.ts";
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

type StructureComponentCandidate = {
    buildingId: string;
    hexes: HexCell[];
    representativeHex: HexCell;
};

export function detectMultistructures(
    hexes: readonly HexCell[],
    structures: readonly StructureDefinition[],
): StructureDetectionResult[] {
    const resultsByKey = new Map<string, StructureDetectionResult>();
    const components = getBaseBuildingComponents(hexes);

    for (const structure of structures) {
        const coreCandidates = components.filter(component => structure.requiredBuildingIds.includes(component.buildingId));

        for (const coreCandidate of coreCandidates) {
            const result = detectStructureAtCore(components, structure, coreCandidate);
            const key = getResultKey(result);
            const existing = resultsByKey.get(key);

            if (!existing || (!existing.isComplete && result.isComplete)) {
                resultsByKey.set(key, result);
            }
        }
    }

    return [...resultsByKey.values()];
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

function getBaseBuildingComponents(hexes: readonly HexCell[]): StructureComponentCandidate[] {
    const structureComponents = new Map<string, HexCell[]>();
    const normalComponents = hexes.flatMap(hex => {
        if (hex.isUnclaimed || hex.isLost || hex.kind !== "city" || !hex.buildingKey) return [];
        if (hex.partOfStructureId) {
            const coreCellKey = hex.structureCoreCellKey ?? hex.cellKey;
            structureComponents.set(coreCellKey, [
                ...(structureComponents.get(coreCellKey) ?? []),
                hex,
            ]);
            return [];
        }

        return [{
            buildingId: hex.buildingKey,
            hexes: [hex],
            representativeHex: hex,
        }];
    });

    return [
        ...normalComponents,
        ...[...structureComponents.entries()].flatMap(([coreCellKey, componentHexes]) => {
            const representativeHex = componentHexes.find(hex => hex.cellKey === coreCellKey) ?? componentHexes[0];
            if (!representativeHex?.partOfStructureId) return [];

            return [{
                buildingId: representativeHex.partOfStructureId,
                hexes: componentHexes,
                representativeHex,
            }];
        }),
    ];
}

function detectStructureAtCore(
    components: readonly StructureComponentCandidate[],
    structure: StructureDefinition,
    coreCandidate: StructureComponentCandidate,
): StructureDetectionResult {
    const usedHexKeys = new Set(coreCandidate.hexes.map(hex => hex.cellKey));
    const matchedComponents: StructureComponentCandidate[] = [coreCandidate];
    const missingBuildingIds = [...structure.requiredBuildingIds];
    const consumedCoreIndex = missingBuildingIds.indexOf(coreCandidate.buildingId);
    const matchedSatellites: StructureRequirementMatch[] = [];

    if (consumedCoreIndex === -1) {
        return {
            structure,
            coreHex: coreCandidate.representativeHex,
            matchedSatellites,
            missingBuildingIds,
            isComplete: false,
        };
    }

    missingBuildingIds.splice(consumedCoreIndex, 1);
    matchedSatellites.push(...coreCandidate.hexes
        .filter(hex => hex.cellKey !== coreCandidate.representativeHex.cellKey)
        .map(hex => ({
            buildingId: coreCandidate.buildingId,
            hex,
        })));

    for (let index = 0; index < missingBuildingIds.length; index++) {
        const buildingId = missingBuildingIds[index];
        const match = components.find(component => {
            return component.buildingId === buildingId
                && !component.hexes.some(hex => usedHexKeys.has(hex.cellKey))
                && matchedComponents.some(matchedComponent => areComponentsAdjacent(matchedComponent, component));
        });

        if (!match) continue;

        for (const hex of match.hexes) {
            usedHexKeys.add(hex.cellKey);
            matchedSatellites.push({
                buildingId,
                hex,
            });
        }
        matchedComponents.push(match);
        missingBuildingIds.splice(index, 1);
        index--;
    }

    return {
        structure,
        coreHex: coreCandidate.representativeHex,
        matchedSatellites,
        missingBuildingIds,
        isComplete: missingBuildingIds.length === 0,
    };
}

function areComponentsAdjacent(a: StructureComponentCandidate, b: StructureComponentCandidate): boolean {
    return a.hexes.some(aHex => (
        b.hexes.some(bHex => getAxialDistance(aHex, bHex) === 1)
    ));
}

function getResultKey(result: StructureDetectionResult): string {
    const hexKeys = [
        result.coreHex.cellKey,
        ...result.matchedSatellites.map(match => match.hex.cellKey),
    ].sort();

    return `${result.structure.id}:${hexKeys.join("|")}`;
}

function getAxialDistance(a: HexCell, b: HexCell): number {
    const deltaColumn = a.column - b.column;
    const deltaRow = a.row - b.row;
    return (Math.abs(deltaColumn) + Math.abs(deltaRow) + Math.abs(deltaColumn + deltaRow)) / 2;
}

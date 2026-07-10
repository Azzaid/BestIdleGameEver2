import type {AxialCoordinate, HexCell} from "./HexGrid.ts";
import type {CityFrontierRadii} from "../store/city.ts";

type CubeAxis = "x" | "y" | "z";
type FrontierSide = "max" | "min";
type CityExpansionSideDefinition = {
    id: string;
    label: string;
    shortLabel: string;
    radiusKey: keyof CityFrontierRadii;
    rotationDegrees: number;
    cubeAxis: CubeAxis;
    frontierSide: FrontierSide;
};

export const CITY_EXPANSION_SIDES = [
    {id: "east", label: "Expand east", shortLabel: "E", radiusKey: "east", rotationDegrees: 60, cubeAxis: "x", frontierSide: "max"},
    {id: "south-east", label: "Expand south-east", shortLabel: "SE", radiusKey: "southEast", rotationDegrees: 180, cubeAxis: "z", frontierSide: "max"},
    {id: "south-west", label: "Expand south-west", shortLabel: "SW", radiusKey: "southWest", rotationDegrees: 300, cubeAxis: "y", frontierSide: "max"},
    {id: "west", label: "Expand west", shortLabel: "W", radiusKey: "west", rotationDegrees: 240, cubeAxis: "x", frontierSide: "min"},
    {id: "north-west", label: "Expand north-west", shortLabel: "NW", radiusKey: "northWest", rotationDegrees: 0, cubeAxis: "z", frontierSide: "min"},
    {id: "north-east", label: "Expand north-east", shortLabel: "NE", radiusKey: "northEast", rotationDegrees: 120, cubeAxis: "y", frontierSide: "min"},
] as const satisfies readonly CityExpansionSideDefinition[];

export type CityExpansionSideId = typeof CITY_EXPANSION_SIDES[number]["id"];

export type CityExpansionSide = typeof CITY_EXPANSION_SIDES[number];

export type CityExpansionOption = {
    side: CityExpansionSide;
    boundaryHexes: HexCell[];
    hexes: HexCell[];
    addedHexCount: number;
    arrowCoordinate: AxialCoordinate;
};

export function getCityExpansionOptions(
    hexes: readonly HexCell[],
    maxDistance: number,
    frontiers: CityFrontierRadii,
): CityExpansionOption[] {
    const hexesByKey = new Map(hexes.map(hex => [getAxialCoordinateKey(hex), hex]));

    return CITY_EXPANSION_SIDES.map(side => {
        const nextRadius = frontiers[side.radiusKey] + 1;
        const boundaryHexes = getSideSectorCoordinates(side, frontiers[side.radiusKey])
            .map(coordinate => hexesByKey.get(getAxialCoordinateKey(coordinate)))
            .filter((hex): hex is HexCell => Boolean(hex))
            .filter(hex => !hex.isUnclaimed);
        const candidateCoordinates = getSideSectorCoordinates(side, nextRadius);
        const candidateResults = candidateCoordinates.map(candidateCoordinate => {
            const candidate = hexesByKey.get(getAxialCoordinateKey(candidateCoordinate));
            if (!candidate) return {valid: false, hex: undefined};
            if (getAxialDistance(candidate, {column: 0, row: 0}) > maxDistance) return {valid: false, hex: undefined};
            if (!canClaimAgainstTopFrontier(candidateCoordinate, side, frontiers)) {
                return {valid: true, hex: undefined};
            }

            return {
                valid: true,
                hex: candidate.isUnclaimed ? candidate : undefined,
            };
        });
        const candidateHexes = candidateResults.flatMap(result => result.hex ? [result.hex] : []);
        const completeCandidateHexes = candidateResults.every(result => result.valid)
            ? candidateHexes
            : [];

        return {
            side,
            boundaryHexes,
            hexes: completeCandidateHexes,
            addedHexCount: completeCandidateHexes.length,
            arrowCoordinate: getSideArrowCoordinate(side, nextRadius),
        };
    });
}

export function getExpandedCityFrontiers(
    frontiers: CityFrontierRadii,
    sideId: CityExpansionSideId,
): CityFrontierRadii {
    const side = CITY_EXPANSION_SIDES.find(side => side.id === sideId);
    if (!side) return frontiers;

    return {
        ...frontiers,
        [side.radiusKey]: frontiers[side.radiusKey] + 1,
    };
}

export function getInitialCityFrontiers(cityRadius: number): CityFrontierRadii {
    return {
        east: cityRadius,
        southEast: cityRadius,
        southWest: cityRadius,
        west: cityRadius,
        northWest: cityRadius,
        northEast: cityRadius,
    };
}

function canClaimAgainstTopFrontier(
    coordinate: AxialCoordinate,
    side: CityExpansionSide,
    frontiers: CityFrontierRadii,
): boolean {
    return side.radiusKey === "northWest"
        ? true
        : coordinate.row >= -frontiers.northWest;
}

function getSideSectorCoordinates(side: CityExpansionSide, radius: number): AxialCoordinate[] {
    if (radius <= 0) return [];

    const coordinates: AxialCoordinate[] = [];
    for (let offset = 0; offset <= radius; offset += 1) {
        coordinates.push(getSideSectorCoordinate(side, radius, offset));
    }

    return coordinates;
}

function getSideSectorCoordinate(
    side: CityExpansionSide,
    radius: number,
    offset: number,
): AxialCoordinate {
    switch (side.id) {
        case "east":
            return {column: radius, row: -radius + offset};
        case "south-east":
            return {column: -radius + offset, row: radius};
        case "south-west": {
            const column = -radius + offset;
            return {column, row: -radius - column};
        }
        case "west":
            return {column: -radius, row: offset};
        case "north-west":
            return {column: offset, row: -radius};
        case "north-east": {
            const row = offset;
            return {column: radius - row, row};
        }
    }
}

function getSideArrowCoordinate(side: CityExpansionSide, radius: number): AxialCoordinate {
    const axisValue = side.frontierSide === "max" ? radius : -radius;

    if (side.cubeAxis === "x") {
        return {
            column: axisValue,
            row: -axisValue / 2,
        };
    }

    if (side.cubeAxis === "z") {
        return {
            column: -axisValue / 2,
            row: axisValue,
        };
    }

    return {
        column: -axisValue / 2,
        row: -axisValue / 2,
    };
}

export function getAxialCoordinateKey(coordinate: AxialCoordinate): string {
    return `${coordinate.column},${coordinate.row}`;
}

export function getAxialDistance(a: AxialCoordinate, b: AxialCoordinate): number {
    const deltaColumn = a.column - b.column;
    const deltaRow = a.row - b.row;
    return (Math.abs(deltaColumn) + Math.abs(deltaRow) + Math.abs(deltaColumn + deltaRow)) / 2;
}

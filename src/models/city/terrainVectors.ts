import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type {AxialCoordinate} from "./HexGrid.ts";

export type CityTerrainVectorMap = Record<string, DevelopmentVectorValue>;

const TERRAIN_VECTOR_WEIGHTS: ReadonlyArray<{
    vector: DevelopmentVectorValue;
    weight: number;
}> = [
    {vector: DEVELOPMENT_VECTORS.medieval, weight: 1.1},
    {vector: DEVELOPMENT_VECTORS.nature, weight: 1},
    {vector: DEVELOPMENT_VECTORS.tech, weight: 0.75},
    {vector: DEVELOPMENT_VECTORS.aether, weight: 0.65},
];

const HEX_DIRECTIONS: readonly AxialCoordinate[] = [
    {column: 1, row: 0},
    {column: 1, row: -1},
    {column: 0, row: -1},
    {column: -1, row: 0},
    {column: -1, row: 1},
    {column: 0, row: 1},
];

type TerrainInfluenceSeed = AxialCoordinate & {
    type: "spot";
    vector: DevelopmentVectorValue;
    strength: number;
    radius: number;
};

type TerrainLineInfluenceSeed = AxialCoordinate & {
    type: "line";
    vector: DevelopmentVectorValue;
    strength: number;
    length: number;
    direction: AxialCoordinate;
};

type TerrainFeatureSeed = TerrainInfluenceSeed | TerrainLineInfluenceSeed;

export function createCityTerrainVectorMap(
    radius: number,
    random: () => number = Math.random,
): CityTerrainVectorMap {
    const seed = Math.floor(random() * 1_000_000_000);
    const coordinates = getHexCoordinatesInRadius(radius);
    const influenceSeeds = createTerrainFeatureSeeds(radius, random);
    const roughMap = Object.fromEntries(
        coordinates.map(coordinate => [
            getTerrainVectorMapKey(coordinate),
            chooseTerrainVector(coordinate, influenceSeeds, seed),
        ]),
    ) as CityTerrainVectorMap;

    return cleanupIsolatedTerrainVectors(roughMap, coordinates);
}

export function getTerrainVectorMapKey({column, row}: AxialCoordinate): string {
    return `${column},${row}`;
}

function createTerrainFeatureSeeds(radius: number, random: () => number): TerrainFeatureSeed[] {
    const possibleCoordinates = getHexCoordinatesInRadius(radius);
    const spotCount = Math.max(7, Math.ceil(possibleCoordinates.length / 24));
    const lineCount = Math.max(2, Math.ceil(radius / 4));
    const spotSeeds = Array.from({length: spotCount}, () => {
        const coordinate = possibleCoordinates[Math.floor(random() * possibleCoordinates.length)] ?? {column: 0, row: 0};
        const spotRadius = 1 + Math.floor(random() * 4);

        return {
            type: "spot" as const,
            ...coordinate,
            vector: chooseWeightedVector(random()),
            strength: 1.7 + random() * 1.4,
            radius: spotRadius,
        };
    });
    const lineSeeds = Array.from({length: lineCount}, () => {
        const coordinate = possibleCoordinates[Math.floor(random() * possibleCoordinates.length)] ?? {column: 0, row: 0};
        const direction = HEX_DIRECTIONS[Math.floor(random() * HEX_DIRECTIONS.length)] ?? HEX_DIRECTIONS[0];

        return {
            type: "line" as const,
            ...coordinate,
            vector: chooseWeightedVector(random()),
            strength: 1.5 + random(),
            length: 3 + Math.floor(random() * 2),
            direction,
        };
    });

    return [...spotSeeds, ...lineSeeds];
}

function chooseTerrainVector(
    coordinate: AxialCoordinate,
    influenceSeeds: readonly TerrainFeatureSeed[],
    seed: number,
): DevelopmentVectorValue {
    const weightedScores = TERRAIN_VECTOR_WEIGHTS.map(({vector, weight}, index) => {
        const featureInfluence = influenceSeeds.reduce((total, influenceSeed) => {
            if (influenceSeed.vector !== vector) return total;

            return total + getFeatureInfluence(coordinate, influenceSeed);
        }, 0);
        const noise = (coordinateNoise(coordinate, seed + index * 7919) - 0.5) * 0.95;

        return {
            vector,
            score: Math.log(weight) + featureInfluence + noise,
        };
    });

    const temperature = 0.82;
    const maxScore = Math.max(...weightedScores.map(entry => entry.score));
    const softmaxWeights = weightedScores.map(entry => ({
        vector: entry.vector,
        weight: Math.exp((entry.score - maxScore) / temperature),
    }));

    return chooseWeightedVector(
        coordinateNoise({column: coordinate.column + 37, row: coordinate.row - 53}, seed),
        softmaxWeights,
    );
}

function getFeatureInfluence(coordinate: AxialCoordinate, influenceSeed: TerrainFeatureSeed): number {
    if (influenceSeed.type === "spot") {
        const distance = getAxialDistance(coordinate, influenceSeed);
        if (distance > influenceSeed.radius) return 0;

        const falloff = 1 - distance / (influenceSeed.radius + 1);
        return falloff * influenceSeed.strength;
    }

    const distance = getDistanceToLineSegment(coordinate, influenceSeed);
    if (distance > 0) return 0;

    return influenceSeed.strength;
}

function getDistanceToLineSegment(coordinate: AxialCoordinate, influenceSeed: TerrainLineInfluenceSeed): number {
    let nearestDistance = Infinity;

    for (let index = 0; index < influenceSeed.length; index++) {
        const lineCoordinate = {
            column: influenceSeed.column + influenceSeed.direction.column * index,
            row: influenceSeed.row + influenceSeed.direction.row * index,
        };
        nearestDistance = Math.min(nearestDistance, getAxialDistance(coordinate, lineCoordinate));
    }

    return nearestDistance;
}

function cleanupIsolatedTerrainVectors(
    terrainVectorMap: CityTerrainVectorMap,
    coordinates: readonly AxialCoordinate[],
): CityTerrainVectorMap {
    const cleanedMap = {...terrainVectorMap};
    const coordinateKeys = new Set(coordinates.map(getTerrainVectorMapKey));

    coordinates.forEach(coordinate => {
        const key = getTerrainVectorMapKey(coordinate);
        const currentVector = terrainVectorMap[key];
        if (!currentVector) return;

        const neighborVectors = HEX_DIRECTIONS.flatMap(direction => {
            const neighborCoordinate = {
                column: coordinate.column + direction.column,
                row: coordinate.row + direction.row,
            };
            const neighborKey = getTerrainVectorMapKey(neighborCoordinate);
            const neighborVector = coordinateKeys.has(neighborKey) ? terrainVectorMap[neighborKey] : undefined;
            return neighborVector ? [neighborVector] : [];
        });
        const matchingNeighborCount = neighborVectors.filter(vector => vector === currentVector).length;
        if (matchingNeighborCount > 0 || neighborVectors.length < 3) return;

        const replacement = getMostCommonVector(neighborVectors);
        if (replacement) {
            cleanedMap[key] = replacement;
        }
    });

    return cleanedMap;
}

function getMostCommonVector(vectors: readonly DevelopmentVectorValue[]): DevelopmentVectorValue | undefined {
    return TERRAIN_VECTOR_WEIGHTS
        .map(({vector}) => ({
            vector,
            count: vectors.filter(candidate => candidate === vector).length,
        }))
        .sort((a, b) => b.count - a.count)[0]?.vector;
}

function chooseWeightedVector(
    roll: number,
    weightedVectors = TERRAIN_VECTOR_WEIGHTS,
): DevelopmentVectorValue {
    const totalWeight = weightedVectors.reduce((total, entry) => total + entry.weight, 0);
    const targetWeight = roll * totalWeight;
    let accumulatedWeight = 0;

    for (const entry of weightedVectors) {
        accumulatedWeight += entry.weight;
        if (targetWeight <= accumulatedWeight) {
            return entry.vector;
        }
    }

    return weightedVectors[weightedVectors.length - 1]?.vector ?? DEVELOPMENT_VECTORS.medieval;
}

function getHexCoordinatesInRadius(radius: number): AxialCoordinate[] {
    const coordinates: AxialCoordinate[] = [];

    for (let column = -radius; column <= radius; column++) {
        const rowMin = Math.max(-radius, -column - radius);
        const rowMax = Math.min(radius, -column + radius);
        for (let row = rowMin; row <= rowMax; row++) {
            coordinates.push({column, row});
        }
    }

    return coordinates;
}

function getAxialDistance(a: AxialCoordinate, b: AxialCoordinate): number {
    const deltaColumn = a.column - b.column;
    const deltaRow = a.row - b.row;
    return (Math.abs(deltaColumn) + Math.abs(deltaRow) + Math.abs(deltaColumn + deltaRow)) / 2;
}

function coordinateNoise({column, row}: AxialCoordinate, seed: number): number {
    const value = Math.sin(column * 127.1 + row * 311.7 + seed * 0.013) * 43758.5453123;
    return value - Math.floor(value);
}

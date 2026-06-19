// What we resolve per hex
import type {UpkeepAmount} from "../../../../models/Upkeep.ts";
import type {
    AdjacencyRule,
    CityResolution,
    EffectDelta,
    PlacedCityMap,
    ResourceOutputModifier,
    TargetFilter
} from "../../../../models/city/Adjancency.ts";
import type {HexCell} from "../../../../models/city/HexGrid.ts";
import type {Building, PlacedBuilding} from "../../../../models/city/Building.ts";
import {addUpkeep, applyResourceModifier, deductUpkeep, multiplyUpkeep} from "./upkeepUtils.ts";
import {BUILDINGS_ATLAS} from "../../../../data/buildings";
import {ALL_WALL_BUILDINGS} from "../../../../data/wall/index.ts";
import {hexesWithinRadius} from "./hexUtils.ts";
import {SIGNATURE_PER_HEX} from "../../../../data/constants.ts";
import {deepClone} from "../../../../utils/deepClone.ts";
import {
    citySignatureToHomogeneousValueEffect,
    homogeneousValueTotalsToUpkeepAmount,
    upkeepAmountToHomogeneousValueEffects
} from "../../../../models/homogeneousValueAdapters.ts";
import {
    getAvailableValues,
    getProducedValues,
    getUpkeepValues,
    resolveHomogeneousValueContributions,
    resolveCity
} from "../../../../models/homogeneousValueResolution.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../../../data/homogeneousValues/index.ts";
import type {HomogeneousValueEntitySource} from "../../../../models/homogeneousValueResolution.ts";

function matchesFilter(
    placed?: PlacedBuilding,
    filter?: TargetFilter
): boolean {
    if (!filter) return true;
    if (!placed) return !!filter.includeEmptyHexes;

    if (filter.buildingTypes && !filter.buildingTypes.includes(placed.type)) return false;
    if (filter.developmentVectors && !filter.developmentVectors.includes(placed.vector)) return false;

    if (filter.keywords && filter.keywords.length > 0) {
        const source = new Set(placed.keywords ?? []);
        const wanted = filter.keywords.some(t => source.has(t));
        if (!wanted) return false;
    }
    return true;
}

function accumulateEffect(
    initial: EffectDelta,
    rule: AdjacencyRule
): void {
    const { effect } = rule;

    // additive
    if (effect.requiredUpkeepAdd) {
        initial.requiredUpkeepAdd = addUpkeep(
            initial.requiredUpkeepAdd ?? {},
            effect.requiredUpkeepAdd
        );
    }
    if (effect.providedUpkeepAdd) {
        initial.providedUpkeepAdd = addUpkeep(
            initial.providedUpkeepAdd ?? {},
            effect.providedUpkeepAdd
        );
    }
    if (typeof effect.signatureAdd === "number") {
        initial.signatureAdd = (initial.signatureAdd ?? 0) + effect.signatureAdd;
    }

    // multiplicative
    if (effect.requiredUpkeepMul) {
        initial.requiredUpkeepMul = multiplyUpkeep(
            initial.requiredUpkeepMul ?? {},
            effect.requiredUpkeepMul
        );
    }

    if (effect.providedUpkeepMul) {
        initial.providedUpkeepMul = multiplyUpkeep(
            initial.providedUpkeepMul ?? {},
            effect.providedUpkeepMul
        );
    }

    if (effect.outputMul) {
        initial.outputMul = [
            ...toOutputModifiers(initial.outputMul),
            ...toOutputModifiers(effect.outputMul),
        ];
    }

    if (typeof effect.signatureMul === "number") {
        initial.signatureMul = (initial.signatureMul ?? 1) * effect.signatureMul;
    }

    if (effect.homogeneousValueEffects) {
        initial.homogeneousValueEffects = [
            ...(initial.homogeneousValueEffects ?? []),
            ...effect.homogeneousValueEffects,
        ];
    }
}

function toOutputModifiers(
    modifier: ResourceOutputModifier | ResourceOutputModifier[] | undefined,
): ResourceOutputModifier[] {
    if (!modifier) return [];
    return Array.isArray(modifier) ? modifier : [modifier];
}

/**
 * Main resolver:
 * - Takes hexes with optional buildings.
 * - Emits adjacency effects per rule.
 * - Aggregates and applies in a deterministic order.
 */
export const placeCityBuildings = (
    hexes: HexCell[]
): PlacedCityMap => {
    // 1) Base pass
    const placedCity = new Map<string, PlacedBuilding>();
    const getResolvedCellKey = (hexCell: HexCell) => hexCell.partOfStructureId
        ? hexCell.structureCoreCellKey ?? hexCell.cellKey
        : hexCell.cellKey;

    hexes.forEach((hexCell: HexCell) => {
        const { column, row, cellKey, buildingKey, developmentVector } = hexCell;
        if (hexCell.partOfStructureId && (hexCell.structureCoreCellKey ?? cellKey) !== cellKey) return;

        const building:Building | undefined = buildingKey ? BUILDINGS_ATLAS[developmentVector][buildingKey] : undefined;
        const placed: PlacedBuilding | undefined = building ? {
            ...deepClone(building),
            column,
            row,
            providedUpkeepAdd: {},
            requiredUpkeepAdd: {},
            signatureAdd: 0,
            providedUpkeepMul: {},
            requiredUpkeepMul: {},
            signatureMul: 1,
            effectiveProvidedUpkeep: {},
            effectiveRequiredUpkeep: {},
            effectiveSignature: 0,
            effectiveHomogeneousValueEffects: [...(building.homogeneousValueEffects ?? [])]
        } : undefined;
        if (placed) placedCity.set(cellKey, placed);
    })

    //2) Emit & aggregate effects
    hexes.forEach((hexCell: HexCell) => {
        const { cellKey, buildingKey } = hexCell;
        if (hexCell.partOfStructureId && (hexCell.structureCoreCellKey ?? cellKey) !== cellKey) return;

        const affectorBuilding:PlacedBuilding | undefined = buildingKey ? placedCity.get(getResolvedCellKey(hexCell)) : undefined;

        //for each hex with building and adjacency rules
        if (affectorBuilding && affectorBuilding.adjacency.length) {

            //for each rule
            affectorBuilding.adjacency.forEach((adjacencyRule: AdjacencyRule) => {
                const affectedKeys = new Set<string>();

                //for each hex within a rule radius
                hexesWithinRadius(
                    {column: affectorBuilding.column, row: affectorBuilding.row},
                    adjacencyRule.radiusInHexes,
                    hexes,
                    {excludeCenter: true, onlyNonEmpty: true}
                ).forEach((affectedHex: HexCell) => {
                    const affectedKey = getResolvedCellKey(affectedHex);
                    const affectedBuilding: PlacedBuilding | undefined = placedCity.get(affectedKey);
                    if (affectedKeys.has(affectedKey)) return;
                    affectedKeys.add(affectedKey);

                    //if the hex has a building and matches the filter
                    if (affectedBuilding && matchesFilter(affectedBuilding, adjacencyRule.targetFilter)) {
                        accumulateEffect(affectedBuilding, adjacencyRule);
                    }
                })
            })
        }
    })

    //3) Apply aggregated effects
    placedCity.forEach((building) => {
        const { requiredUpkeepAdd, requiredUpkeepMul, providedUpkeepAdd, providedUpkeepMul, outputMul, signatureAdd, signatureMul } = building;
        const exactProvidedUpkeep = multiplyUpkeep(providedUpkeepAdd ?? {}, providedUpkeepMul!);
        const legacyProvidedUpkeep = toOutputModifiers(outputMul).reduce(
            (current, modifier) => applyResourceModifier(current, modifier),
            exactProvidedUpkeep,
        );
        const legacyRequiredUpkeep = multiplyUpkeep(requiredUpkeepAdd ?? {}, requiredUpkeepMul!);
        const legacySignature = (signatureAdd ?? 0) * (signatureMul ?? 1);
        building.effectiveHomogeneousValueEffects = [
            ...(building.homogeneousValueEffects ?? []),
            ...upkeepAmountToHomogeneousValueEffects(legacyProvidedUpkeep, "production"),
            ...upkeepAmountToHomogeneousValueEffects(legacyRequiredUpkeep, "upkeep"),
            ...citySignatureToHomogeneousValueEffect(legacySignature),
        ];

        const resolvedBuildingValues = resolveHomogeneousValueContributions(building.effectiveHomogeneousValueEffects);
        building.effectiveProvidedUpkeep = homogeneousValueTotalsToUpkeepAmount(getProducedValues(resolvedBuildingValues));
        building.effectiveRequiredUpkeep = homogeneousValueTotalsToUpkeepAmount(getUpkeepValues(resolvedBuildingValues));
        building.effectiveSignature = getProducedValues(resolvedBuildingValues)[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0;
    })

    return placedCity
}

export function resolveCityUpkeepAndSignature(
    hexes: HexCell[],
    city: PlacedCityMap,
    cityFootprint = 0,
): CityResolution {
    const resolvedCity: CityResolution = {
        buildingIds: new Set<string>(),
        buildingKeywords: new Set<string>(),
        requiredUpkeep: {} as UpkeepAmount,
        providedUpkeep: {} as UpkeepAmount,
        effectiveUpkeep: {} as UpkeepAmount,
        homogeneousValues: {},
        homogeneousResolvedValues: {},
        values: {},
        resolvedHexes: [],
        resolvedTowers: [],
        resolvedWallSegments: [],
        producedHomogeneousValues: {},
        upkeepHomogeneousValues: {},
        buildingsSignature: 0,
        territorySignature: 0,
        cityFootprint,
        effectiveSignature: 0,
    };

    resolvedCity.territorySignature = hexes.length * SIGNATURE_PER_HEX;
    const buildingEntities: HomogeneousValueEntitySource[] = [...city.values()].map((building) => ({
            id: `${building.column}:${building.row}`,
            contentId: building.id,
            entityType: "building",
            cellKey: `${building.column}:${building.row}`,
            column: building.column,
            row: building.row,
            keywords: building.keywords,
            contributions: building.effectiveHomogeneousValueEffects,
            modifiers: building.homogeneousAdjacency,
        }));
    const wallEntities: HomogeneousValueEntitySource[] = hexes.flatMap((hexCell) => {
        if (hexCell.kind !== "wall") return [];

        return [
            {wallBuildingKey: hexCell.wallKey, entityType: "wallSegment" as const},
            {wallBuildingKey: hexCell.wallTopKey, entityType: "wallSuperstructure" as const},
        ].flatMap(({wallBuildingKey, entityType}) => {
            if (!wallBuildingKey) return [];

            const wallBuilding = ALL_WALL_BUILDINGS[wallBuildingKey];
            if (!wallBuilding) return [];

            return [{
                id: `${hexCell.cellKey}:${wallBuilding.id}`,
                entityType,
                cellKey: hexCell.cellKey,
                column: hexCell.column,
                row: hexCell.row,
                keywords: [String(wallBuilding.type), ...(wallBuilding.keywords ?? [])],
                contributions: wallBuilding.homogeneousValueEffects ?? [],
                modifiers: wallBuilding.homogeneousAdjacency,
            }];
        });
    });
    const cityEntities = [...buildingEntities, ...wallEntities];
    const homogeneousCityResolution = resolveCity(cityEntities);

    resolvedCity.buildingIds = homogeneousCityResolution.buildingIds;
    resolvedCity.buildingKeywords = homogeneousCityResolution.buildingKeywords;
    resolvedCity.values = homogeneousCityResolution.values;
    resolvedCity.resolvedHexes = homogeneousCityResolution.resolvedHexes;
    resolvedCity.resolvedTowers = homogeneousCityResolution.resolvedTowers;
    resolvedCity.resolvedWallSegments = homogeneousCityResolution.resolvedWallSegments;
    resolvedCity.homogeneousResolvedValues = homogeneousCityResolution.resolvedValues;
    resolvedCity.homogeneousValues = getAvailableValues(resolvedCity.homogeneousResolvedValues);
    resolvedCity.producedHomogeneousValues = getProducedValues(resolvedCity.homogeneousResolvedValues);
    resolvedCity.upkeepHomogeneousValues = getUpkeepValues(resolvedCity.homogeneousResolvedValues);
    resolvedCity.providedUpkeep = homogeneousValueTotalsToUpkeepAmount(resolvedCity.producedHomogeneousValues);
    resolvedCity.requiredUpkeep = homogeneousValueTotalsToUpkeepAmount(resolvedCity.upkeepHomogeneousValues);
    resolvedCity.buildingsSignature = resolvedCity.producedHomogeneousValues[HOMOGENEOUS_VALUE_IDS.citySignature] ?? 0;

    resolvedCity.effectiveUpkeep = deductUpkeep(resolvedCity.providedUpkeep, resolvedCity.requiredUpkeep);
    resolvedCity.effectiveSignature = resolvedCity.buildingsSignature + resolvedCity.territorySignature + resolvedCity.cityFootprint;

    return resolvedCity
}


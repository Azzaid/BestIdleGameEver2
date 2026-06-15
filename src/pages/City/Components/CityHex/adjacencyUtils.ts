// What we resolve per hex
import type {UpkeepAmount} from "../../../../models/Upkeep.ts";
import type {
    AdjacencyRule,
    CityResolution,
    EffectDelta,
    PlacedCityMap,
    TargetFilter
} from "../../../../models/city/Adjancency.ts";
import type {HexCell} from "../../../../models/city/HexGrid.ts";
import type {Building, PlacedBuilding} from "../../../../models/city/Building.ts";
import {addUpkeep, deductUpkeep, multiplyUpkeep} from "./upkeepUtils.ts";
import {BUILDINGS_ATLAS} from "../../../../data/buildings";
import {hexesWithinRadius} from "./hexUtils.ts";
import {TRACE_PER_HEX} from "../../../../data/constants.ts";
import {deepClone} from "../../../../utils/deepClone.ts";

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
    if (typeof effect.traceAdd === "number") {
        initial.traceAdd = (initial.traceAdd ?? 0) + effect.traceAdd;
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

    if (typeof effect.traceMul === "number") {
        initial.traceMul = (initial.traceMul ?? 1) * effect.traceMul;
    }
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

    hexes.forEach((hexCell: HexCell) => {
        const { column, row, cellKey, buildingKey, developmentVector } = hexCell;
        const building:Building | undefined = buildingKey ? BUILDINGS_ATLAS[developmentVector][buildingKey] : undefined;
        const placed: PlacedBuilding | undefined = building ? {
            ...deepClone(building),
            column,
            row,
            providedUpkeepAdd: {},
            requiredUpkeepAdd: {},
            traceAdd: 0,
            providedUpkeepMul: {},
            requiredUpkeepMul: {},
            traceMul: 1,
            effectiveProvidedUpkeep: {...building.providedUpkeep},
            effectiveRequiredUpkeep: {...building.requiredUpkeep},
            effectiveTrace: building.trace
        } : undefined;
        if (placed) placedCity.set(cellKey, placed);
    })

    //2) Emit & aggregate effects
    hexes.forEach((hexCell: HexCell) => {
        const { cellKey, buildingKey } = hexCell;
        const affectorBuilding:PlacedBuilding | undefined = buildingKey ? placedCity.get(cellKey) : undefined;

        //for each hex with building and adjacency rules
        if (affectorBuilding && affectorBuilding.adjacency.length) {

            //for each rule
            affectorBuilding.adjacency.forEach((adjacencyRule: AdjacencyRule) => {

                //for each hex within a rule radius
                hexesWithinRadius(
                    {column: affectorBuilding.column, row: affectorBuilding.row},
                    adjacencyRule.radiusInHexes,
                    hexes,
                    {excludeCenter: true, onlyNonEmpty: true}
                ).forEach((affectedHex: HexCell) => {
                    const affectedBuilding: PlacedBuilding | undefined = placedCity.get(affectedHex.cellKey);

                    //if the hex has a building and matches the filter
                    if (affectedBuilding && matchesFilter(affectedBuilding, adjacencyRule.targetFilter)) {
                        accumulateEffect(affectedBuilding, adjacencyRule);
                    }
                })
            })
        }
    })

    //3) Apply aggregated effects
    hexes.forEach((hexCell: HexCell) => {
        const { cellKey, buildingKey} = hexCell;
        const building:PlacedBuilding | undefined = buildingKey ? placedCity.get(cellKey) : undefined;

        if (building) {
            const { requiredUpkeep, requiredUpkeepAdd, requiredUpkeepMul, providedUpkeep, providedUpkeepAdd, providedUpkeepMul, trace, traceAdd, traceMul } = building;
            building.effectiveProvidedUpkeep = multiplyUpkeep(addUpkeep(providedUpkeep, providedUpkeepAdd!), providedUpkeepMul!);
            building.effectiveRequiredUpkeep = multiplyUpkeep(addUpkeep(requiredUpkeep, requiredUpkeepAdd!), requiredUpkeepMul!);
            building.effectiveTrace = trace + traceAdd! * traceMul!;
        }
    })

    return placedCity
}

export function resolveCityUpkeepAndTrace(
    hexes: HexCell[],
    city: PlacedCityMap,
    scarTrace = 0,
): CityResolution {
    const resolvedCity: CityResolution = {
        requiredUpkeep: {} as UpkeepAmount,
        providedUpkeep: {} as UpkeepAmount,
        effectiveUpkeep: {} as UpkeepAmount,
        buildingsTrace: 0,
        territoryTrace: 0,
        scarTrace,
        effectiveTrace: 0,
    };

    city.forEach((building) => {
        resolvedCity.providedUpkeep = addUpkeep(resolvedCity.providedUpkeep, building.effectiveProvidedUpkeep);
        resolvedCity.requiredUpkeep = addUpkeep(resolvedCity.requiredUpkeep, building.effectiveRequiredUpkeep);
        resolvedCity.buildingsTrace += building.effectiveTrace;
    })

    resolvedCity.territoryTrace = hexes.length * TRACE_PER_HEX;

    resolvedCity.effectiveUpkeep = deductUpkeep(resolvedCity.providedUpkeep, resolvedCity.requiredUpkeep);
    resolvedCity.effectiveTrace = resolvedCity.buildingsTrace + resolvedCity.territoryTrace + resolvedCity.scarTrace;

    return resolvedCity
}


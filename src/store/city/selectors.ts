import type {RootState} from "../../models/store/appStore.ts";
import {createSelector} from "@reduxjs/toolkit";
import {placeCityBuildings, resolveCityUpkeepAndSignature} from "../../pages/City/Components/CityHex/adjacencyUtils.ts";
import {STRUCTURES} from "../../data/buildings/index.ts";
import {detectMultistructures} from "../../models/city/multistructureDetection.ts";
import type {CityResolution} from "../../models/city/Adjancency.ts";

export const selectAllCityHexes = (state: RootState) => state.city.hexes;

export const selectCityHexes = createSelector(
    [selectAllCityHexes],
    (hexes) => hexes.filter(hex => !hex.isUnclaimed),
);

export const selectCityCellRadius = (state: RootState) => state.city.cellRadius;

export const selectCityFootprint = (state: RootState) => state.city.cityFootprint;

export const selectBuiltStructureIds = (state: RootState) => state.city.builtStructureIds ?? [];

export const selectCityBiome = (state: RootState) => state.city.biome;

export const selectCityBattlefield = (state: RootState) => state.city.battlefield;

export const selectCitySideHexes = createSelector(
    [selectCityCellRadius],
    (cellRadius) => cellRadius + 1
);

export const selectCityBuildings = createSelector(
    [selectCityHexes],
    (hexes) => placeCityBuildings(hexes)
);

export const selectCityStructureCandidates = createSelector(
    [selectCityHexes],
    (hexes) => detectMultistructures(hexes, STRUCTURES)
);

export const selectCompleteCityStructureIds = createSelector(
    [selectCityHexes],
    (hexes) => {
        const builtIds = new Set<string>();
        hexes.forEach(h => {
            if (h.kind !== "city") return;
            if (h.partOfStructureId) {
                builtIds.add(h.partOfStructureId);
            }
        });
        return builtIds;
    }
);

export const selectBaseCityResolution = createSelector(
    [selectCityHexes, selectCityBuildings],
    (hexes, buildings): CityResolution => resolveCityUpkeepAndSignature(hexes, buildings)
);

export const selectCityResolution = createSelector(
    [selectBaseCityResolution, selectCityFootprint],
    (baseResolution, cityFootprint): CityResolution => ({
        ...baseResolution,
        cityFootprint,
        effectiveSignature: baseResolution.buildingsSignature + baseResolution.territorySignature + cityFootprint,
    })
);

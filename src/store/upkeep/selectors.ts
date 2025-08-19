import {createSelector} from "@reduxjs/toolkit";
import {selectCityHexes} from "../city/selectors.ts";
import {BUILDINGS_ATLAS} from "../../data/buildings";
import {addUpkeep, deductUpkeep} from "./utils.ts";


export const selectCityRequiredUpkeep = createSelector(
    [selectCityHexes],
    (hexes) => hexes.reduce((totalUpkeep, hexCell) => {
        if (!hexCell.buildingKey) return totalUpkeep;
        const building = BUILDINGS_ATLAS[hexCell.developmentVector][hexCell.buildingKey];
        return addUpkeep(totalUpkeep, building.requiredUpkeep);
    }, {})
);

export const selectCityProvidedUpkeep = createSelector(
    [selectCityHexes],
    (hexes) => hexes.reduce((totalUpkeep, hexCell) => {
        if (!hexCell.buildingKey) return totalUpkeep;
        const building = BUILDINGS_ATLAS[hexCell.developmentVector][hexCell.buildingKey];
        return addUpkeep(totalUpkeep, building.providedUpkeep);
    }, {})
);

export const selectTotalUpkeep = createSelector(
    [selectCityRequiredUpkeep, selectCityProvidedUpkeep],
    (cityRequiredUpkeep, cityProvidedUpkeep) => deductUpkeep(cityProvidedUpkeep, cityRequiredUpkeep)
);
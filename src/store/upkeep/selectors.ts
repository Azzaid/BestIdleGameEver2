import {createSelector} from "@reduxjs/toolkit";
import {selectCityHexes} from "../city/selectors.ts";
import type {UpkeepAmount, UpkeepTypesValue} from "../../models/Upkeep.ts";
import {BUILDINGS_ATLAS} from "../../data/buildings";

function addUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = { ...a };

    for (const resource of Object.getOwnPropertySymbols(b) as UpkeepTypesValue[]) {
        const addValue = b[resource] ?? 0;
        if (addValue !== 0) {
            result[resource] = (result[resource] ?? 0) + addValue;
        }
    }

    // If you also ever use string keys, include this:
    // for (const resource of Object.keys(b) as (keyof UpkeepAmount)[]) {
    //   const addValue = b[resource] ?? 0;
    //   if (addValue !== 0) result[resource] = (result[resource] ?? 0) + addValue;
    // }

    return result;
}

function deductUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = { ...a };

    for (const resource of Object.getOwnPropertySymbols(b) as UpkeepTypesValue[]) {
        const addValue = b[resource] ?? 0;
        if (addValue !== 0) {
            result[resource] = (result[resource] ?? 0) - addValue;
        }
    }

    return result;
}


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
import type {UpkeepAmount, UpkeepTypesValue} from "../../models/Upkeep.ts";

export function addUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = {...a};

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

export function deductUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = {...a};

    for (const resource of Object.getOwnPropertySymbols(b) as UpkeepTypesValue[]) {
        const addValue = b[resource] ?? 0;
        if (addValue !== 0) {
            result[resource] = (result[resource] ?? 0) - addValue;
        }
    }

    return result;
}
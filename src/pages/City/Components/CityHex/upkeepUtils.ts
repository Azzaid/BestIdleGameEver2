import type {UpkeepAmount, UpkeepTypesValue} from "../../../../models/Upkeep.ts";

export function cloneUpkeepAmount(amount?: UpkeepAmount): UpkeepAmount {
    return amount ? { ...amount } : {};
}

export function addUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = {...a};

    for (const resource of Object.getOwnPropertySymbols(b) as UpkeepTypesValue[]) {
        const addValue = b[resource] ?? 0;
        if (addValue !== 0) {
            result[resource] = (result[resource] ?? 0) + addValue;
        }
    }

    return result;
}

export function multiplyUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = {...a};

    for (const resource of Object.getOwnPropertySymbols(b) as UpkeepTypesValue[]) {
        const addValue = b[resource] ?? 1;
        if (addValue !== 1) {
            result[resource] = (result[resource] ?? 1) * addValue;
        }
    }

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
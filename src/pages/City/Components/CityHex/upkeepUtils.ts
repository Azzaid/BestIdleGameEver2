import {
    getResourcesWithKeywords,
    UPKEEP_TYPES,
    type ResourceKeyword,
    type UpkeepAmount,
    type UpkeepTypesValue
} from "../../../../models/Upkeep.ts";

export type ResourceModifier = {
    requiredKeywords: ResourceKeyword[];
    multiplier?: number;
    additive?: number;
};

export function cloneUpkeepAmount(amount?: UpkeepAmount): UpkeepAmount {
    return amount ? { ...amount } : {};
}

export function addUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = {...a};

    for (const resource of Object.keys(b) as UpkeepTypesValue[]) {
        const addValue = b[resource] ?? 0;
        if (addValue !== 0) {
            result[resource] = (result[resource] ?? 0) + addValue;
        }
    }

    return result;
}

export function multiplyUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = {...a};

    for (const resource of Object.keys(b) as UpkeepTypesValue[]) {
        const addValue = b[resource] ?? 1;
        if (addValue !== 1) {
            result[resource] = (result[resource] ?? 1) * addValue;
        }
    }

    return result;
}

export function deductUpkeep(a: UpkeepAmount, b: UpkeepAmount): UpkeepAmount {
    const result: UpkeepAmount = {...a};

    for (const resource of Object.keys(b) as UpkeepTypesValue[]) {
        const addValue = b[resource] ?? 0;
        if (addValue !== 0) {
            result[resource] = (result[resource] ?? 0) - addValue;
        }
    }

    return result;
}

export function getUpkeepShortfalls(required: UpkeepAmount, available: UpkeepAmount): UpkeepAmount {
    const shortfalls: UpkeepAmount = {};

    for (const resource of Object.values(UPKEEP_TYPES)) {
        const missing = Math.max(0, (required[resource] ?? 0) - (available[resource] ?? 0));
        if (missing > 0) {
            shortfalls[resource] = missing;
        }
    }

    return shortfalls;
}

export function hasEnoughUpkeep(required: UpkeepAmount, available: UpkeepAmount): boolean {
    return Object.keys(getUpkeepShortfalls(required, available)).length === 0;
}

export function applyResourceModifier(amount: UpkeepAmount, modifier: ResourceModifier): UpkeepAmount {
    const result: UpkeepAmount = {...amount};
    const multiplier = modifier.multiplier ?? 1;
    const additive = modifier.additive ?? 0;

    for (const resource of getResourcesWithKeywords(modifier.requiredKeywords)) {
        if (amount[resource] === undefined) continue;

        result[resource] = (result[resource] ?? 0) * multiplier + additive;
    }

    return result;
}

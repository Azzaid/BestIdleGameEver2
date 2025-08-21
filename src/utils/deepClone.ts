export function deepClone<T>(input: T, seen = new WeakMap()): T {
    // primitives + functions + symbols: return as is
    if (input === null || typeof input !== "object") return input;

    if (seen.has(input as any)) return seen.get(input as any);

    // Dates / RegExps
    if (input instanceof Date) return new Date(input.getTime()) as any;
    if (input instanceof RegExp) return new RegExp(input) as any;

    // Arrays
    if (Array.isArray(input)) {
        const arr: any[] = [];
        seen.set(input as any, arr);
        for (const item of input) arr.push(deepClone(item, seen));
        return arr as any;
    }

    // Map
    if (input instanceof Map) {
        const out = new Map();
        seen.set(input as any, out);
        for (const [k, v] of input) out.set(deepClone(k, seen), deepClone(v, seen));
        return out as any;
    }

    // Set
    if (input instanceof Set) {
        const out = new Set();
        seen.set(input as any, out);
        for (const v of input) out.add(deepClone(v, seen));
        return out as any;
    }

    // Plain object (copy string + symbol keys)
    const proto = Object.getPrototypeOf(input);
    const out = Object.create(proto);
    seen.set(input as any, out);

    for (const key of Reflect.ownKeys(input as object)) {
        const desc = Object.getOwnPropertyDescriptor(input as object, key)!;
        if ("value" in desc) {
            (desc as PropertyDescriptor).value = deepClone((input as any)[key as any], seen);
        }
        Object.defineProperty(out, key, desc);
    }

    return out;
}
export function deepClone<T>(input: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
    // primitives + functions + symbols: return as is
    if (input === null || typeof input !== "object") return input;

    const sourceObject = input as object;

    if (seen.has(sourceObject)) return seen.get(sourceObject) as T;

    // Dates / RegExps
    if (input instanceof Date) return new Date(input.getTime()) as T;
    if (input instanceof RegExp) return new RegExp(input) as T;

    // Arrays
    if (Array.isArray(input)) {
        const arr: unknown[] = [];
        seen.set(sourceObject, arr);
        for (const item of input) arr.push(deepClone(item, seen));
        return arr as T;
    }

    // Map
    if (input instanceof Map) {
        const out = new Map<unknown, unknown>();
        seen.set(sourceObject, out);
        for (const [k, v] of input) out.set(deepClone(k, seen), deepClone(v, seen));
        return out as T;
    }

    // Set
    if (input instanceof Set) {
        const out = new Set<unknown>();
        seen.set(sourceObject, out);
        for (const v of input) out.add(deepClone(v, seen));
        return out as T;
    }

    // Plain object (copy string + symbol keys)
    const proto = Object.getPrototypeOf(input);
    const out = Object.create(proto) as object;
    seen.set(sourceObject, out);
    const sourceRecord = input as Record<PropertyKey, unknown>;

    for (const key of Reflect.ownKeys(sourceObject)) {
        const desc = Object.getOwnPropertyDescriptor(sourceObject, key)!;
        if ("value" in desc) {
            desc.value = deepClone(sourceRecord[key], seen);
        }
        Object.defineProperty(out, key, desc);
    }

    return out as T;
}

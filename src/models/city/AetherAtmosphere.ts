export type AetherAtmosphere = "veil" | "manaFlows" | "death";

export type AetherAtmosphereLevel = 1 | 2 | 3 | 4 | 5;

export type AetherAtmosphereTotals = Record<AetherAtmosphere, number>;

export type AetherAtmosphereLevels = Record<AetherAtmosphere, AetherAtmosphereLevel>;

export type AetherAtmosphereResolution = {
    cityHexCount: number;
    totals: AetherAtmosphereTotals;
    concentrations: AetherAtmosphereTotals;
    rawLevels: AetherAtmosphereTotals;
    levels: AetherAtmosphereLevels;
};

export const AETHER_ATMOSPHERES = ["veil", "manaFlows", "death"] as const satisfies readonly AetherAtmosphere[];

export const EMPTY_AETHER_ATMOSPHERE_TOTALS: AetherAtmosphereTotals = {
    veil: 0,
    manaFlows: 0,
    death: 0,
};

export const MIN_AETHER_ATMOSPHERE_LEVEL: AetherAtmosphereLevel = 1;
export const MAX_AETHER_ATMOSPHERE_LEVEL: AetherAtmosphereLevel = 5;

export const AETHER_ATMOSPHERE_LABELS: Record<AetherAtmosphere, {name: string; levels: Record<AetherAtmosphereLevel, string>}> = {
    veil: {
        name: "Veil",
        levels: {
            1: "Impermeable",
            2: "Thinned",
            3: "Damaged",
            4: "Torn",
            5: "Gate",
        },
    },
    manaFlows: {
        name: "Mana Flows",
        levels: {
            1: "Surges",
            2: "Springs",
            3: "Streams",
            4: "Flows",
            5: "Weave",
        },
    },
    death: {
        name: "Death",
        levels: {
            1: "Presence",
            2: "Breath",
            3: "Gaze",
            4: "Touch",
            5: "Realm",
        },
    },
};

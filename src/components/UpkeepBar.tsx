import type {ReactNode} from "react";
import {useTypedSelector} from "../store/hooks.ts";
import {selectCitySignatureStatus, selectTowerAwareCityResolution} from "../store/upkeep/selectors.ts";
import {DEVELOPMENT_VECTORS} from "../models/DevlopmentVector.ts";
import {UPKEEP_SPRITES, UPKEEP_TYPES_BY_VECTOR, type UpkeepTypesValue} from "../models/Upkeep.ts";
import * as s from './upkeepBar.css.ts';
import {selectAetherAtmosphere} from "../store/homogeneousValues/selectors.ts";
import {
    AETHER_ATMOSPHERES,
    AETHER_ATMOSPHERE_LABELS,
    type AetherAtmosphereResolution,
} from "../models/city/AetherAtmosphere.ts";

const SIGNATURE_COLOR_STOPS = [
    {ratio: 0, color: [126, 137, 151]},
    {ratio: 0.35, color: [47, 158, 68]},
    {ratio: 0.7, color: [245, 159, 0]},
    {ratio: 1, color: [217, 72, 15]},
];

const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
});

function getSignatureColor(ratio: number) {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const upperStopIndex = SIGNATURE_COLOR_STOPS.findIndex(stop => clampedRatio <= stop.ratio);
    const upperStop = SIGNATURE_COLOR_STOPS[Math.max(upperStopIndex, 1)];
    const lowerStop = SIGNATURE_COLOR_STOPS[Math.max(upperStopIndex - 1, 0)];
    const localRatio = upperStop.ratio === lowerStop.ratio
        ? 0
        : (clampedRatio - lowerStop.ratio) / (upperStop.ratio - lowerStop.ratio);
    const [red, green, blue] = upperStop.color.map((channel, index) => {
        const lowerChannel = lowerStop.color[index];
        return Math.round(lowerChannel + (channel - lowerChannel) * localRatio);
    });

    return `rgb(${red} ${green} ${blue})`;
}

export const UpkeepBar = ({rightSlot}: {rightSlot?: ReactNode}) => {
    const {providedUpkeep, effectiveUpkeep, effectiveSignature} = useTypedSelector(selectTowerAwareCityResolution);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const aetherAtmosphere = useTypedSelector(selectAetherAtmosphere);
    const signatureFillColor = getSignatureColor(signatureStatus.fillRatio);

    return (
        <div className={s.upkeepBar}>
            {Object.values(DEVELOPMENT_VECTORS).map(vector => {
                if (vector === DEVELOPMENT_VECTORS.aether) {
                    return hasAetherAtmosphere(aetherAtmosphere)
                        ? (
                            <div key={vector.description} className={s.vectorCard}>
                                <AetherAtmosphereOrb atmosphere={aetherAtmosphere} />
                            </div>
                        )
                        : null;
                }

                const visibleResources = UPKEEP_TYPES_BY_VECTOR[vector].filter(resource => isResourceProduced(resource, providedUpkeep));
                if (!visibleResources.length) return null;

                return (
                    <div key={vector.description} className={s.vectorCard}>
                        {visibleResources.map(resource => {
                            return (
                                <div key={resource} className={s.resourceEntry}>
                                    <img  className={s.resourceIcon}/>
                                    <div className={s.resourceText}>
                                        {UPKEEP_SPRITES[resource]}: {effectiveUpkeep[resource] || 0}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
            <div
                className={s.signatureMeter}
                aria-label={`City signature ${formatKilometers(effectiveSignature)} of ${formatKilometers(signatureStatus.controlledTerritory)} controlled territory, ${formatKilometers(signatureStatus.cityFootprint)} footprint`}
            >
                <div className={s.signatureMeterHeader}>
                    <span className={s.signatureMeterTitle}>City Signature</span>
                    <span className={signatureStatus.isBesieged ? s.signatureStageBesieged : s.signatureStageStable}>
                        {signatureStatus.isBesieged ? "Besieged" : "Stable"}
                    </span>
                </div>
                <div className={s.signatureTrack}>
                    <div
                        className={s.signatureFootprintFill}
                        style={{
                            width: `${signatureStatus.footprintFillRatio * 100}%`,
                        }}
                    />
                    <div
                        className={s.signatureFill}
                        style={{
                            left: `${signatureStatus.footprintFillRatio * 100}%`,
                            width: `${signatureStatus.activeFillRatio * 100}%`,
                            backgroundColor: signatureFillColor,
                        }}
                    />
                </div>
                <div className={s.signatureNumbers}>
                    <span>{formatKilometers(effectiveSignature)}/{formatKilometers(signatureStatus.controlledTerritory)}</span>
                    <span>Footprint {formatKilometers(signatureStatus.cityFootprint)}</span>
                </div>
            </div>
            {rightSlot && <div className={s.rightSlot}>{rightSlot}</div>}
        </div>
    )
}

function AetherAtmosphereOrb({atmosphere}: {atmosphere: AetherAtmosphereResolution}) {
    const red = getSaturatedColor([255, 38, 38], atmosphere.totals.manaFlows);
    const blue = getSaturatedColor([46, 116, 255], atmosphere.totals.veil);
    const black = getSaturatedColor([0, 0, 0], atmosphere.totals.death);
    const center = getMixedAetherColor(
        atmosphere.totals.manaFlows,
        atmosphere.totals.veil,
        atmosphere.totals.death,
    );

    const background = [
        `radial-gradient(circle at 50% 50%, ${center} 0%, ${center} 24%, transparent 25%)`,
        `radial-gradient(circle at 8% 48%, ${red} 0%, rgba(255,255,255,0) 66%)`,
        `radial-gradient(circle at 92% 48%, ${blue} 0%, rgba(255,255,255,0) 66%)`,
        `radial-gradient(circle at 50% 106%, ${black} 0%, rgba(255,255,255,0) 70%)`,
        "radial-gradient(circle at 32% 22%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.16) 24%, rgba(255,255,255,0) 46%)",
        "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(245,247,255,0.28))",
    ].join(", ");

    return (
        <div className={s.aetherOrbWrap} tabIndex={0} aria-label="Aether atmosphere">
            <div className={s.aetherOrb} style={{background}} />
            <div className={s.aetherTooltip} role="tooltip">
                <div className={s.aetherTooltipTitle}>Aether atmosphere</div>
                {AETHER_ATMOSPHERES.map(atmosphereKey => {
                    const label = AETHER_ATMOSPHERE_LABELS[atmosphereKey];
                    const level = atmosphere.levels[atmosphereKey];

                    return (
                        <div className={s.aetherTooltipRow} key={atmosphereKey}>
                            <span>{label.name}</span>
                            <strong>{label.levels[level]}</strong>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function isResourceProduced(resource: UpkeepTypesValue, providedUpkeep: Partial<Record<UpkeepTypesValue, number>>): boolean {
    return (providedUpkeep[resource] ?? 0) !== 0;
}

function hasAetherAtmosphere(atmosphere: AetherAtmosphereResolution): boolean {
    return AETHER_ATMOSPHERES.some(atmosphereKey => atmosphere.totals[atmosphereKey] !== 0);
}

function formatKilometers(value: number): string {
    return `${numberFormatter.format(value)} km`;
}

function getSaturatedColor(target: [number, number, number], value: number): string {
    const strength = normalizeAetherComponent(value);
    const [red, green, blue] = target.map(channel => Math.round(255 + (channel - 255) * strength));

    return `rgb(${red} ${green} ${blue})`;
}

function getMixedAetherColor(manaFlows: number, veil: number, death: number): string {
    const redStrength = normalizeAetherComponent(manaFlows);
    const blueStrength = normalizeAetherComponent(veil);
    const blackStrength = normalizeAetherComponent(death);
    const totalStrength = redStrength + blueStrength + blackStrength;

    if (totalStrength <= 0) return "rgb(255 255 255)";

    const target = [
        (255 * redStrength + 46 * blueStrength + 0 * blackStrength) / totalStrength,
        (38 * redStrength + 116 * blueStrength + 0 * blackStrength) / totalStrength,
        (38 * redStrength + 255 * blueStrength + 0 * blackStrength) / totalStrength,
    ] as const;
    const saturation = Math.min(1, totalStrength / 3);
    const mixed = target.map(channel => Math.round(255 + (channel - 255) * saturation));

    return `rgb(${mixed[0]} ${mixed[1]} ${mixed[2]})`;
}

function normalizeAetherComponent(value: number): number {
    return Math.max(0, Math.min(1, value / 5));
}

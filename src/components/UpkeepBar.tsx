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

const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
});

function getThreatFillColor(ratio: number) {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const hue = 128 - clampedRatio * 122;

    return `hsl(${hue} 72% 42%)`;
}

export const UpkeepBar = ({rightSlot}: {rightSlot?: ReactNode}) => {
    const {providedUpkeep, effectiveUpkeep, effectiveSignature} = useTypedSelector(selectTowerAwareCityResolution);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const aetherAtmosphere = useTypedSelector(selectAetherAtmosphere);
    const showAetherAtmosphere = hasAetherAtmosphere(aetherAtmosphere);
    const threatPercent = Math.round(signatureStatus.fillRatio * 100);
    const threatLevel = getThreatLevel(signatureStatus.fillRatio);
    const threatLabel = signatureStatus.isBesieged ? "SIEGE" : `Threat level: ${threatLevel}`;
    const signatureFillColor = getThreatFillColor(signatureStatus.fillRatio);

    return (
        <div className={s.upkeepBar}>
            <div className={s.resourceGroup}>
                {Object.values(DEVELOPMENT_VECTORS).map(vector => {
                    if (vector === DEVELOPMENT_VECTORS.aether) {
                        return null;
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
            </div>
            <div
                className={s.signatureMeter}
                tabIndex={0}
                aria-label={`${threatLabel}. City signature ${formatKilometers(effectiveSignature)}, city footprint ${formatKilometers(signatureStatus.cityFootprint)}, controlled territory ${formatKilometers(signatureStatus.controlledTerritory)}`}
            >
                <div className={signatureStatus.isBesieged ? s.signatureMeterTitleSiege : s.signatureMeterTitle}>
                    {threatLabel}
                </div>
                <div className={s.signatureTrack}>
                    <div
                        className={s.signatureFill}
                        style={{
                            width: `${threatPercent}%`,
                            backgroundColor: signatureFillColor,
                        }}
                    />
                </div>
                <div className={s.signatureTooltip} role="tooltip">
                    <div className={s.signatureTooltipRow}>
                        <span>City signature</span>
                        <strong>{formatKilometers(effectiveSignature)}</strong>
                    </div>
                    <div className={s.signatureTooltipRow}>
                        <span>City footprint</span>
                        <strong>{formatKilometers(signatureStatus.cityFootprint)}</strong>
                    </div>
                    <div className={s.signatureTooltipRow}>
                        <span>Controlled territory</span>
                        <strong>{formatKilometers(signatureStatus.controlledTerritory)}</strong>
                    </div>
                </div>
            </div>
            <div className={s.rightGroup}>
                {showAetherAtmosphere && (
                    <div className={s.aetherMeterSlot}>
                        <AetherAtmosphereOrb atmosphere={aetherAtmosphere} />
                    </div>
                )}
                {rightSlot && <div className={s.rightSlot}>{rightSlot}</div>}
            </div>
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
        <div
            className={s.aetherOrbWrap}
            tabIndex={0}
            aria-label="Aether atmosphere"
        >
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

function getThreatLevel(ratio: number): string {
    const percent = Math.max(0, Math.min(100, ratio * 100));

    if (percent < 20) return "low";
    if (percent < 40) return "elevated";
    if (percent < 60) return "medium";
    if (percent < 80) return "moderate";

    return "high";
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

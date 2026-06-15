import {useTypedSelector} from "../store/hooks.ts";
import {selectCityTraceStatus, selectTowerAwareCityResolution} from "../store/upkeep/selectors.ts";
import {DEVELOPMENT_VECTORS} from "../models/DevlopmentVector.ts";
import {UPKEEP_TYPES_BY_VECTOR} from "../models/Upkeep.ts";
import * as s from './upkeepBar.css.ts';

const TRACE_COLOR_STOPS = [
    {ratio: 0, color: [126, 137, 151]},
    {ratio: 0.35, color: [47, 158, 68]},
    {ratio: 0.7, color: [245, 159, 0]},
    {ratio: 1, color: [217, 72, 15]},
];

function getTraceColor(ratio: number) {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const upperStopIndex = TRACE_COLOR_STOPS.findIndex(stop => clampedRatio <= stop.ratio);
    const upperStop = TRACE_COLOR_STOPS[Math.max(upperStopIndex, 1)];
    const lowerStop = TRACE_COLOR_STOPS[Math.max(upperStopIndex - 1, 0)];
    const localRatio = upperStop.ratio === lowerStop.ratio
        ? 0
        : (clampedRatio - lowerStop.ratio) / (upperStop.ratio - lowerStop.ratio);
    const [red, green, blue] = upperStop.color.map((channel, index) => {
        const lowerChannel = lowerStop.color[index];
        return Math.round(lowerChannel + (channel - lowerChannel) * localRatio);
    });

    return `rgb(${red} ${green} ${blue})`;
}

export const UpkeepBar = () => {
    const {effectiveUpkeep, effectiveTrace} = useTypedSelector(selectTowerAwareCityResolution);
    const traceStatus = useTypedSelector(selectCityTraceStatus);
    const traceFillColor = getTraceColor(traceStatus.fillRatio);

    return (
        <div className={s.upkeepBar}>
            {Object.values(DEVELOPMENT_VECTORS).map(vector => {
                return (
                    <div key={vector.description} className={s.vectorCard}>
                        {UPKEEP_TYPES_BY_VECTOR[vector].map(resource => {
                            return (
                                <div key={resource.description} className={s.resourceEntry}>
                                    <img  className={s.resourceIcon}/>
                                    <div className={s.resourceText}>
                                        {resource.description}: {effectiveUpkeep[resource] || 0}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
            <div
                className={s.traceMeter}
                aria-label={`City trace ${effectiveTrace} of ${traceStatus.resilience} resilience, ${traceStatus.scarTrace} trail`}
            >
                <div className={s.traceMeterHeader}>
                    <span className={s.traceMeterTitle}>City Trace</span>
                    <span className={traceStatus.isBesieged ? s.traceStageBesieged : s.traceStageStable}>
                        {traceStatus.isBesieged ? "Besieged" : "Stable"}
                    </span>
                </div>
                <div className={s.traceTrack}>
                    <div
                        className={s.traceScarFill}
                        style={{
                            width: `${traceStatus.scarFillRatio * 100}%`,
                        }}
                    />
                    <div
                        className={s.traceFill}
                        style={{
                            left: `${traceStatus.scarFillRatio * 100}%`,
                            width: `${traceStatus.activeFillRatio * 100}%`,
                            backgroundColor: traceFillColor,
                        }}
                    />
                </div>
                <div className={s.traceNumbers}>
                    <span>{effectiveTrace}/{traceStatus.resilience}</span>
                    <span>Trail {traceStatus.scarTrace}</span>
                </div>
            </div>
        </div>
    )
}

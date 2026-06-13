import {useTypedSelector} from "../store/hooks.ts";
import {selectResilience, selectTowerAwareCityResolution} from "../store/upkeep/selectors.ts";
import {DEVELOPMENT_VECTORS} from "../models/DevlopmentVector.ts";
import {UPKEEP_TYPES_BY_VECTOR} from "../models/Upkeep.ts";
import * as s from './upkeepBar.css.ts';

export const UpkeepBar = () => {
    const {effectiveUpkeep, effectiveTrace} = useTypedSelector(selectTowerAwareCityResolution);
    const resilience = useTypedSelector(selectResilience);

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
            <div className={s.traceMeter}>
                {//TODO: add trace meter
                }
                {`City trace: ${effectiveTrace}   Resilience: ${resilience}`}
            </div>
        </div>
    )
}

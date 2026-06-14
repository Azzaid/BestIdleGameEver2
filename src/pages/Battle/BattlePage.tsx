import {BattleStage} from "./ui/BattleStage.tsx";
import { useTypedDispatch, useTypedSelector } from "../../store/hooks.ts";
import { selectHasActiveTowerBuild, selectResolvedActiveTower } from "../../store/towers/selectors.ts";
import * as styles from './BattlePage.css.ts';
import { selectCitySideHexes } from "../../store/city/selectors.ts";
import { BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX } from "../../data/constants.ts";
import { Link } from "react-router-dom";
import { recordWaveThreatReached } from "../../store/upkeep/slice.ts";

const BATTLEFIELD_RANGE_MULTIPLIER = 1.2;
const WALL_APRON_HEIGHT = 80;

const BattlePage = () => {
    const dispatch = useTypedDispatch();
    const resolvedTower = useTypedSelector(selectResolvedActiveTower);
    const hasActiveTowerBuild = useTypedSelector(selectHasActiveTowerBuild);
    const citySideHexes = useTypedSelector(selectCitySideHexes);
    const wallLogicalWidth = citySideHexes * BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX;
    const battlefieldLength = resolvedTower.stats.targetingDistanceLimit * BATTLEFIELD_RANGE_MULTIPLIER;
    const battlefieldHeight = battlefieldLength + WALL_APRON_HEIGHT;

    return (
        <div className={styles.battlePage}>
            {hasActiveTowerBuild ? (
                <BattleStage
                    wallLogicalWidth={wallLogicalWidth}
                    battlefieldWidth={wallLogicalWidth}
                    battlefieldHeight={battlefieldHeight}
                    wallY={battlefieldLength}
                    resolvedTower={resolvedTower}
                    onWaveThreatReached={(threat) => dispatch(recordWaveThreatReached(threat))}
                />
            ) : (
                <section className={styles.battleLocked}>
                    <h1 className={styles.battleLockedTitle}>Battle Locked</h1>
                    <p className={styles.battleLockedText}>
                        Assemble the first tower and rebuild it before sending defenders to the wall.
                    </p>
                    <Link className={styles.battleLockedLink} to="/build">Build First Tower</Link>
                </section>
            )}
        </div>
    );
};

export default BattlePage;

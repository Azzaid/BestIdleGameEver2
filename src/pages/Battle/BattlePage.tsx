import {BattleStage} from "./ui/BattleStage.tsx";
import { useTypedSelector } from "../../store/hooks.ts";
import { selectResolvedActiveTower } from "../../store/towers/selectors.ts";
import * as styles from './BattlePage.css.ts';
import { selectCitySideHexes } from "../../store/city/selectors.ts";
import { BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX } from "../../data/constants.ts";

const BATTLEFIELD_RANGE_MULTIPLIER = 1.2;
const WALL_APRON_HEIGHT = 80;

const BattlePage = () => {
    const resolvedTower = useTypedSelector(selectResolvedActiveTower);
    const citySideHexes = useTypedSelector(selectCitySideHexes);
    const wallLogicalWidth = citySideHexes * BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX;
    const battlefieldLength = resolvedTower.stats.targetingDistanceLimit * BATTLEFIELD_RANGE_MULTIPLIER;
    const battlefieldHeight = battlefieldLength + WALL_APRON_HEIGHT;

    return (
        <div className={styles.battlePage}>
            <BattleStage
                wallLogicalWidth={wallLogicalWidth}
                battlefieldWidth={wallLogicalWidth}
                battlefieldHeight={battlefieldHeight}
                wallY={battlefieldLength}
                resolvedTower={resolvedTower}
            />
        </div>
    );
};

export default BattlePage;

import {BattleStage} from "./ui/BattleStage.tsx";
import { useTypedSelector } from "../../store/hooks.ts";
import { selectResolvedActiveTower } from "../../store/towers/selectors.ts";
import * as styles from './BattlePage.css.ts';

const BattlePage = () => {
    const resolvedTower = useTypedSelector(selectResolvedActiveTower);

    return (
        <div className={styles.battlePage}>
            <BattleStage
                wallLogicalWidth={200}
                battlefieldWidth={400}
                battlefieldHeight={1600}
                resolvedTower={resolvedTower}
            />
        </div>
    );
};

export default BattlePage;

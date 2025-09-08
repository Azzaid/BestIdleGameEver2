import {BattleStage} from "./ui/BattleStage.tsx";

const BattlePage = () => {
    return (
        <div>
            <BattleStage wallLogicalWidth={200} battlefieldWidth={400} battlefieldHeight={1600}/>
        </div>
    );
};

export default BattlePage;
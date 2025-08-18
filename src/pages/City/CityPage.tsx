import { useState } from 'react';
import * as s from './CityPage.css.ts';
import CityHex from "./Components/CityHex/CityHex.tsx";
import type {AxialCoordinate} from "../../models/city/HexGrid.ts";
import {BuildingSelector} from "./Components/BuildingSelector/BuildingSelector.tsx";
import {type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {selectCityHexes} from "../../store/city/selectors.ts";
import {buildHex} from "../../store/city/slice.ts";

const CityPage = () => {
    const dispatch = useTypedDispatch();
    const hexes = useTypedSelector(selectCityHexes);
    const [selectedHex, setSelectedHex] = useState<AxialCoordinate | null>(null);

    const handleBuildingSelect = (buildingKey: string, developmentVector: DevelopmentVectorValue) => {
        dispatch(buildHex({...selectedHex!, buildingKey, developmentVector }))
    };

  return (
    <div className={s.cityPage}>
      <div className={s.cityContainer}>
        <CityHex cells={hexes} onSelect={setSelectedHex}/>
      </div>
        {selectedHex &&
            <BuildingSelector onBuild={handleBuildingSelect}/>
        }
    </div>
  );
};

export default CityPage;
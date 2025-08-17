import { useState } from 'react';
import * as s from './CityPage.css.ts';
import CityHex from "./Components/CityHex.tsx";
import type {AxialCoordinate, HexCell} from "../../models/city/HexGrid.ts";
import {BuildingSelector} from "./Components/BuildingSelector/BuildingSelector.tsx";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";

const CITY_RADIUS_IN_CELLS = 3;

const CityPage = () => {
    const [selected, setSelected] = useState<AxialCoordinate | null>(null);
    const [hexes, setHexes] = useState<HexCell[]>((() => {
        const generatedCells: HexCell[] = [];
        for (let column = -CITY_RADIUS_IN_CELLS; column <= CITY_RADIUS_IN_CELLS; column++) {
            const rowMin = Math.max(-CITY_RADIUS_IN_CELLS, -column - CITY_RADIUS_IN_CELLS);
            const rowMax = Math.min(CITY_RADIUS_IN_CELLS, -column + CITY_RADIUS_IN_CELLS);
            for (let row = rowMin; row <= rowMax; row++) {
                generatedCells.push({
                    column,
                    row,
                    buildingKey: null,
                    developmentVector: DEVELOPMENT_VECTORS.default,
                });
            }
        }
        return generatedCells;
    })());

    const handleBuildingSelect = (buildingID: string, developmentVector: DevelopmentVectorValue) => {
        if (!selected) return;
        const newHexes = [...hexes];
        const selectedHex = newHexes.find(hex => hex.column === selected.column && hex.row === selected.row);
        if (!selectedHex) return;
        selectedHex.buildingKey = buildingID;
        selectedHex.developmentVector = developmentVector;
        setHexes(newHexes);
    };

  return (
    <div className={s.cityPage}>
      <h1>City View</h1>
      <div className={s.cityContainer}>
        <CityHex cells={hexes} onSelect={setSelected}/>
      </div>
        {selected &&
            <BuildingSelector onBuild={handleBuildingSelect}/>
        }
      <div className={s.cityControls}>
        <div className={s.resources}>
          <div className={s.resource}>
            <span className={s.resourceName}>Gold:</span>
            <span className={s.resourceValue}>1,250</span>
          </div>
          <div className={s.resource}>
            <span className={s.resourceName}>Population:</span>
            <span className={s.resourceValue}>42</span>
          </div>
          <div className={s.resource}>
            <span className={s.resourceName}>Research Points:</span>
            <span className={s.resourceValue}>75</span>
          </div>
        </div>
        <div className={s.actions}>
          <button className={s.actionButton}>Build New</button>
          <button className={s.actionButton}>Collect Resources</button>
        </div>
      </div>
    </div>
  );
};

export default CityPage;
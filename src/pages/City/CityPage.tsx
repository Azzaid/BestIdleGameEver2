import {useRef, useEffect, useState} from 'react';
import * as s from './CityPage.css.ts';
import CityHex from "./Components/CityHex.tsx";
import {spriteAtlas} from "./Components/spriteAtlas.ts";

// Define building types
interface Building {
  id: string;
  name: string;
  type: string;
  level: number;
  description: string;
}

const CityPage = () => {
    const [selected, setSelected] = useState<Building | null>(null);

  return (
    <div className={s.cityPage}>
      <h1>City View</h1>
      <div className={s.cityContainer}>
        <CityHex spriteAtlas={spriteAtlas} onSelect={setSelected}/>
      </div>
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
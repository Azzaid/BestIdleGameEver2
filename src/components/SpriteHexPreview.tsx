import type {CSSProperties} from "react";
import {CITY_HEX_RADIUS, CITY_HEX_WIDTH} from "../data/constants.ts";
import * as s from "./SpriteHexPreview.css.ts";

type SpriteHexPreviewProps = {
  src: string;
  alt: string;
  imageStyle?: CSSProperties;
};

export function SpriteHexPreview({src, alt, imageStyle}: SpriteHexPreviewProps) {
  const imageTransform = imageStyle?.transform ? `${imageStyle.transform}` : "";

  return (
    <div className={s.stage}>
      <div
        className={s.hex}
        style={{
          width: CITY_HEX_WIDTH,
          height: CITY_HEX_RADIUS * 2,
        }}
      >
        <svg width={CITY_HEX_WIDTH} height={CITY_HEX_RADIUS * 2} viewBox={`0 0 ${CITY_HEX_WIDTH} ${CITY_HEX_RADIUS * 2}`}>
          <polygon
            points={[
              `${CITY_HEX_WIDTH / 2},0`,
              `${CITY_HEX_WIDTH},${CITY_HEX_RADIUS / 2}`,
              `${CITY_HEX_WIDTH},${CITY_HEX_RADIUS * 1.5}`,
              `${CITY_HEX_WIDTH / 2},${CITY_HEX_RADIUS * 2}`,
              `0,${CITY_HEX_RADIUS * 1.5}`,
              `0,${CITY_HEX_RADIUS / 2}`,
            ].join(" ")}
            fill="currentColor"
            fillOpacity={0.1}
            stroke="currentColor"
            strokeWidth={1}
          />
        </svg>
      </div>
      <img
        className={s.image}
        src={src}
        alt={alt}
        style={{
          ...imageStyle,
          transform: `translate(-50%, -50%) ${imageTransform}`.trim(),
        }}
      />
    </div>
  );
}

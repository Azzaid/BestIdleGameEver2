import {useEffect, useRef, type CSSProperties} from "react";
import {CITY_HEX_RADIUS, CITY_HEX_WIDTH} from "../data/constants.ts";
import * as s from "./SpriteHexPreview.css.ts";

type SpriteHexPreviewProps = {
  src: string;
  alt: string;
  imageStyle?: CSSProperties;
  visualZoom?: number;
};

export function SpriteHexPreview({src, alt, imageStyle, visualZoom = 1}: SpriteHexPreviewProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageTransform = imageStyle?.transform ? `${imageStyle.transform}` : "";
  const previewSize = CITY_HEX_RADIUS * 2;
  const hexHeight = previewSize;
  const center = {
    x: CITY_HEX_WIDTH / 2,
    y: CITY_HEX_RADIUS,
  };
  const contentWidth = Math.max(previewSize, CITY_HEX_WIDTH * visualZoom);
  const contentHeight = Math.max(previewSize, hexHeight * visualZoom);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
    stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
  }, [contentHeight, contentWidth, src, visualZoom]);

  return (
    <div ref={stageRef} className={s.stage} style={{width: previewSize, height: previewSize}}>
      <div className={s.content} style={{width: contentWidth, height: contentHeight}}>
        <div
          className={s.surface}
          style={{
            width: CITY_HEX_WIDTH,
            height: hexHeight,
            transform: `translate(-50%, -50%) scale(${visualZoom})`,
          }}
        >
          <svg width={CITY_HEX_WIDTH} height={hexHeight} viewBox={`0 0 ${CITY_HEX_WIDTH} ${hexHeight}`}>
            <polygon
              className={s.hexFull}
              points={getHexPoints(center, CITY_HEX_RADIUS)}
              vectorEffect="non-scaling-stroke"
            />
            <polygon
              className={s.hexHalf}
              points={getHexPoints(center, CITY_HEX_RADIUS / 2)}
              vectorEffect="non-scaling-stroke"
            />
            <polygon
              className={s.hexQuarter}
              points={getHexPoints(center, CITY_HEX_RADIUS / 4)}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
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
      </div>
    </div>
  );
}

function getHexPoints(center: {x: number; y: number}, radius: number) {
  const width = Math.sqrt(3) * radius;

  return [
    `${center.x},${center.y - radius}`,
    `${center.x + width / 2},${center.y - radius / 2}`,
    `${center.x + width / 2},${center.y + radius / 2}`,
    `${center.x},${center.y + radius}`,
    `${center.x - width / 2},${center.y + radius / 2}`,
    `${center.x - width / 2},${center.y - radius / 2}`,
  ].join(" ");
}

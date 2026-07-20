import {useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent} from "react";
import {AnimatedSprite, Application, Spritesheet, Texture} from "pixi.js";
import type {EnemyVisualMetadata} from "../../models/battle/enemyVisualMetadata.ts";
import * as s from "./EnemyAnimationSpriteSheetPage.css.ts";

const localDataServerUrl = "http://127.0.0.1:4317";
const enemyBiomes = ["wasteland"] as const;

type EnemyBiome = typeof enemyBiomes[number];

type FrameSettings = {
  length: string;
  initialShift: string;
  gap: string;
};

type SaveStatus = {
  kind: "idle" | "saving" | "success" | "error";
  message: string;
};

type PixiAtlas = {
  frames: Record<string, {
    frame: {x: number; y: number; w: number; h: number};
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: {x: number; y: number; w: number; h: number};
    sourceSize: {w: number; h: number};
    duration?: number;
  }>;
  animations: Record<string, string[]>;
  meta: {
    image: string;
    format: "RGBA8888";
    size: {w: number; h: number};
    scale: "1";
    enemyVisualMetadata: EnemyVisualMetadata;
  };
};

type FrameRect = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function EnemyAnimationSpriteSheetPage() {
  const [biome, setBiome] = useState<EnemyBiome>("wasteland");
  const [name, setName] = useState("");
  const [xSettings, setXSettings] = useState<FrameSettings>({length: "48", initialShift: "0", gap: "0"});
  const [ySettings, setYSettings] = useState<FrameSettings>({length: "48", initialShift: "0", gap: "0"});
  const [fps, setFps] = useState("8");
  const [targetWidth, setTargetWidth] = useState("48");
  const [targetHeight, setTargetHeight] = useState("48");
  const [rotationDegrees, setRotationDegrees] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jsonFileName, setJsonFileName] = useState("");
  const [uploadedAtlas, setUploadedAtlas] = useState<PixiAtlas | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageSize, setImageSize] = useState({width: 0, height: 0});
  const [status, setStatus] = useState<SaveStatus>({kind: "idle", message: ""});

  const fileStem = useMemo(() => `enemy_${normalizeFileStem(name || file?.name || "new_animation")}`, [file?.name, name]);
  const generatedFrameRects = useMemo(
    () => createFrameRects(fileStem, imageSize, xSettings, ySettings),
    [fileStem, imageSize, xSettings, ySettings],
  );
  const atlas = useMemo(
    () => uploadedAtlas ? normalizeUploadedAtlas({
      atlas: uploadedAtlas,
      fileName: `${fileStem}.png`,
      textureKey: fileStem,
      imageSize,
      fps: parsePositiveNumber(fps, getAtlasFps(uploadedAtlas) ?? 8),
      targetWidth: parsePositiveNumber(targetWidth, getAtlasTargetSize(uploadedAtlas)?.width ?? parsePositiveNumber(xSettings.length, 48)),
      targetHeight: parsePositiveNumber(targetHeight, getAtlasTargetSize(uploadedAtlas)?.height ?? parsePositiveNumber(ySettings.length, 48)),
      rotationDegrees: parseOptionalNumber(rotationDegrees),
    }) : createAtlas({
      fileName: `${fileStem}.png`,
      textureKey: fileStem,
      imageSize,
      frames: generatedFrameRects,
      fps: parsePositiveNumber(fps, 8),
      targetWidth: parsePositiveNumber(targetWidth, parsePositiveNumber(xSettings.length, 48)),
      targetHeight: parsePositiveNumber(targetHeight, parsePositiveNumber(ySettings.length, 48)),
      rotationDegrees: parseOptionalNumber(rotationDegrees),
    }),
    [fileStem, fps, generatedFrameRects, imageSize, rotationDegrees, targetHeight, targetWidth, uploadedAtlas, xSettings.length, ySettings.length],
  );
  const frameRects = useMemo(
    () => getFrameRectsFromAtlas(atlas),
    [atlas],
  );
  const frameKeys = useMemo(
    () => getAnimationFrameKeys(atlas, fileStem),
    [atlas, fileStem],
  );
  const atlasText = useMemo(() => JSON.stringify(atlas, null, 2), [atlas]);
  const guideViewBox = imageSize.width && imageSize.height ? `0 0 ${imageSize.width} ${imageSize.height}` : undefined;

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    if (nextFile) loadImageFile(nextFile);
  }

  function loadImageFile(nextFile: File) {
    setStatus({kind: "idle", message: ""});

    if (nextFile.type !== "image/png") {
      setStatus({kind: "error", message: "Choose a PNG sprite sheet."});
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreviewUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setPreviewUrl(nextPreviewUrl);
    if (!name.trim()) setName(normalizeDisplayName(nextFile.name));

    readImageSize(nextPreviewUrl)
      .then(size => {
        setImageSize(size);
        setXSettings(current => ({...current, length: current.length || String(Math.max(1, Math.floor(size.width / 4)))}));
        setYSettings(current => ({...current, length: current.length || String(size.height)}));
      })
      .catch(() => setStatus({kind: "error", message: "Sprite sheet could not be measured."}));
  }

  async function handleJsonFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (nextFile) await loadJsonFile(nextFile);
  }

  async function loadJsonFile(nextFile: File) {
    setStatus({kind: "idle", message: ""});

    if (!nextFile.name.toLowerCase().endsWith(".json")) {
      setStatus({kind: "error", message: "Choose a JSON atlas file."});
      return;
    }

    try {
      const parsed = JSON.parse(await nextFile.text()) as unknown;
      const nextAtlas = parseUploadedAtlas(parsed);
      setUploadedAtlas(nextAtlas);
      setJsonFileName(nextFile.name);

      const inferredFps = getAtlasFps(nextAtlas);
      const inferredTargetSize = getAtlasTargetSize(nextAtlas);
      const inferredRotationDegrees = getAtlasRotationDegrees(nextAtlas);
      if (inferredFps) setFps(formatNumber(inferredFps));
      if (inferredTargetSize) {
        setTargetWidth(String(inferredTargetSize.width));
        setTargetHeight(String(inferredTargetSize.height));
      }
      setRotationDegrees(inferredRotationDegrees === null ? "" : formatNumber(inferredRotationDegrees));
      if (!name.trim()) setName(normalizeDisplayName(nextFile.name));
    } catch (caught) {
      setUploadedAtlas(null);
      setJsonFileName("");
      setStatus({
        kind: "error",
        message: caught instanceof Error ? caught.message : "JSON atlas could not be loaded.",
      });
    }
  }

  function clearJsonAtlas() {
    setUploadedAtlas(null);
    setJsonFileName("");
    setStatus({kind: "idle", message: ""});
  }

  async function handleDrop(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    const droppedFiles = [...event.dataTransfer.files];
    const png = droppedFiles.find(droppedFile => droppedFile.type === "image/png");
    const json = droppedFiles.find(droppedFile => droppedFile.name.toLowerCase().endsWith(".json"));

    if (png) {
      loadImageFile(png);
    }
    if (json) {
      await loadJsonFile(json);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setStatus({kind: "error", message: "Choose a PNG sprite sheet first."});
      return;
    }

    if (!frameKeys.length) {
      setStatus({kind: "error", message: "Frame settings do not produce any full frames."});
      return;
    }

    setStatus({kind: "saving", message: "Saving animation..."});

    const formData = new FormData();
    formData.set("biome", biome);
    formData.set("fileStem", fileStem);
    formData.set("atlas", atlasText);
    formData.set("image", file, file.name);

    try {
      const response = await fetch(`${localDataServerUrl}/enemy-animation-sprites`, {
        method: "POST",
        body: formData,
      });
      const responseBody = await response.json().catch(() => undefined) as {error?: string; imageFile?: string; atlasFile?: string} | undefined;

      if (!response.ok) {
        throw new Error(responseBody?.error ?? `Save failed with status ${response.status}.`);
      }

      setStatus({
        kind: "success",
        message: `Saved ${responseBody?.imageFile ?? `${fileStem}.png`} and ${responseBody?.atlasFile ?? `${fileStem}.json`}. Restart Vite if the monster picker does not show it yet.`,
      });
    } catch (caught) {
      setStatus({
        kind: "error",
        message: caught instanceof Error ? caught.message : "Could not reach the local data server.",
      });
    }
  }

  return (
    <div className={s.page}>
      <aside className={s.panel}>
        <div className={s.header}>
          <h1 className={s.title}>Enemy Animations</h1>
          <p className={s.subtitle}>Upload a sprite sheet and save it as a selectable monster sprite.</p>
        </div>

        <form className={s.form} onSubmit={handleSubmit} onDragOver={event => event.preventDefault()} onDrop={handleDrop}>
          <label className={s.field}>
            <span className={s.label}>Biome</span>
            <select className={s.input} value={biome} onChange={event => setBiome(event.target.value as EnemyBiome)}>
              {enemyBiomes.map(option => <option key={option} value={option}>{formatLabel(option)}</option>)}
            </select>
          </label>

          <label className={s.field}>
            <span className={s.label}>Sprite set name</span>
            <input className={s.input} value={name} onChange={event => setName(event.target.value)} placeholder="Scrapling walk" />
          </label>

          <label className={s.field}>
            <span className={s.label}>PNG sprite sheet</span>
            <input className={s.input} type="file" accept="image/png" onChange={handleFileChange} />
          </label>

          <label className={s.field}>
            <span className={s.label}>JSON atlas</span>
            <input className={s.input} type="file" accept="application/json,.json" onChange={handleJsonFileChange} />
          </label>

          {jsonFileName && (
            <div className={s.jsonStatus}>
              <span>{jsonFileName}</span>
              <button className={s.secondaryButton} type="button" onClick={clearJsonAtlas}>Use grid</button>
            </div>
          )}

          <div className={s.grid}>
            <NumberField label="X length" value={xSettings.length} onChange={value => setXSettings(current => ({...current, length: value}))} />
            <NumberField label="Y length" value={ySettings.length} onChange={value => setYSettings(current => ({...current, length: value}))} />
            <NumberField label="X initial shift" value={xSettings.initialShift} onChange={value => setXSettings(current => ({...current, initialShift: value}))} />
            <NumberField label="Y initial shift" value={ySettings.initialShift} onChange={value => setYSettings(current => ({...current, initialShift: value}))} />
            <NumberField label="X gap" value={xSettings.gap} onChange={value => setXSettings(current => ({...current, gap: value}))} />
            <NumberField label="Y gap" value={ySettings.gap} onChange={value => setYSettings(current => ({...current, gap: value}))} />
            <NumberField label="FPS" value={fps} onChange={setFps} />
            <NumberField label="Rotation" value={rotationDegrees} onChange={setRotationDegrees} />
            <NumberField label="Target width" value={targetWidth} onChange={setTargetWidth} />
            <NumberField label="Target height" value={targetHeight} onChange={setTargetHeight} />
          </div>

          <div className={`${s.field} ${s.fullWidth}`}>
            <span className={s.label}>Texture key</span>
            <div className={s.input}>{fileStem}</div>
          </div>

          <button className={s.button} type="submit" disabled={status.kind === "saving"}>
            {status.kind === "saving" ? "Saving..." : "Save Animation"}
          </button>
          {status.message && (
            <p className={status.kind === "error" ? s.error : s.status}>{status.message}</p>
          )}
        </form>
      </aside>

      <main className={s.panel}>
        <div className={s.header}>
          <h2 className={s.title}>Preview</h2>
          <p className={s.subtitle}>{frameKeys.length} frames {uploadedAtlas ? "loaded from JSON atlas" : "generated from the current cut settings"}.</p>
        </div>

        <div className={s.previewGrid}>
          <div className={s.imagePreview}>
            {previewUrl && (
              <>
                <img className={s.sheetImage} src={previewUrl} alt="" />
                {guideViewBox && (
                  <svg className={s.guideLayer} viewBox={guideViewBox} preserveAspectRatio="xMinYMin meet">
                    {frameRects.map(rect => (
                      <rect
                        key={rect.key}
                        x={rect.x}
                        y={rect.y}
                        width={rect.width}
                        height={rect.height}
                        fill="none"
                        stroke="#29e66f"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </svg>
                )}
              </>
            )}
          </div>

          <PixiAnimationPreview
            atlas={atlas}
            frameKeys={frameKeys}
            imageUrl={previewUrl}
            targetWidth={parsePositiveNumber(targetWidth, 48)}
            targetHeight={parsePositiveNumber(targetHeight, 48)}
            fps={parsePositiveNumber(fps, 8)}
            rotationDegrees={parseOptionalNumber(rotationDegrees)}
          />
        </div>

        <pre className={s.atlasPreview}>{atlasText}</pre>
      </main>
    </div>
  );
}

function NumberField({label, value, onChange}: {label: string; value: string; onChange: (value: string) => void}) {
  return (
    <label className={s.field}>
      <span className={s.label}>{label}</span>
      <input className={s.input} type="number" value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}

function PixiAnimationPreview(props: {
  atlas: PixiAtlas;
  frameKeys: string[];
  imageUrl: string;
  targetWidth: number;
  targetHeight: number;
  fps: number;
  rotationDegrees?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let app: Application | null = null;
    let sheet: Spritesheet | null = null;

    const destroyApp = () => {
      const currentApp = app;
      app = null;
      if (!currentApp) return;

      currentApp.destroy({removeView: true}, {children: true, texture: false, textureSource: false, context: true});
    };

    async function renderPreview() {
      if (!hostRef.current || !props.imageUrl || !props.frameKeys.length) return;

      const nextApp = new Application();
      await nextApp.init({
        width: 260,
        height: 260,
        backgroundAlpha: 0,
        antialias: true,
      });
      if (disposed || !hostRef.current) {
        nextApp.destroy({removeView: true}, {children: true, texture: false, textureSource: false, context: true});
        return;
      }

      app = nextApp;
      hostRef.current.replaceChildren(nextApp.canvas);

      const atlas = {
        ...props.atlas,
        meta: {
          ...props.atlas.meta,
          image: props.imageUrl,
        },
      };
      sheet = new Spritesheet({
        texture: Texture.from(props.imageUrl),
        data: atlas,
      });
      await sheet.parse();
      if (disposed || app !== nextApp) return;

      const textures = props.frameKeys
        .map(key => sheet?.textures[key])
        .filter((texture): texture is Texture => Boolean(texture));

      if (!textures.length) return;

      const animation = new AnimatedSprite(textures);
      animation.anchor.set(0.5);
      animation.x = nextApp.screen.width / 2;
      animation.y = nextApp.screen.height / 2;
      animation.width = props.targetWidth;
      animation.height = props.targetHeight;
      animation.rotation = (props.rotationDegrees ?? 0) * Math.PI / 180;
      animation.animationSpeed = props.fps / 60;
      animation.play();
      nextApp.stage.addChild(animation);
    }

    void renderPreview();

    return () => {
      disposed = true;
      sheet?.destroy(true);
      destroyApp();
      hostRef.current?.replaceChildren();
    };
  }, [props.atlas, props.fps, props.frameKeys, props.imageUrl, props.rotationDegrees, props.targetHeight, props.targetWidth]);

  return <div ref={hostRef} className={s.pixiHost} />;
}

function createFrameRects(
  textureKey: string,
  imageSize: {width: number; height: number},
  xSettings: FrameSettings,
  ySettings: FrameSettings,
): FrameRect[] {
  const width = parsePositiveNumber(xSettings.length, 0);
  const height = parsePositiveNumber(ySettings.length, 0);
  const startX = parseNumber(xSettings.initialShift, 0);
  const startY = parseNumber(ySettings.initialShift, 0);
  const stepX = width + parseNumber(xSettings.gap, 0);
  const stepY = height + parseNumber(ySettings.gap, 0);
  const frames: FrameRect[] = [];

  if (!imageSize.width || !imageSize.height || width <= 0 || height <= 0 || stepX <= 0 || stepY <= 0) return frames;

  let frameIndex = 0;
  for (let y = startY; y + height <= imageSize.height; y += stepY) {
    for (let x = startX; x + width <= imageSize.width; x += stepX) {
      if (x < 0 || y < 0) continue;
      frames.push({
        key: `${textureKey}_${String(frameIndex).padStart(3, "0")}`,
        x,
        y,
        width,
        height,
      });
      frameIndex += 1;
    }
  }

  return frames;
}

function createAtlas(args: {
  fileName: string;
  textureKey: string;
  imageSize: {width: number; height: number};
  frames: FrameRect[];
  fps: number;
  targetWidth: number;
  targetHeight: number;
  rotationDegrees?: number;
}): PixiAtlas {
  return {
    frames: Object.fromEntries(args.frames.map(frame => [
      frame.key,
      {
        frame: {x: frame.x, y: frame.y, w: frame.width, h: frame.height},
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x: 0, y: 0, w: frame.width, h: frame.height},
        sourceSize: {w: frame.width, h: frame.height},
      },
    ])),
    animations: {
      [args.textureKey]: args.frames.map(frame => frame.key),
    },
    meta: {
      image: args.fileName,
      format: "RGBA8888",
      size: {w: args.imageSize.width, h: args.imageSize.height},
      scale: "1",
      enemyVisualMetadata: createEnemyVisualMetadata({
        sourceSpriteSize: {width: args.frames[0]?.width ?? 1, height: args.frames[0]?.height ?? 1},
        targetSpriteSize: {width: args.targetWidth, height: args.targetHeight},
        rotationDegrees: args.rotationDegrees,
        animationFrames: args.frames.map(frame => frame.key),
        fps: args.fps,
      }),
    },
  };
}

function normalizeUploadedAtlas(args: {
  atlas: PixiAtlas;
  fileName: string;
  textureKey: string;
  imageSize: {width: number; height: number};
  fps: number;
  targetWidth: number;
  targetHeight: number;
  rotationDegrees?: number;
}): PixiAtlas {
  const selectedFrameKeys = getPrimaryAnimationFrameKeys(args.atlas, args.textureKey)
    .filter(frameKey => Boolean(args.atlas.frames[frameKey]));
  const frameKeys = selectedFrameKeys.length ? selectedFrameKeys : Object.keys(args.atlas.frames);
  const firstFrame = frameKeys.map(key => args.atlas.frames[key]).find(Boolean);

  return {
    frames: args.atlas.frames,
    animations: {
      [args.textureKey]: frameKeys,
    },
    meta: {
      image: args.fileName,
      format: "RGBA8888",
      size: {
        w: args.imageSize.width || args.atlas.meta.size.w,
        h: args.imageSize.height || args.atlas.meta.size.h,
      },
      scale: "1",
      enemyVisualMetadata: createEnemyVisualMetadata({
        sourceSpriteSize: {
          width: firstFrame?.sourceSize.w ?? firstFrame?.frame.w ?? 1,
          height: firstFrame?.sourceSize.h ?? firstFrame?.frame.h ?? 1,
        },
        targetSpriteSize: {
          width: args.targetWidth,
          height: args.targetHeight,
        },
        rotationDegrees: args.rotationDegrees,
        animationFrames: frameKeys,
        fps: args.fps,
      }),
    },
  };
}

function createEnemyVisualMetadata(metadata: EnemyVisualMetadata): EnemyVisualMetadata {
  return {
    ...metadata,
    ...(metadata.rotationDegrees === undefined ? {} : {rotationDegrees: metadata.rotationDegrees}),
  };
}

function parseUploadedAtlas(value: unknown): PixiAtlas {
  if (!isRecord(value) || !isRecord(value.frames)) {
    throw new Error("JSON atlas must contain a frames object.");
  }

  const frames = Object.fromEntries(
    Object.entries(value.frames).map(([key, rawFrame]) => [key, parseAtlasFrame(rawFrame, key)]),
  );
  const animations = isRecord(value.animations)
    ? Object.fromEntries(
      Object.entries(value.animations)
        .filter(([, frameKeys]) => Array.isArray(frameKeys) && frameKeys.every(frameKey => typeof frameKey === "string"))
        .map(([key, frameKeys]) => [key, frameKeys as string[]]),
    )
    : {};
  const meta = isRecord(value.meta) ? value.meta : {};
  const size = isRecord(meta.size) ? meta.size : {};
  const metadata = isRecord(meta.enemyVisualMetadata) ? meta.enemyVisualMetadata as EnemyVisualMetadata : {};

  if (!Object.keys(frames).length) {
    throw new Error("JSON atlas must contain at least one frame.");
  }

  return {
    frames,
    animations,
    meta: {
      image: typeof meta.image === "string" ? meta.image : "",
      format: "RGBA8888",
      size: {
        w: parsePositiveUnknownNumber(size.w, getFrameSheetWidth(frames)),
        h: parsePositiveUnknownNumber(size.h, getFrameSheetHeight(frames)),
      },
      scale: "1",
      enemyVisualMetadata: metadata,
    },
  };
}

function parseAtlasFrame(value: unknown, key: string): PixiAtlas["frames"][string] {
  if (!isRecord(value) || !isRecord(value.frame)) {
    throw new Error(`Frame "${key}" must contain frame coordinates.`);
  }

  const frame = {
    x: parseUnknownNumber(value.frame.x),
    y: parseUnknownNumber(value.frame.y),
    w: parsePositiveUnknownNumber(value.frame.w, 1),
    h: parsePositiveUnknownNumber(value.frame.h, 1),
  };
  const spriteSourceSize = isRecord(value.spriteSourceSize)
    ? {
      x: parseUnknownNumber(value.spriteSourceSize.x),
      y: parseUnknownNumber(value.spriteSourceSize.y),
      w: parsePositiveUnknownNumber(value.spriteSourceSize.w, frame.w),
      h: parsePositiveUnknownNumber(value.spriteSourceSize.h, frame.h),
    }
    : {x: 0, y: 0, w: frame.w, h: frame.h};
  const sourceSize = isRecord(value.sourceSize)
    ? {
      w: parsePositiveUnknownNumber(value.sourceSize.w, frame.w),
      h: parsePositiveUnknownNumber(value.sourceSize.h, frame.h),
    }
    : {w: frame.w, h: frame.h};
  const duration = typeof value.duration === "number" && Number.isFinite(value.duration) && value.duration > 0
    ? value.duration
    : undefined;

  return {
    frame,
    rotated: value.rotated === true,
    trimmed: value.trimmed === true,
    spriteSourceSize,
    sourceSize,
    duration,
  };
}

function getFrameRectsFromAtlas(atlas: PixiAtlas): FrameRect[] {
  return Object.entries(atlas.frames).map(([key, frame]) => ({
    key,
    x: frame.frame.x,
    y: frame.frame.y,
    width: frame.frame.w,
    height: frame.frame.h,
  }));
}

function getAnimationFrameKeys(atlas: PixiAtlas, textureKey: string): string[] {
  return getPrimaryAnimationFrameKeys(atlas, textureKey)
    .filter(frameKey => Boolean(atlas.frames[frameKey]));
}

function getPrimaryAnimationFrameKeys(atlas: PixiAtlas, textureKey: string): string[] {
  const namedAnimation = atlas.animations[textureKey];
  if (namedAnimation?.length) return namedAnimation;

  const firstAnimation = Object.values(atlas.animations).find(animation => animation.length > 0);
  return firstAnimation ?? Object.keys(atlas.frames);
}

function getAtlasFps(atlas: PixiAtlas): number | null {
  if (atlas.meta.enemyVisualMetadata.fps && Number.isFinite(atlas.meta.enemyVisualMetadata.fps)) {
    return atlas.meta.enemyVisualMetadata.fps;
  }

  const durations = Object.values(atlas.frames)
    .map(frame => frame.duration)
    .filter((duration): duration is number => typeof duration === "number" && Number.isFinite(duration) && duration > 0);
  if (!durations.length) return null;

  const averageDurationMs = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  return 1000 / averageDurationMs;
}

function getAtlasTargetSize(atlas: PixiAtlas): {width: number; height: number} | null {
  const target = atlas.meta.enemyVisualMetadata.targetSpriteSize;
  if (!target) return null;

  return {
    width: Math.max(1, target.width),
    height: Math.max(1, target.height),
  };
}

function getAtlasRotationDegrees(atlas: PixiAtlas): number | null {
  const rotation = atlas.meta.enemyVisualMetadata.rotationDegrees;
  return typeof rotation === "number" && Number.isFinite(rotation) ? rotation : null;
}

function getFrameSheetWidth(frames: PixiAtlas["frames"]): number {
  return Math.max(...Object.values(frames).map(frame => frame.frame.x + frame.frame.w), 1);
}

function getFrameSheetHeight(frames: PixiAtlas["frames"]): number {
  return Math.max(...Object.values(frames).map(frame => frame.frame.y + frame.frame.h), 1);
}

function readImageSize(src: string): Promise<{width: number; height: number}> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({width: image.naturalWidth, height: image.naturalHeight});
    image.onerror = () => reject(new Error("Image could not be loaded"));
    image.src = src;
  });
}

function parsePositiveNumber(value: string, fallback: number): number {
  return Math.max(0, parseNumber(value, fallback));
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseUnknownNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePositiveUnknownNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/u, "").replace(/\.$/u, "");
}

function normalizeFileStem(value: string): string {
  const normalized = value
    .replace(/\.[^.]+$/u, "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^[-_]+|[-_]+$/g, "")
    .toLowerCase();

  return normalized.replace(/^enemy_/, "") || "new_animation";
}

function normalizeDisplayName(value: string): string {
  return value
    .replace(/\.[^.]+$/u, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

function formatLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

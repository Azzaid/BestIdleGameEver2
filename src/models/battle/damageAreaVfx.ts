export type DamageAreaVfxAnimation = {
  scrollXPerSecond?: number;
  scrollYPerSecond?: number;
  rotationPerSecond?: number;
  pulseAmount?: number;
  pulseSpeed?: number;
};

export type DamageAreaVfxDisplayType = "tile" | "circularTile" | "centered";

export type DamageAreaVfxDisplay = {
  type: DamageAreaVfxDisplayType;
  initialRotationRadians?: number;
  angleRadians?: number;
  lengthToRepeat?: number;
  spriteZoom?: number;
};

export type DamageAreaVfxTickPulse = {
  durationSeconds: number;
  startScale: number;
  pulseSpeed: number;
};

export type DamageAreaVfxDefinition = {
  id: string;
  label: string;
  requiredDamageKeywords: readonly string[];
  textureAlias: string;
  src: string;
  alpha: number;
  priority: number;
  zIndex: number;
  display: DamageAreaVfxDisplay;
  tickPulse?: DamageAreaVfxTickPulse;
  animation?: DamageAreaVfxAnimation;
};

export type DamageAreaVfxDefinitionData = Omit<DamageAreaVfxDefinition, "src"> & {
  assetFileStem: string;
};

export type DamageAreaVfxAsset = {
  id: string;
  fileStem: string;
  label: string;
  src: string;
};

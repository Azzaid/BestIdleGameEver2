import { Container, Graphics, Sprite, Texture, TilingSprite } from "pixi.js";
import type { DamageAreaVfxDefinition } from "../../../models/battle/damageAreaVfx.ts";
import type { DamageAreaVfxView, World } from "../../../models/battle/world.ts";
import { getDamageAreaVfxForProfile } from "../../../data/battleDamageAreaVfx.ts";

const CIRCULAR_TILE_BASE_SPRITE_SIZE = 96;

type DamageAreaVfxCandidate = {
  key: string;
  pulseKey: string;
  pulseTriggerCount: number;
  vfx: DamageAreaVfxDefinition;
  shape: "circle" | "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
};

export function DamageAreaVfxSystem(world: World, dt: number) {
  const candidates = collectDamageAreaVfxCandidates(world);
  const activeKeys = new Set(candidates.map(candidate => candidate.key));

  for (const candidate of candidates) {
    const view = getOrCreateDamageAreaVfxView(world, candidate);
    updateDamageAreaVfxView(view, candidate, dt);
  }

  for (const [key, view] of world.damageAreaVfxViews) {
    if (activeKeys.has(key)) continue;

    view.container.parent?.removeChild(view.container);
    view.container.destroy({ children: true });
    world.damageAreaVfxViews.delete(key);
  }
}

function collectDamageAreaVfxCandidates(world: World): DamageAreaVfxCandidate[] {
  const candidates: DamageAreaVfxCandidate[] = [];

  for (const [towerId, tower] of world.towersData) {
    const { zoneDotDamageProfile, zoneDotTicksPerSecond, zoneDotZoneSize } = tower;
    if (zoneDotDamageProfile.amount <= 0 || zoneDotTicksPerSecond <= 0 || zoneDotZoneSize <= 0) continue;

    const vfx = getDamageAreaVfxForProfile(zoneDotDamageProfile);
    const transform = world.transforms.get(towerId);
    if (!vfx || !transform) continue;

    candidates.push({
      key: `tower:${towerId}:zoneDot:${vfx.id}`,
      pulseKey: `tower:${towerId}:zoneDot`,
      pulseTriggerCount: world.damageAreaVfxPulseTriggers.get(`tower:${towerId}:zoneDot`) ?? 0,
      vfx,
      shape: "circle",
      x: transform.position.x,
      y: transform.position.y,
      width: zoneDotZoneSize * 2,
      height: zoneDotZoneSize * 2,
      radius: zoneDotZoneSize,
    });
  }

  const { zoneDotDamageProfile, zoneDotTicksPerSecond, zoneDotZoneSize } = world.config.wallZoneEffects;
  const wallVfx = getDamageAreaVfxForProfile(zoneDotDamageProfile);
  if (wallVfx && zoneDotDamageProfile.amount > 0 && zoneDotTicksPerSecond > 0 && zoneDotZoneSize > 0) {
    candidates.push({
      key: `wall:zoneDot:${wallVfx.id}`,
      pulseKey: "wall:zoneDot",
      pulseTriggerCount: world.damageAreaVfxPulseTriggers.get("wall:zoneDot") ?? 0,
      vfx: wallVfx,
      shape: "rect",
      x: 0,
      y: world.config.wallContactY - zoneDotZoneSize,
      width: world.config.battlefieldWidth,
      height: zoneDotZoneSize,
    });
  }

  return candidates;
}

function getOrCreateDamageAreaVfxView(world: World, candidate: DamageAreaVfxCandidate): DamageAreaVfxView {
  const existing = world.damageAreaVfxViews.get(candidate.key);
  if (existing) return existing;

  const container = new Container();
  const content = new Container();
  const mask = new Graphics();

  content.mask = mask;
  container.addChild(content);
  container.addChild(mask);
  world.worldLayer.addChild(container);

  const view = {
    container,
    content,
    mask,
    elapsedSeconds: 0,
    renderKey: "",
    pulseElapsedSeconds: Number.POSITIVE_INFINITY,
    lastPulseTriggerCount: 0,
  };
  world.damageAreaVfxViews.set(candidate.key, view);

  return view;
}

function updateDamageAreaVfxView(view: DamageAreaVfxView, candidate: DamageAreaVfxCandidate, dt: number) {
  const { animation } = candidate.vfx;
  view.elapsedSeconds += dt;
  view.container.position.set(candidate.x, candidate.y);
  view.container.zIndex = candidate.vfx.zIndex;
  view.container.rotation = (animation?.rotationPerSecond ?? 0) * view.elapsedSeconds;
  view.content.mask = candidate.vfx.display.type === "circularTile" ? null : view.mask;
  const ambientScale = animation?.pulseAmount
    ? 1 + Math.sin(view.elapsedSeconds * (animation.pulseSpeed ?? 1) * Math.PI * 2) * animation.pulseAmount
    : 1;
  updateTickPulseState(view, candidate, dt, ambientScale);

  const displayWidth = candidate.width;
  const displayHeight = candidate.height;
  const renderKey = getRenderKey(candidate, displayWidth, displayHeight);

  if (view.renderKey !== renderKey) {
    view.content.removeChildren().forEach(child => child.destroy({ children: true }));
    renderDamageAreaVfxContent(view, candidate, displayWidth, displayHeight);
    view.renderKey = renderKey;
  }

  for (const child of view.content.children) {
    if (child instanceof TilingSprite) {
      child.tilePosition.x += (animation?.scrollXPerSecond ?? 0) * dt;
      child.tilePosition.y += (animation?.scrollYPerSecond ?? 0) * dt;
    }
  }

  view.mask.clear();
  if (candidate.shape === "circle" && candidate.vfx.display.type !== "circularTile") {
    const radius = candidate.radius ?? Math.min(candidate.width, candidate.height) / 2;
    view.mask.circle(0, 0, radius).fill(0xffffff);
    return;
  }

  if (candidate.shape === "rect" && candidate.vfx.display.type !== "circularTile") {
    view.mask.rect(0, 0, candidate.width, candidate.height).fill(0xffffff);
  }
}

function renderDamageAreaVfxContent(
  view: DamageAreaVfxView,
  candidate: DamageAreaVfxCandidate,
  displayWidth: number,
  displayHeight: number,
) {
  switch (candidate.vfx.display.type) {
    case "centered":
      renderCenteredContent(view, candidate, displayWidth, displayHeight);
      return;
    case "circularTile":
      if (candidate.shape === "circle") {
        renderCircularTileContent(view, candidate);
        return;
      }
      renderTileContent(view, candidate, displayWidth, displayHeight);
      return;
    case "tile":
      renderTileContent(view, candidate, displayWidth, displayHeight);
      return;
  }
}

function renderTileContent(
  view: DamageAreaVfxView,
  candidate: DamageAreaVfxCandidate,
  displayWidth: number,
  displayHeight: number,
) {
  const sprite = new TilingSprite({
    texture: Texture.from(candidate.vfx.textureAlias),
    width: displayWidth,
    height: displayHeight,
  });

  if (candidate.shape === "circle") {
    sprite.position.set(-displayWidth / 2, -displayHeight / 2);
  }

  view.content.addChild(sprite);
}

function renderCenteredContent(
  view: DamageAreaVfxView,
  candidate: DamageAreaVfxCandidate,
  displayWidth: number,
  displayHeight: number,
) {
  const sprite = new Sprite(Texture.from(candidate.vfx.textureAlias));
  sprite.anchor.set(0.5);
  sprite.width = displayWidth;
  sprite.height = displayHeight;

  if (candidate.shape === "rect") {
    sprite.anchor.set(0);
  }

  view.content.addChild(sprite);
}

function renderCircularTileContent(view: DamageAreaVfxView, candidate: DamageAreaVfxCandidate) {
  const radius = candidate.radius ?? Math.min(candidate.width, candidate.height) / 2;
  const lengthToRepeat = Math.max(8, candidate.vfx.display.lengthToRepeat ?? 64);
  const spriteSize = CIRCULAR_TILE_BASE_SPRITE_SIZE * Math.max(0.05, candidate.vfx.display.spriteZoom ?? 1);
  const circumference = Math.max(lengthToRepeat, Math.PI * 2 * radius);
  const repeatCount = Math.max(3, Math.ceil(circumference / lengthToRepeat));
  const angleStep = Math.PI * 2 / repeatCount;
  const initialRotation = candidate.vfx.display.initialRotationRadians ?? 0;
  const angle = candidate.vfx.display.angleRadians ?? Math.PI / 2;

  for (let index = 0; index < repeatCount; index += 1) {
    const theta = initialRotation + index * angleStep;
    const sprite = new Sprite(Texture.from(candidate.vfx.textureAlias));
    sprite.anchor.set(0.5);
    sprite.width = spriteSize;
    sprite.height = spriteSize;
    sprite.position.set(Math.cos(theta) * radius, Math.sin(theta) * radius);
    sprite.rotation = theta + angle;
    view.content.addChild(sprite);
  }
}

function getRenderKey(candidate: DamageAreaVfxCandidate, displayWidth: number, displayHeight: number) {
  const { display } = candidate.vfx;

  return [
    candidate.vfx.textureAlias,
    display.type,
    display.initialRotationRadians ?? 0,
    display.angleRadians ?? 0,
    display.lengthToRepeat ?? 0,
    display.spriteZoom ?? 1,
    candidate.shape,
    candidate.width,
    candidate.height,
    displayWidth.toFixed(2),
    displayHeight.toFixed(2),
  ].join("|");
}

function updateTickPulseState(
  view: DamageAreaVfxView,
  candidate: DamageAreaVfxCandidate,
  dt: number,
  ambientScale: number,
) {
  const triggerCount = candidate.pulseTriggerCount;
  const tickPulse = candidate.vfx.tickPulse;
  if (!tickPulse) {
    view.content.alpha = candidate.vfx.alpha;
    view.content.scale.set(ambientScale);
    view.lastPulseTriggerCount = triggerCount;
    return;
  }

  if (triggerCount !== view.lastPulseTriggerCount) {
    view.pulseElapsedSeconds = 0;
    view.lastPulseTriggerCount = triggerCount;
  } else {
    view.pulseElapsedSeconds += dt;
  }

  const startScale = Math.max(0.01, tickPulse.startScale);
  const pulseSpeed = Math.max(0.01, tickPulse.pulseSpeed);
  const expansionDuration = Math.max(0.01, (1 - startScale) / pulseSpeed);
  const fadeDuration = Math.max(0.01, tickPulse.durationSeconds);
  if (triggerCount === 0) {
    view.content.alpha = 0;
    view.content.scale.set(startScale * ambientScale);
    return;
  }

  if (view.pulseElapsedSeconds <= expansionDuration) {
    const expansionProgress = easeOutCubic(clamp(view.pulseElapsedSeconds / expansionDuration, 0, 1));
    view.content.alpha = lerp(1, candidate.vfx.alpha, expansionProgress);
    view.content.scale.set(lerp(startScale, 1, expansionProgress) * ambientScale);
    return;
  }

  const fadeProgress = clamp((view.pulseElapsedSeconds - expansionDuration) / fadeDuration, 0, 1);
  view.content.alpha = lerp(candidate.vfx.alpha, 0, fadeProgress);
  view.content.scale.set(ambientScale);
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

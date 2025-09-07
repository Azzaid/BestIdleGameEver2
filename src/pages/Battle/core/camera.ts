import * as PIXI from 'pixi.js';

export interface CameraConfig {
  worldWidth: number;
  worldHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  minZoom: number;
  maxZoom: number;
  worldPadding?: number;
}
export interface Camera {
  container: PIXI.Container;
  scale: number;
  position: PIXI.Point; // top-left in world coords
  config: CameraConfig;
}
export function createCamera(config: CameraConfig): Camera {
  const container = new PIXI.Container();
  container.sortableChildren = true;
  const cam: Camera = {
    container,
    scale: config.minZoom,
    position: new PIXI.Point(0, 0),
    config,
  };
  applyCameraTransform(cam);
  return cam;
}
export function applyCameraTransform(camera: Camera) {
  camera.container.scale.set(camera.scale);
  camera.container.position.set(
    -camera.position.x * camera.scale,
    -camera.position.y * camera.scale
  );
}
export function computeMinZoomForWall(args: { wallLogicalWidth: number; viewportWidth: number; minFloor?: number }) {
  const { wallLogicalWidth, viewportWidth, minFloor = 0.2 } = args;
  if (wallLogicalWidth <= 0) return minFloor; // TODO: feed from Redux selector of city top-edge width
  return Math.max(minFloor, viewportWidth / wallLogicalWidth);
}
export function clampCameraPosition(camera: Camera) {
  const { worldWidth, worldHeight, viewportWidth, viewportHeight, worldPadding = 0 } = camera.config;
  const visibleWidth = viewportWidth / camera.scale;
  const visibleHeight = viewportHeight / camera.scale;
  const minX = -worldPadding;
  const minY = -worldPadding;
  const maxX = Math.max(minX, worldWidth - visibleWidth + worldPadding);
  const maxY = Math.max(minY, worldHeight - visibleHeight + worldPadding);
  camera.position.x = Math.min(Math.max(camera.position.x, minX), maxX);
  camera.position.y = Math.min(Math.max(camera.position.y, minY), maxY);
}
export function setCameraScale(camera: Camera, nextScale: number) {
  camera.scale = Math.max(camera.config.minZoom, Math.min(camera.config.maxZoom, nextScale));
  applyCameraTransform(camera);
}
export function screenToWorld(camera: Camera, screenX: number, screenY: number): PIXI.Point {
  return new PIXI.Point(screenX / camera.scale + camera.position.x, screenY / camera.scale + camera.position.y);
}
export function zoomAtScreenPoint(camera: Camera, screenX: number, screenY: number, wheelDeltaY: number) {
  const before = screenToWorld(camera, screenX, screenY);
  const factor = wheelDeltaY > 0 ? 1 / 1.1 : 1.1;
  setCameraScale(camera, camera.scale * factor);
  const after = screenToWorld(camera, screenX, screenY);
  camera.position.x += before.x - after.x;
  camera.position.y += before.y - after.y;
  clampCameraPosition(camera);
  applyCameraTransform(camera);
}

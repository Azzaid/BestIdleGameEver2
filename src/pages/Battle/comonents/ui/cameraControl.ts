// camera.ts
import * as PIXI from 'pixi.js';

export interface CameraConfig {
    /** logical battlefield size (world units, e.g., pixels in your logic) */
    worldWidth: number;
    worldHeight: number;
    /** viewport size = current renderer size in screen pixels */
    viewportWidth: number;
    viewportHeight: number;
    /** constraints */
    maxZoom: number;         // e.g. 2.0 so 32px sprites max out at 64 on screen
    minZoom: number;         // computed from wall width (see below)
    /** limits to keep world visible; you can expand if you allow empty margins */
    worldPadding?: number;   // allow some panning outside; default 0
}

export interface CameraControl {
    container: PIXI.Container; // put all world sprites under this
    scale: number;             // zoom factor
    position: PIXI.Point;      // camera top-left in world coords
    config: CameraConfig;
}

export function createCamera(config: CameraConfig): CameraControl {
    const container = new PIXI.Container();
    container.sortableChildren = true;

    const camera: CameraControl = {
        container,
        scale: 1,
        position: new PIXI.Point(0, 0),
        config,
    };

    // apply initial transform
    applyCameraTransform(camera);
    return camera;
}

export function applyCameraTransform(camera: CameraControl) {
    // Camera stores top-left world position; Pixi container anchor is at (0,0).
    camera.container.scale.set(camera.scale);
    camera.container.position.set(
        -camera.position.x * camera.scale,
        -camera.position.y * camera.scale
    );
}

// Utility conversions
export function worldToScreen(camera: CameraControl, worldX: number, worldY: number): PIXI.Point {
    return new PIXI.Point(
        (worldX - camera.position.x) * camera.scale,
        (worldY - camera.position.y) * camera.scale
    );
}
export function screenToWorld(camera: CameraControl, screenX: number, screenY: number): PIXI.Point {
    return new PIXI.Point(
        screenX / camera.scale + camera.position.x,
        screenY / camera.scale + camera.position.y
    );
}

// compute min zoom so that wall occupies full viewport width
export function computeMinZoomForWall({
                                          wallLogicalWidth,          // in world units (px)
                                          viewportWidth,             // in screen px
                                          minFloor = 0.2,            // never allow ridiculous zoom-out; tune
                                      }: {
    wallLogicalWidth: number;
    viewportWidth: number;
    minFloor?: number;
}): number {
    if (wallLogicalWidth <= 0) return minFloor;
    return Math.max(minFloor, viewportWidth / wallLogicalWidth);
}

export function setCameraScale(camera: CameraControl, nextScale: number) {
    const { minZoom, maxZoom } = camera.config;
    camera.scale = Math.max(minZoom, Math.min(maxZoom, nextScale));
    applyCameraTransform(camera);
}

export function clampCameraPosition(camera: CameraControl) {
    const { worldWidth, worldHeight, viewportWidth, viewportHeight, worldPadding = 0 } = camera.config;
    const visibleWidthInWorld = viewportWidth / camera.scale;
    const visibleHeightInWorld = viewportHeight / camera.scale;

    const minX = -worldPadding;
    const minY = -worldPadding;
    const maxX = Math.max(minX, worldWidth - visibleWidthInWorld + worldPadding);
    const maxY = Math.max(minY, worldHeight - visibleHeightInWorld + worldPadding);

    camera.position.x = Math.min(Math.max(camera.position.x, minX), maxX);
    camera.position.y = Math.min(Math.max(camera.position.y, minY), maxY);
}

export function zoomAtScreenPoint(camera: CameraControl, anchorX: number, anchorY: number, zoomDelta: number) {
    // Store world point under the cursor *before* zoom
    const before = screenToWorld(camera, anchorX, anchorY);

    // Apply zoom
    const targetScale = camera.scale * (zoomDelta > 0 ? 1.1 : 1 / 1.1);
    setCameraScale(camera, targetScale);

    // After zoom, compute what world point is under cursor now and shift camera so it matches 'before'
    const after = screenToWorld(camera, anchorX, anchorY);
    camera.position.x += before.x - after.x;
    camera.position.y += before.y - after.y;

    clampCameraPosition(camera);
    applyCameraTransform(camera);
}

let isDragging = false;
const dragStartScreen = new PIXI.Point();
const dragStartWorld = new PIXI.Point();

export function onPointerDown(camera: CameraControl, screenX: number, screenY: number) {
    isDragging = true;
    dragStartScreen.set(screenX, screenY);
    dragStartWorld.copyFrom(camera.position);
}

export function onPointerMove(camera: CameraControl, screenX: number, screenY: number) {
    if (!isDragging) return;
    const dxScreen = screenX - dragStartScreen.x;
    const dyScreen = screenY - dragStartScreen.y;
    camera.position.x = dragStartWorld.x - dxScreen / camera.scale;
    camera.position.y = dragStartWorld.y - dyScreen / camera.scale;
    clampCameraPosition(camera);
    applyCameraTransform(camera);
}

export function onPointerUp() {
    isDragging = false;
}

import { Container } from 'pixi.js';

export type CameraConfig = {
    worldWidth: number;
    worldHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    minZoom: number;
    maxZoom: number;
};

export type Camera = {
    container: Container;
    position: { x: number; y: number }; // top-left in world units
    scale: number;                      // worldUnits -> screenUnits
    config: CameraConfig;
};

/** Create a camera container; enable RenderGroup so transforms are done efficiently on GPU. */
export function createCamera(config: CameraConfig): Camera {
    const container = new Container({ isRenderGroup: true }); // v8 feature, cheap “camera” layers. :contentReference[oaicite:4]{index=4}

    const camera: Camera = {
        container,
        position: { x: 0, y: 0 },
        scale: Math.max(config.minZoom, Math.min(1, config.maxZoom)),
        config,
    };

    applyCameraTransform(camera);
    return camera;
}

/** Keep the entire wall width visible by default; clamp to [minZoom, maxZoom] later. */
export function computeMinZoomForWall(args: { wallLogicalWidth: number; viewportWidth: number }): number {
    if (args.wallLogicalWidth <= 0) return 0.5;
    return Math.min(1, args.viewportWidth / args.wallLogicalWidth);
}

/** Programmatically set scale with clamping, then apply. */
export function setCameraScale(camera: Camera, desiredScale: number): void {
    const { minZoom, maxZoom } = camera.config;
    camera.scale = Math.max(minZoom, Math.min(maxZoom, desiredScale));
    applyCameraTransform(camera);
}

/** Zoom around a screen-space pointer (keeps the world point under the cursor stable). */
export function zoomAtScreenPoint(
    camera: Camera,
    screenX: number,
    screenY: number,
    wheelDeltaY: number
): void {
    const zoomStep = 1.0 + Math.min(1.0, Math.abs(wheelDeltaY) / 480); // gentle curve
    const zoomFactor = wheelDeltaY < 0 ? zoomStep : 1 / zoomStep;

    const worldXBefore = camera.position.x + screenX / camera.scale;
    const worldYBefore = camera.position.y + screenY / camera.scale;

    setCameraScale(camera, camera.scale * zoomFactor);

    camera.position.x = worldXBefore - screenX / camera.scale;
    camera.position.y = worldYBefore - screenY / camera.scale;

    applyCameraTransform(camera);
}

/** Apply scale and clamp position so the viewport stays within world bounds. */
export function applyCameraTransform(camera: Camera): void {
    const { worldWidth, worldHeight, viewportWidth, viewportHeight } = camera.config;

    const maxX = Math.max(0, worldWidth - viewportWidth / camera.scale);
    const maxY = Math.max(0, worldHeight - viewportHeight / camera.scale);

    // Clamp the “top-left world” position.
    camera.position.x = Math.max(0, Math.min(camera.position.x, maxX));
    camera.position.y = Math.max(0, Math.min(camera.position.y, maxY));

    // Map world -> screen for the container that holds the world layer:
    camera.container.scale.set(camera.scale);
    camera.container.position.set(-camera.position.x * camera.scale, -camera.position.y * camera.scale);
}

import type { Container } from 'pixi.js';

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
    position: { x: number; y: number };
    scale: number;
    config: CameraConfig;
};

import * as PIXI from 'pixi.js';
import { useEffect, useRef } from 'react';
import {
    createCamera, computeMinZoomForWall, setCameraScale,
    zoomAtScreenPoint, onPointerDown, onPointerMove, onPointerUp,
    applyCameraTransform
} from "./cameraControl.ts";

export function BattleStage({
                                wallLogicalWidth,       // derived from city top-edge hexes * hexWidthPx
                                battlefieldWidth,       // logical, in world px
                                battlefieldHeight,      // logical, in world px
                                monsterBasePixelSize,   // e.g., 32
                            }: {
    wallLogicalWidth: number;
    battlefieldWidth: number;
    battlefieldHeight: number;
    monsterBasePixelSize: number;
}) {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const app = new PIXI.Application({ resizeTo: hostRef.current!, backgroundColor: 0x0b0e13 });
        hostRef.current!.appendChild(app.view as HTMLCanvasElement);

        const viewportWidth = app.renderer.width;
        const viewportHeight = app.renderer.height;

        const minZoom = computeMinZoomForWall({
            wallLogicalWidth,
            viewportWidth,
        });
        const maxZoom = 2.0; // cap so 32px monsters are at most 64px on screen

        const camera = createCamera({
            worldWidth: battlefieldWidth,
            worldHeight: battlefieldHeight,
            viewportWidth,
            viewportHeight,
            minZoom,
            maxZoom,
        });

        app.stage.addChild(camera.container);

        // Put your world sprites under camera.container from now on

        // Input: zoom wheel
        const wheelHandler = (e: WheelEvent) => {
            e.preventDefault();
            // Pixi’s view is the canvas; get offset inside it
            const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            zoomAtScreenPoint(camera, mouseX, mouseY, e.deltaY);
        };
        app.view.addEventListener('wheel', wheelHandler, { passive: false });

        // Input: drag to pan
        app.view.addEventListener('pointerdown', (e) => {
            const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
            onPointerDown(camera, e.clientX - rect.left, e.clientY - rect.top);
        });
        app.view.addEventListener('pointermove', (e) => {
            const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
            onPointerMove(camera, e.clientX - rect.left, e.clientY - rect.top);
        });
        window.addEventListener('pointerup', onPointerUp);

        // Handle resize: recompute viewport size & minZoom
        const onResize = () => {
            const vw = app.renderer.width;
            const vh = app.renderer.height;
            camera.config.viewportWidth = vw;
            camera.config.viewportHeight = vh;
            camera.config.minZoom = computeMinZoomForWall({ wallLogicalWidth, viewportWidth: vw });
            // keep current scale within new limits
            setCameraScale(camera, camera.scale);
            // clamp position to new bounds
            applyCameraTransform(camera);
        };
        app.renderer.on('resize', onResize);

        return () => {
            app.view.removeEventListener('wheel', wheelHandler);
            window.removeEventListener('pointerup', onPointerUp);
            app.destroy(true, { children: true, texture: true});
        };
    }, [wallLogicalWidth, battlefieldWidth, battlefieldHeight, monsterBasePixelSize]);

    return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
}
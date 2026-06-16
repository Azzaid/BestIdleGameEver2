import { Application } from 'pixi.js';
import { useEffect, useMemo, useRef } from 'react';
import type { TowerAssemblyPreviewProps } from '../../models/build/towerAssemblyPreview.ts';
import { createTowerVisualDefinitionFromAssembly } from '../../data/towers/visuals.ts';
import { loadBattleAssets } from '../Battle/assets/assetLoader.ts';
import { buildTowerVisualContainer } from '../Battle/factories/towerVisualRenderer.ts';
import { INITIAL_TOWER_AIM_RADIANS } from '../../models/battle/tower.ts';

export function TowerAssemblyPreview({ resolvedTower }: TowerAssemblyPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const towerVisualDefinition = useMemo(
    () => createTowerVisualDefinitionFromAssembly(resolvedTower),
    [resolvedTower]
  );

  useEffect(() => {
    const hostElement = hostRef.current;
    if (!hostElement) return;

    let disposed = false;
    let app: Application | null = null;

    const mountPreview = async () => {
      app = new Application();
      await app.init({
        resizeTo: hostElement,
        backgroundAlpha: 0,
        antialias: true,
      });

      if (disposed) {
        app.destroy(true);
        return;
      }

      hostElement.appendChild(app.canvas);
      await loadBattleAssets();

      if (disposed || !app) return;

      const { container } = buildTowerVisualContainer(towerVisualDefinition);
      container.position.set(app.renderer.width / 2, app.renderer.height * 0.66);
      container.rotation = INITIAL_TOWER_AIM_RADIANS;
      container.scale.set(1.15);
      app.stage.addChild(container);

      const resizePreview = () => {
        if (!app) return;
        container.position.set(app.renderer.width / 2, app.renderer.height * 0.66);
      };
      app.renderer.on('resize', resizePreview);
    };

    void mountPreview();

    return () => {
      disposed = true;
      if (app) {
        app.destroy(true, { children: true, texture: false, textureSource: false, context: true });
      }
    };
  }, [towerVisualDefinition]);

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} aria-label="Tower assembly preview" />;
}

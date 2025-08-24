// /battle/systems/pixiSync.ts
import * as PIXI from 'pixi.js';
import { World } from '../core/world';

export function PixiSyncSystem(world: World) {
    for (const [entityId, sprite] of world.sprites) {
        const transform = world.transforms.get(entityId);
        if (!transform) continue;

        if (!sprite.container) {
            // Simple one-sprite container; replace with multi-part (base + barrel) if needed
            const container = new PIXI.Container();
            container.zIndex = sprite.zIndex;
            const texture = getTexture(world, sprite.textureKey);
            const s = new PIXI.Sprite(texture);
            s.anchor.set(sprite.pivot.x / texture.width, sprite.pivot.y / texture.height);
            container.addChild(s);
            world.pixiStageRoot.addChild(container);
            sprite.container = container;
            sprite.sprite = s;
        }

        sprite.container.position.set(transform.position.x, transform.position.y);
        sprite.container.rotation = transform.rotationRadians;
    }
}

function getTexture(world: World, key: string): PIXI.Texture {
    // Replace with your loader/atlas; for now use a generated placeholder
    const cacheKey = `placeholder:${key}`;
    if (PIXI.Texture.exists(cacheKey)) return PIXI.Texture.from(cacheKey);

    const gfx = new PIXI.Graphics();
    gfx.beginFill(0xffffff).drawRect(0, 0, 32, 32).endFill();
    const tex = world.config.app.renderer.generateTexture(gfx);
    // store under cacheKey
    (tex as any).cacheId = cacheKey;
    (PIXI.utils as any).TextureCache[cacheKey] = tex;
    return tex;
}

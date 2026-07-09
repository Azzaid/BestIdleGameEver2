# Damage Area VFX

Damage area VFX are semi-transparent battle overlays for active damage areas, such as toxic DoT clouds around towers or wall structures.

## Current Implementation

- Runtime mappings are stored in `src/data/battleDamageAreaVfxDefinitions.json` and exposed through `src/data/battleDamageAreaVfx.ts`.
- Shared types live in `src/models/battle/damageAreaVfx.ts`.
- Battle effect PNGs live in `src/assets/battle/effects`.
- `src/pages/Battle/systems/damageAreaVfxSystem.ts` renders matching effects in Pixi.
- The debug-only editor page is available at `/damage-area-vfx` when Debug is enabled.
- The local data server upload endpoint is `POST /battle-effect-sprites`.
- The local data server mapping-save endpoint is `POST /battle-damage-area-vfx`.

The first mapping is `damageArea.toxicCloud`. It appears for active zone DoT damage profiles that include `damage.poison`.

## Display Types

Each registry entry has a `display` block:

- `tile`: repeats the texture across the damage area, then clips it to the source shape. This is the default filled-cloud style.
- `centered`: draws one sprite at the center and resizes it to fill the damage area. Circular sources are clipped to the circle.
- `circularTile`: repeats the texture around the circular outline. This is useful for rune rings, hazard borders, or edge-only warnings. Rectangular wall bands fall back to `tile`.

Display controls:

- `initialRotationRadians`: where the first repeated tile starts on a circular outline.
- `angleRadians`: the rotation offset applied to each repeated tile. `Math.PI / 2` makes sprites tangent to the circle.
- `lengthToRepeat`: approximate arc spacing for `circularTile`; the renderer keeps `repeatCount = ceil(circleCircumference / lengthToRepeat)`.
- `spriteZoom`: scales each repeated circular tile from the fixed circular tile base size without changing repeat count.

## Tick Pulse

Mappings can include a `tickPulse` block. When a matching DoT zone applies one or more ticks, the VFX content restarts a short pulse on its existing Pixi objects:

- `pulseSpeed`: scale units per second while the VFX expands from the emitter point to full area size.
- `startScale`: scale at the start of the pulse. Use a very small value to begin at the emitter point.
- `durationSeconds`: fade-out duration after the VFX reaches full area size.

At tick start the VFX is fully visible with alpha `1`. While it expands, opacity moves toward the mapping's `alpha` value. After it reaches the target area size, it stays in place and fades from `alpha` to `0`.

The renderer keeps one pulse state per damage-area source. If several enemies are hit by the same zone on the same frame, that zone restarts one pulse instead of creating stacked animations.

## How Runtime Matching Works

Damage-area visuals are selected from `DamageProfile.keywords`, not from the tower or wall source ID.

The battle renderer checks each active area source:

- tower and wall-structure circular zone DoT areas from `tower.zoneDot*` values;
- aggregate wall zone DoT areas from `wall.zoneDot*` values.

If the source has positive damage, tick rate, and area size, the renderer asks the VFX registry for the highest-priority definition whose `requiredDamageKeywords` are all present on the damage profile.

## Scaling Later

Add new damage-area VFX by adding a texture and a registry entry, not by branching battle rendering code.

Recommended keyword pattern:

- `damage.poison` -> toxic cloud
- `damage.fire` -> burning ground or flame wash
- `damage.frost` -> cold mist
- `damage.acid` -> acid puddle or vapor
- `damage.holy` -> radiant field
- `damage.aether` -> arcane field

Start with one highest-priority visual per damage profile. If hybrid effects become important later, the registry can support layered matches by returning multiple definitions instead of a single highest-priority match.

Keep geometry source-driven:

- tower or wall structure defines the circular radius;
- wall-zone effects define the wall band;
- the VFX definition only controls texture, alpha, layering, display type, and animation.

This separation keeps gameplay damage, source geometry, and art mapping independently editable.

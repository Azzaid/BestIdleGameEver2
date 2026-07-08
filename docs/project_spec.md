# Project Specification: Best Idle Game Ever 2

Last updated: 2026-06-24 (local)

This document is the repository's single project specification. It summarizes the implemented prototype and the current design direction from the rest of the `docs` folder. The focused design documents remain the deeper references for individual systems.

## 1. Product Vision

Best Idle Game Ever 2 is a browser-based hybrid of city builder, tower defense, modular weapon construction, and long-form progression puzzle.

The player guides near-immortal survivors through a ruined techno-magical-biological world. They found temporary cities, arrange hex districts, design towers, survive attacks, migrate or colonize, and eventually build a final solution to the world's danger.

Core statement:

- The city creates support.
- Support enables buildings, research, walls, towers, and megaprojects.
- Growth increases threat.
- Threat summons attacks.
- Combat tests whether the city can safely continue growing.

Design pillars:

- Preparation matters more than combat.
- The economy is based on support/upkeep rather than stockpiled idle currency.
- The city is a spatial puzzle, not a flat production list.
- Synergy between Technology, Medieval/Human, Nature/Biology, and Aether/Magic is central.
- Strange and extreme builds are allowed when they create memorable decisions.
- The wall visually and mechanically connects city building to combat.
- Victory is built through megaproject endings, not granted by a score threshold or cutscene.

For portable technical decisions, data schema principles, value resolution rules, and engine-migration guidance, see `docs/architecture-principles.md`.

## 2. Current Prototype Scope

The current app is a frontend-only prototype with multiple routed views:

- Battle: Pixi/canvas battlefield rendering with enemy spawning, tower fire, projectiles, health bars, wall pressure, and battle state.
- Build: tower assembly from component slots with resolved stats, support costs, warnings, keywords, and synergies.
- Research: radial research tree with unlockable nodes and vector coloring.
- City: SVG hex city visualization with clickable city and wall tiles, build panels, resolved stats, signature/controlled-territory state, and wall-specific construction.
- History: happened global events with remembered new-event scrolling and foreseen event hints.
- Debug/content tools: progression graph, ID audit, entity creation, monster editing, gun part editor, global events editor, homogeneous values editor, and hex background editor. These tools are development-only surfaces and are kept behind `import.meta.env.DEV` route and import boundaries.

The prototype has no backend. Core Redux gameplay progress is saved in browser `localStorage` and restored on reload.

## 3. Technical Architecture

Current stack:

- React 19 with TypeScript.
- Vite 7.
- Redux Toolkit.
- React Router with hash routing.
- vanilla-extract for typed CSS.
- Pixi.js for battle rendering.
- TanStack Table and React Virtual for the Build page parts table.
- react-d3-tree for the Research page tree visualization.

Entry points and app shell:

- `src/main.tsx` loads global styles and renders the app.
- `src/App.tsx` wires `Provider`, `ThemeProvider`, `HashRouter`, navigation, game routes, lazy development-tool route gating, content auto-unlock hooks, global event signals/history navigation, notifications, and the shared upkeep bar.
- `src/store` contains Redux setup, slices, typed hooks, and selectors.
- `src/devtools` contains development-only route/nav modules and devtools UI state. Devtools UI state is persisted separately from the gameplay save and should not be added to the game Redux persistence payload.
- `src/theme` contains the vanilla-extract theme contract and runtime theme provider.

Primary routes:

- `/` and `/battle` render Battle.
- `/build` renders tower assembly.
- `/research` renders research.
- `/city` renders the city view.
- `/history` renders happened global events and foreseen event hints.
- `/progression`, `/ids`, `/entity-create/:entityId`, `/content-plan`, `/monster-edit/:monsterId`, `/gun-part-editor`, `/global-events`, `/homogeneous-values`, and `/hex-background-editor` are debug-mode tools available only in development builds.

Important directories:

- `src/pages` contains routed page experiences.
- `src/pages/Battle` contains battle runtime models, factories, spawning, aiming, firing, movement, projectiles, health bars, wall/siege systems, Pixi synchronization, and UI.
- `src/pages/City/Components` contains city hex rendering and helpers.
- `src/pages/Research/Components` contains research tree node components.
- `src/components` contains shared UI such as the upkeep bar.
- `src/models` contains TypeScript domain models.
- `src/data` contains static gameplay data and constants. Progression graph helpers live with the Progression page because they derive display and audit metadata from the primary content data.
- `src/theme` contains theme tokens and runtime theme selection.
- `src/styles` contains global vanilla-extract styles.
- `src/assets` contains active textures organized by gameplay type plus `src/assets/unused` for images not currently loaded.
- `docs` contains product, design, architecture, and open-question notes.
- `public` contains static Vite assets.

Content data layout:

- `src/data/buildings` uses vector-keyed atlas modules.
- `src/data/wallSegments` and `src/data/wallSuperstructures` use independent atlas patterns keyed by development vector. Wall hexes store those two layers separately.
- `src/data/gunParts` exposes a vector-keyed tower part atlas and flattened helpers for build resolution.
- `src/data/research` uses a technology factory with keyworded definitions, then exposes a vector-keyed research atlas and flattened helpers for the research tree. Research visual grouping is derived from vector keywords such as `medieval`, `nature`, `aether`, and `tech`.
- Development-vector catalogs include a neutral starter vector alongside the four themed branches. Neutral starter buildings, walls, wall-top mounts, and tower parts keep their legacy `*.medieval.*` entity ids for requirement compatibility, but their runtime vector is `neutral`; building neutral entities does not replace the hex's existing terrain background with a building-underlay background.
- `src/pages/Progression/data` contains the derived progression catalog, graph helpers, and page-local progression types used by `/progression` and the `/ids` audit coverage view.
- `src/data/enemies` uses grouped atlas modules, keyed by enemy ecosystem/family and flattened for battle spawning.
- `src/data/globalEvents` and `src/data/globalModifiers` define event content, event images, flags, and global modifiers.
- `src/data/ids.ts` derives grouped content IDs from the active atlases for buildings, research, gun parts, enemies, walls, and superstructures.
- `/ids` renders an audit table that compares registered ids against data definitions, progression rules, and available assets.
- `/content-plan` renders a high-level content planning tree. It reads and writes `local-game-data-server/data/high-level-content-plan.json` through the local development data server's `/game-files/high-level-content-plan.json` endpoint, links plan nodes to existing entity IDs, and can open `/entity-create/new` with the node header and description prefilled as an entity draft.
- Content auto-unlock notifications are batched when several buildings, tower parts, walls, or superstructures unlock together. Discovery notifications append notification-style History entries; temporary visibility changes remain notification-only, and paired "now available" messages are suppressed when discovery already covered the same item.

Texture asset layout:

- City building textures and zoom/shift metadata live in `src/assets/buildings/<vector>` and are cataloged through `src/data/entityVisualAssets.ts`.
- City wall segment textures and metadata live in `src/assets/wallSegments/<vector>` and are cataloged through `src/data/entityVisualAssets.ts`. Wall metadata controls runtime target size, optional rotation, and visible-pixel bounds for battle contact.
- City wall-top/superstructure textures and metadata live in `src/assets/wallSuperstructures/<vector>` and are cataloged through `src/data/entityVisualAssets.ts`. Wall-top metadata controls runtime target size and optional rotation in city and battle previews.
- City hex background textures live in `src/assets/hexBackgrounds/<type>/<biome>/<vector>` and are cataloged through `src/data/cityHexBackgrounds.ts`. City state stores a biome, maximum city size, generated terrain vector map, and per-hex background sprite id/vector; migration rerolls the biome and terrain map, initial and cleared cells use `claimedTerrain`, and built cells use `buildingUnderlay`.
- Tower component textures and metadata live in `src/assets/gunParts/<vector>` and are cataloged through `src/data/entityVisualAssets.ts`; tower part runtime metadata is derived in `src/data/gunParts/partVisualMetadata.ts`. Ammo projectile textures live in `src/assets/projectiles/<vector>` and are referenced from ammo definitions with `projectileSpriteTextureKey`.
- Global event pictures live in `src/assets/events` and are discovered by the global event image catalog.
- Local editor image writes go through dedicated file upload endpoints (`/entity-sprites`, `/global-event-images`, and `/hex-background-sprites`); JSON definition saves should reference image ids or visual asset ids instead of carrying image bytes. Homogeneous value definition edits go through `/homogeneous-values` because the registry is TypeScript-backed.
- The Vite dev server watches active asset folders so editor-written images can trigger reload/HMR and refresh discovered `import.meta.glob` catalogs without a dev server restart.
- Images not currently loaded by code belong under `src/assets/unused`.

Future architecture direction:

- Systems should be generic and content should be data.
- The current shared rule spine is the homogeneous value system: content emits value effects and keyworded modifier rules; selectors resolve those into city support, tower stats, wall state, research/global modifiers, unlocks, and siege pressure.
- Buildings, multistructures, regions, enemies, crises, technologies, tower components, targeting behaviors, and endings should move toward schema-driven definitions.
- Save state should store current state, not full history, except where migration history matters.
- Content scale is a major risk; new content should feel like adding data rather than writing custom engine code.

## 4. Build, Runtime, and Verification

Use npm. The lockfile is `package-lock.json`, so prefer `npm ci` for clean installs.

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript build checks with `tsc -b`, then creates a Vite production build.
- `npm run lint` runs ESLint.
- `npm run preview` previews the production build.

Node.js 24 is expected because the project pins Node 24 for local development and GitHub Pages builds.

There is no formal unit test framework configured yet. For behavior changes, run at least `npm run lint` and `npm run build` when practical. For visual/frontend work, inspect the affected page in the browser.

## 5. Coding and Styling Conventions

Use TypeScript and React function components.

Keep page-specific code under `src/pages/<PageName>`. Keep shared reusable UI under `src/components`. Keep domain types, content definitions, and pure gameplay helpers outside React components when they are not view-specific.

Use Redux Toolkit slices for shared app state. Add selectors beside slices when derived data is needed.

Import local TypeScript modules with explicit `.ts` or `.tsx` extensions, matching the repository's existing style and `allowImportingTsExtensions` setting.

Styling:

- Use vanilla-extract `*.css.ts` files colocated with components/pages.
- Put global tag styles only in `src/styles/global.css.ts`.
- Do not introduce new raw component/page CSS files.
- Prefer separate exported class names for sub-elements instead of descendant selectors.
- Avoid selectors such as `& a` or `& select`.
- Allowed selector patterns include self selectors/pseudo-classes like `&:hover` and explicit parent scoping such as `${parent} &`.
- Use `vars` from `src/theme/theme.css.ts` for themed colors, borders, focus states, surfaces, and text.

## 6. Theme System

Themes reflect gameplay emphasis:

- `tech`: blue, grey, violet.
- `nature`: white, green, yellow.
- `medieval`: dark brown, red, gold.
- `aether`: white, light turquoise, deep blue.

Implementation:

- `src/theme/theme.css.ts` defines the theme contract and concrete theme classes.
- `ThemeProvider.tsx` applies the selected theme class.
- The app currently applies the `tech` theme at startup. The previous manual theme switcher hook exists in the shell but is not exposed in the navigation.
- `computeThemeFromGameState(...)` is a future integration point for automatic theme selection from research path or build composition.

Use `vars.color.*` in component styles rather than hardcoded page palettes.

## 7. Core Gameplay Systems

The primary gameplay loop is:

1. Build city.
2. Increase support.
3. Unlock research.
4. Improve towers and walls.
5. Increase threat.
6. Fight attacks.
7. Gain containment.
8. Expand, migrate, or colonize.
9. Repeat.

Every major mechanic should strengthen at least one loop:

- City development loop.
- Threat loop.
- Research loop.
- Tower design loop.
- Combat validation loop.
- Expansion loop.
- Multistructure loop.
- Crisis loop.
- Regional loop.
- Nomad loop.
- Colonizer/capital loop.
- Ending loop.

When adding a mechanic, answer:

- Which loop does it belong to?
- What decision does it create?
- How does it interact with support, threat, containment, city layout, or tower design?

## 8. Economy and Support

The economy is based on support/upkeep instead of traditional hoarded resources.

Support is produced by city infrastructure and consumed by:

- buildings;
- towers and tower components;
- wall reinforcement;
- megaprojects;
- special systems.

Resources are stored through one keyworded resource map under the hood. UI and derived selectors decide whether a resource is shown as ordinary support, an Aether orb component, or another specialized display.
The current implementation routes resources, city metrics, monster modifiers, siege modifiers, wall stats, tower stats, and future derived game values through the homogeneous value registry in `src/data/homogeneousValues`. Content contributes `HomogeneousValueEffect` entries to registered values, and gameplay/UI code should read final values through selectors instead of reading those effects directly. Every contribution must carry exactly one role keyword: `production`, `upkeep`, or `unlock`. Production creates the resolved value, upkeep reduces available value, and unlock checks against produced value without spending it.

Tower parts use the same `values` and `effects` fields as other homogeneous entities. Tower stats, support upkeep, and tower-scoped modifiers all resolve from the assembled tower's single homogeneous value set. Tower-scoped modifiers use `radius: 0`, which affects only the assembled tower entity.

Gun parts, wall segments, and wall superstructures may also define `derivedValues`. These use the normal homogeneous value effect shape plus `derivedFrom` and `derivedMultiplicator`, run after effective city resolution, and append final combat-facing `tower.*` or `wall.*` production values from resolved `resource.*` or `city.*` source values. Derived content values are intentionally one-way and do not feed back into city economy totals.

Unlocked technologies may contribute city-wide homogeneous values and effects. Technology effects are assigned `radius: Infinity` by the technology factory, and technology homogeneous sources are included in effective city resolution alongside buildings, walls, and towers.

Global events use `GlobalEventDefinition` data to unify migrations, catastrophes, endings, cutscenes, victories, and later meta-game events. A global event is driven by a trigger, requirements, optional blocking requirements, notification level, optional hint text, optional foreseen event ids, and actions. Events should decide that an action happens, but should not calculate gameplay values or effects directly.

Runtime event triggering flows through the global signal system. Gameplay code emits domain-level messages such as game start, city expansion, migration, building discovery, building construction, technology unlock, siege start, siege success, siege failure, and requirements changed. The global event signal hook is the single processor that compares pending messages against global event definitions, checks requirements against current state or an attached message snapshot, applies actions, updates unique executed event ids, appends every happened event to History, updates foreseen-event ids, emits notifications and a History nav marker for notify-level events, redirects force-level events to the History page, and opens a full-screen VFX overlay for victory-level events. Silent events still enter History, but do not raise player-facing UI by themselves. Direct feature-level execution of global events should be avoided; features should emit signals instead.

Persistent meta-game bonuses use `GlobalModifierDefinition` data. Applying a global modifier loads the existing modifier instance from Redux save state, creates it if missing, runs the modifier's `applyRules`, updates internal state, and saves the same instance back under its modifier id. Reapplying the same modifier updates accumulated state instead of creating duplicates. Global events can also remove an active global modifier by id, which deletes its saved instance and removes its homogeneous effects from later city resolution. Global modifier effects are generated from the current modifier state and enter effective city resolution as standard homogeneous value effects, alongside technology effects.

Homogeneous value resolution is a deterministic pipeline. Content entities use `values` for direct homogeneous value contributions and `effects` for `HomogeneousAdjacencyRule` modifiers. A modifier with `radius: 0` affects only the source entity, a finite positive radius affects nearby entities, and `radius: Infinity` affects every matching entity. There is no special keyword for city-wide effects. Runtime resolution builds resolved city entities from occupied hex sources and tower assemblies without mutating source definitions; technologies are global effect sources, not positioned city entities. The resolver collects rules from hexes, towers, and unlocked technologies, then iterates effective keywords from base keywords plus matched rule keyword changes until sorted effective keywords and sorted matched rule ids stabilize. Only after keyword/rule matching stabilizes are active effects applied to each entity's homogeneous values. Each resolved entity contribution is rounded by the value definition's `roundingMethod` before city-level homogeneous totals are summed. Configured derived homogeneous values are calculated from those rounded totals, and effects targeting derived values are applied after the derived base value exists. Derived value effects do not participate in keyword or rule matching during the same resolution pass.

Current resources by vector:

- Technology: Power and Compute.
- Medieval/Human: People and Gold.
- Nature/Biology: Fungi, Plants, and Animals.
- Aether/Magic: Veil, Mana Flows, and Death.

The shared upkeep bar includes a Nature/Biology balance indicator beside the threat meter. It renders Fungi, Plants, and Animals as a three-axis triangular balance shape, while Bio Complexity controls the center-to-edge emerald fill from empty at 0 to fully filled at 1000. Nature also derives Bio Disbalance as the difference between the highest and lowest Fungi, Plants, and Animals values.

Homogeneous value definitions include keywords such as `resource`, `output`, `support`, `atmosphere`, `aether`, and `display_orb`. They also carry first-class `displayMethod`, `resolutionMethod`, `roundingMethod`, and optional diminishing-return metadata. The default rounding method is `twoDigitsAfterZero`; People and Gold currently round up to integers, while Nature/Biology values such as Fungi, Plants, Animals, domination, Bio Complexity, and Bio Disbalance resolve and display with two decimal places. The `diminishingReturn` resolution method requires `diminishingReturnPower` and resolves production with `Math.pow(total, diminishingReturnPower)`, for example `0.8` for softened scaling. Modifiers can target entity keywords, entity types, value keywords, and contribution role keywords, so a production bonus can affect ordinary support, magical outputs, wall stats, siege modifiers, monster modifiers, or later value groups through the same resolver. Display formatting metadata must not be placed in keywords or used for gameplay checks.

Important rules:

- Produced support is total output.
- Free support is unused output.
- Many future systems should intentionally distinguish produced support from free support.
- Support may go negative.
- Existing buildings continue operating during deficits.
- Deficits should block new dependent construction and may later create soft penalties.
- Late-game conversion systems may allow partial substitution, but should add flexibility rather than erase vector identity.

The key economic question is: can this city sustain what the player wants to build next?

## 9. Threat, Signature, and Containment

Threat is the price of growth. It represents how noticeable and disruptive the city has become.

Threat sources:

- city size and occupied hexes;
- expansion;
- buildings;
- multistructures;
- wall/tower rebuilding activity;
- megaprojects;
- regional modifiers and crises.

Vector tendencies:

- Technology and Aether usually create high threat.
- Medieval/Human usually creates moderate threat.
- Nature usually creates lower threat and may reduce threat.

Threat interacts with:

- combat intensity;
- research availability;
- expansion gating;
- crises;
- migration decisions;
- demolition and city rebuilding;
- settlement-site openness;
- ending requirements.

Containment is battle-proven defensive capacity. It gates expansion, research, megaprojects, and some endings. The player may temporarily exceed safe threat/containment margins, creating threat debt, blocked growth, and stronger attacks rather than immediate city destruction.

Demolishing buildings permanently increases the current city's footprint. The in-world explanation is that rubble, waste, damaged machinery, polluted biomass, ritual residue, and other remains must be moved outside the walls to reclaim internal space, and those external footprints attract monsters. Obsolete early buildings therefore either occupy land or grow the city's signature budget. Migration is the clean way to escape accumulated demolition footprint.

Current prototype terminology uses city signature and controlled territory:

- City signature is displayed in the shared upkeep bar as a threat-level meter from the last survived siege signature to current controlled territory.
- The meter label uses the clamped fill percentage: low below 20%, elevated below 40%, medium below 60%, moderate below 80%, and high from 80% to full. The fill shifts smoothly from green to red and reveals signature, footprint, and controlled territory values on hover.
- A city is besieged when signature is greater than controlled territory.
- The city starts with base wall segments, no committed tower, and an initial besieged state caused by the noise of setting camp.

Future naming should reconcile `Threat`, `Signature`, `Attention`, `Danger`, and related candidates.

## 10. City Building

The city is the player's primary creation and the main screen the game should orbit around.

City rules and goals:

- The city uses a hex grid.
- Land is acquired through expansion.
- Expansion increases available land, flexibility, perimeter, complexity, and threat.
- Each settlement site has Openness, which raises maximum city size while multiplying city signature/threat.
- Buildings produce support, consume support, create threat, reduce threat, strengthen neighbors, unlock research, form multistructures, and may create crises.
- Demolishing buildings frees land but leaves permanent city footprint on the current city.
- Placement matters through adjacency and district formation.
- The city should feel like a living puzzle-machine.

Building categories:

- Production buildings.
- Research buildings.
- Defensive buildings.
- Utility/infrastructure buildings.
- Threat management buildings.
- Special buildings and megaproject cores.

Building data convention:

- Building and superstructure unlock requirements live inline on the building definition as `requirements`, matching tower part data.
- Buildings, wall segments, wall towers, and tower parts may also define `buildRequirements`. These use the same requirement rule shapes, but only disable the build/install action while keeping already-visible content visible.
- Superstructure transform recipes live inline on the superstructure definition as `requiredBuildingIds` and can include a player-facing `hint`.

City view implementation:

- The City page renders an SVG hex map.
- City state stores the full generated map, including two unclaimed rings around the claimed city. Unclaimed cells are identified with `isUnclaimed`; selectors expose claimed-only hexes for upkeep, wall, battle, and progression calculations.
- Each city has a maximum cell radius determined when it is created. The current implementation sets it from the `maxCitySize` constant and precomputes a coherent terrain vector map through `maxCitySize + 2`.
- Normal city hexes use city building data.
- The top hex row is reserved for wall hexes and uses the wall build catalog.
- Wall hexes have separate wall-segment and wall-top slots. Wall segments are replaced in place: the current segment is hidden from the wall list, choosing a different segment increases city footprint as if the previous segment were demolished. Wall-top occupants follow the city-building rebuild rule: a tower mount or wall superstructure must be demolished before another wall-top detail can be built.
- Tiles without texture render a colored fallback with the building id so unfinished content remains visible.
- Selecting a tile shows build options and resolved stats.

## 11. Walls and Battle State

The wall is the central connector between city and combat.

In the city view:

- The wall appears as the top row of city hexes.
- Wall hexes can contain wall-specific buildings such as wall segments and towers.

In battle:

- The same wall appears as the lower boundary of the battlefield.
- Enemies approach from beyond it.

Wall buildings may define:

- upkeep cost;
- resilience;
- camo level;
- ignored threat;
- push-back distance, push-backs per second, and push-back zone size;
- zone DoT damage, zone DoT ticks per second, and zone DoT zone size;
- keyword-driven effects such as slow, harm, and push.

Current battle/wall behavior:

- Wall buildings do not define controlled territory, but their combined resilience defines how much active siege pressure the wall can endure during battle.
- Battle uses a growing threat counter instead of a player-facing wave counter.
- Threat starts at 80% of current city signature and grows until it reaches city signature or the siege breaks the wall line.
- If the city is not besieged, battle still runs as constant wall pressure with threat locked to current city signature.
- Melee enemies stop once their hit radius reaches the wall. Ranged enemies with `shotDistance` stop when their hit radius reaches that distance from the wall.
- Stopped melee enemies and ranged enemies at their shot distance add siege pressure equal to their pressure reduced by the wall's ignored threat.
- `randomLines` monster movement picks a new downward-and-sideways trajectory every `sameTrajectoryTimeSeconds`, using `speedPixelsPerSecond` for forward movement and `wobbleAmplitudePixels` as the sideways speed scale.
- Wall push-back and zone DoT values affect enemies inside rectangular battlefield zones measured upward from the wall contact line. Push-back speed is derived from push-back distance so the configured distance is covered over 0.5 seconds.
- If combined siege pressure exceeds combined wall resilience, battle ends before the city signature target and the city retreats by one radius.
- On retreat, cells outside the new radius are lost and the new top row is rebuilt as wall.
- While besieged, research and city/wall building actions are disabled.
- Tower rebuilding is blocked while besieged, except when the player has no committed tower yet.

## 12. Combat

Combat validates planning. It should feel like the city being tested, not a disconnected minigame.

Design intent:

- Combat should appear as a modal or overlay with the city still visually connected.
- The player should spend more time preparing than fighting.
- Combat should create feedback about city, tower, wall, and research weaknesses.
- Combat should avoid twitch gameplay.

Combat concepts:

- The wall has no traditional HP.
- The wall uses live pressure/load/stress from enemies that can threaten it.
- Every enemy has a threat/pressure value.
- Status effects can reduce effective pressure.
- Control strategies are valid; the player does not need to kill everything.
- Active enemy limits can make control and congestion meaningful.
- Regions determine enemy ecosystems; threat determines intensity and rarity.
- Containment is awarded from the highest threat/wave level successfully handled.

Future combat should support DPS, control, and hybrid strategies. Combat duration and exact wave/threat scaling remain open balancing questions.

## 13. Tower Design

Towers are machines designed from components, not fixed tower classes.

Current implementation:

- The Build page stores selected tower part ids in Redux.
- `src/models/battle/resolveTowerAssembly.ts` resolves stats, support costs, keywords, targeting behavior, warnings, and synergies.
- Build and Battle share resolved tower state.
- Tower projectile radius, projectile spread, trigger tolerance, maximum range, minimum range, and maximum rotation angle are resolved as homogeneous tower values alongside damage, speed, range, reload, rotation, and area. Maximum range, minimum range, and maximum rotation angle default to unlimited when no source contributes them. If multiple sources contribute maximum range or maximum rotation angle, the lower value wins; if multiple sources contribute minimum range, the higher value wins.
- Tower parts can also contribute tower-scoped circular zone effects around the tower center: outward push-back, temporary flee movement, temporary circling movement, zone DoT, and stun. These use `tower.zone*` homogeneous values and stay attached to the resolved tower assembly rather than entering wall-zone resolution. Wall superstructures that contribute `tower.*` values are treated as standalone single-detail tower defenses at their wall-top position, mutually exclusive with modular gun placement at that position.
- Tower parts can contribute single-target tower effects with `tower.singleTarget*` homogeneous values. Each effect independently selects the closest enemy to the tower within that effect's range, then applies one-target push-back, flee, circle, DoT ticks, or stun.
- Monster armor is a flat reduction from incoming battle damage resolved through the damage resolver. `armorPiercing` ignores half of this flat armor value, while `ignoreArmor` bypasses it completely.
- Wall zone DoT damage carries runtime damage keywords from wall entities that contribute `wall.zoneDotDamage`, plus the `additionalKeywords` on those damage contributions. This lets wall superstructures such as poisonous spore mushrooms mark their DoT as `poison`, `antiAir`, `armorPiercing`, or `ignoreArmor`.
- Gun stat values from tower parts stay inside the specific mounted gun assembly. Only city-scoped tower-part values enter city homogeneous totals, which prevents stats such as projectile damage from being summed into the city and reused by other towers.
- Shared tower content starts in `src/data/gunParts`, with tower parts split by development vector.
- Battle is blocked until the player assembles the first tower and commits it with Rebuild.
- The most basic tower components are medieval and require no upkeep.

Design direction:

- The player may eventually build up to five towers.
- Tower costs should depend on components rather than tower count.
- Components consume support from their vector.
- Components may include weapon, ammunition, loader, targeting, utility, and special modules.
- Targeting is a core design axis, not a minor stat.
- Hybrid towers should be encouraged.

Vector identities:

- Technology: accurate, reliable, efficient, often resistance-bypassing.
- Medieval/Human: flexible, critical, judgment-based, sometimes inconsistent.
- Nature/Biology: attrition, debuffs, control, instinctive targeting.
- Aether/Magic: powerful, global, slow, expensive, strange priorities.

Tower progression should come from new components, new combinations, support types, targeting options, and research unlocks rather than simple stat inflation.

## 14. Research

Research represents capability, not a currency purchase.

Design direction:

- Research should be enabled by infrastructure, buildings, multistructures, support capacity, containment, regions, crises, and prior technologies.
- Research should not primarily require passive accumulation of points.
- The UI should clearly explain why a node is locked and what is missing.
- Each vector has its own tree and identity.
- Cross-vector technologies encourage hybrid cities.
- Some technologies may be hidden until regions, multistructures, threat thresholds, or crises reveal them.

Current implementation:

- The Research page renders a radial tree with `react-d3-tree`.
- Nodes are collapsible and colored by research vector.
- Node content is structured with summary, unlocks, costs, and notes.
- Technologies auto-unlock when their prerequisite technologies, city buildings, built multistructures, upkeep, Aether atmosphere, and siege-state requirements are satisfied.
- Research nodes show whether they are locked, currently unlocking, or researched; the page no longer exposes a manual research purchase button.
- Newly unlocked technologies emit app notifications through the shared notification center and append notification-style entries to History.
- Node internals render through custom SVG/HTML foreignObject content.
- The Progression page renders a content dependency graph. Every node is colored by development vector. Shape communicates content type: buildings are square, superstructures are rectangular, technologies are heavily rounded rectangles, and tower parts are circular.
- Aether progression requirements use atmospheric states instead of raw numbers: Veil, Mana Flows, and Death. Each level is derived from the unified resource output total divided by city hex count, rounded down and clamped to levels 1 through 5. Biology progression requirements expose Biodiversity as a decimal value with two digits.
- The resource bar hides ordinary resources with zero production. It still shows a resource at net zero when production and consumption cancel out.
- The resource bar represents current Aether atmosphere as a smooth gradient orb instead of numeric rows: Mana Flows tint the left side red, Veil tints the right side blue, and Death darkens the bottom. Hovering the orb reveals the named level for each direction.
- The early progression spine is represented by the current medieval/nature/aether research and content JSON catalogs, with draft naming context in `docs/progression_medieval.md`, `docs/progression_bio.md`, and `docs/progression_magic.md`.
- The first tower can be assembled without a barrel: the initial required parts are the crude wood frame, stone basket, and crude sling launcher. The crude barrel is an early Foraging unlock.

Future categories include infrastructure, military, science, society, and special projects. The research tree may eventually be very large, so filtering and discoverability are important risks.

## 15. Multistructures

Multistructures are manual district upgrades created from a connected set of required buildings.

Core rules:

- Multistructures never appear automatically.
- The player selects any participating building and explicitly confirms the upgrade.
- The City page lists ready and incomplete multistructure candidates for the selected participant. Ready candidates expose a Transform action unless the city is besieged.
- Confirming a transform links the matched buildings into one multistructure. Each part stores the multistructure id and an internal representative core hex key used for selection, adjacency, economy, signature, and research checks.
- Structure parts may store their original source building id as `initialBuildingKey`. Superstructures can define `requiredBuildingSprites` as a source-building-id to sprite-id map, allowing each folded cell to render the correct replacement sprite across multiple multistructure levels without changing gameplay calculations.
- Required buildings must form a connected blob, not a fixed shape. A superstructure may require repeated copies of the same building id.
- Blob-shaped layouts are allowed.
- Normal buildings remain mechanically understandable, while the district may visually integrate into one larger structure.

Multistructures should:

- reward planning;
- create recognizable districts;
- unlock unique research;
- increase city identity;
- generate additional threat;
- compete with normal buildings rather than strictly replace them.

Future definitions should include core building, required buildings/tags, threat modifier, visual set, unlocks, effects, and upgrade chain.

## 16. Regions and Crises

Regions prevent the game from becoming solved permanently.

A region should define:

- terrain modifiers;
- enemy ecosystem;
- unique opportunities;
- unique problems;
- region-specific structures, technologies, crises, or enemies.

Enemy composition is tied to region. Threat controls quantity, strength, and rarity, not the ecosystem identity.

Crises are consequences of city choices, especially excessive specialization. They should encourage diversification without feeling like arbitrary punishment.

Crisis principles:

- Crises often hurt other vectors rather than the vector that caused them.
- Crises should escalate so the player has time to respond.
- Each crisis should explain cause, effect, and possible solutions.
- Migration may be a valid answer to a region or crisis becoming too expensive.

Examples:

- Technology can create pollution, grid instability, or AI drift.
- Medieval/Human systems can create bureaucracy or unrest.
- Nature can create overgrowth or predator blooms.
- Aether can create reality distortion or mana storms.

## 17. Migration, Colonies, and Capitals

The game is not intended to revolve around one permanent city. Cities are temporary; civilization is permanent.

Two major long-term paths:

- Nomad: abandon cities, extract specialists, and carry expertise forward.
- Colonizer: preserve cities as colonies, import free support, and build an empire around a capital.

Nomad rules:

- Abandoning a city can grant specialists.
- Current proposal: +1% support bonus per 100 produced support.
- Produced support matters, not free support.

Colonizer rules:

- Colonies continue operating after the player leaves.
- Colonies can transfer a portion of free support to the capital.
- Imports use free support to avoid recursive support chains.
- One city may become the capital.
- The capital hosts imports, megaprojects, and empire-scale structures.
- Capital deficits are allowed and can create late-game recovery stories.
- Capital transfer should require positive local support, no critical import dependency, and sufficient infrastructure.

Hybrid play should be supported: keep valuable colonies, abandon mediocre cities, and let player history matter.

## 18. Endings and Megaprojects

Endings are final engineering projects. The player wins because they built a solution to the safety problem.

General pattern:

1. Build required infrastructure.
2. Unlock the ending megaproject.
3. Complete the megaproject.
4. Survive or satisfy the final challenge.
5. Win.

Endings should require combinations of city layouts, multistructures, containment levels, technologies, tower commitments, strategic tradeoffs, and sometimes multiple cities.

Known ending directions:

- Technology: Temporal Shift Barrier, Ark Launch, Nanomachine Restoration.
- Nature: World Brain, Harmony.
- Aether: Ascension, Phase Shift.
- Medieval/Human: Human Empire, Hidden Village.
- Hybrid endings: Arcane Industry, Bio Empire, Machine Garden.
- True ending: Planetary Restoration through major investment in all vectors.

Every ending should express a philosophy and produce a visibly different city.

## 19. UI and Player Experience

The UI should feel like one coherent world centered on the city.

Primary visual priorities:

1. Threat or signature.
2. Support.
3. Containment or controlled territory.
4. Expansion opportunities.
5. Research opportunities.

UI principles:

- The city should be the default state.
- The wall should remain a visual anchor across city and combat.
- Combat should feel like a camera shift from city to battlefield.
- Support should show produced, used, and free values.
- Deficits should state consequence and recovery path.
- Research should show missing requirements.
- Multistructure UI should show possible upgrades, missing satellites, and benefits.
- Tower UI should summarize actual behavior in readable language.
- Combat UI should explain enemy threat value, status effects, and current contribution to wall load.
- Crisis UI should explain cause, effect, and solutions.
- Region previews should show advantages, disadvantages, unique structures, enemies, and technologies.
- Ending progress should make long-term goals visible.

Prefer explaining outcomes over exposing unexplained formulas.

## 21. Data and Content Direction

Current content layout:

- `src/data/buildings/` uses vector-keyed atlas modules.
- `src/data/wallSegments/` and `src/data/wallSuperstructures/` use independent atlas patterns keyed by development vector. Wall hexes store those two layers separately.
- `src/data/enemies/` uses grouped atlas modules, keyed by enemy ecosystem/family and flattened for battle spawning.
- `src/data/gunParts/` exposes a vector-keyed tower part atlas and flattened helpers for build resolution.
- `src/data/research/` uses `createTechnologyFactory(...)` for keyworded technology definitions and exposes a vector-keyed research atlas plus flattened helpers for the research tree.
- `src/pages/Progression/data/` contains progression graph helpers derived from building, research, wall, and tower part requirement data.
- `src/data/ids.ts` derives grouped content ids from the active atlases for buildings, technologies, tower parts, enemies, wall segments, and wall superstructures. Add runtime ids to the relevant JSON/catalog first, then confirm derived ID and asset coverage in `/ids`.
- `/ids` is the content audit screen for checking missing definitions, progression rules, and assets by id.
- `/monster-edit/:monsterId` edits monster entries under `src/data/enemies` and saves paired enemy sprite metadata under `src/assets/enemies/<region>`. Monster definitions may set `minimumCityVisibilityThreshold`; the battle wave planner only includes monsters whose threshold is at or below the current city visibility/threat value.

Future content definitions should be data-driven and tag-heavy.

Recommended building fields:

- id;
- name;
- vector;
- tier;
- threat;
- support production;
- support consumption;
- research production;
- adjacency effects;
- tags.

Recommended future definition families:

- buildings;
- multistructures;
- regions;
- enemies;
- crises;
- technologies;
- tower components;
- targeting behaviors;
- endings.

Tags should drive future systems wherever possible. Prefer "has tag industrial" over special-casing "is Factory."

## 22. Persistence

Core Redux gameplay progress is persisted to browser `localStorage` under a versioned save payload. The store hydrates saved gameplay slices at startup, then subscribes to Redux updates and writes the current gameplay state after changes. Development-tool UI state uses separate localStorage keys and must not be mixed into the player save payload.

The current save includes:

- built structures and city status;
- researched technologies;
- tower configurations;
- support and controlled territory state;
- unlock state;
- global event flags, modifiers, endings, cutscene history, happened event history, foreseen event hints, unseen notify-level history markers, pending victory overlays, and the last seen History event.

The player save intentionally excludes debug mode and editor UI state. Debug mode is persisted separately for development so Vite-triggered reloads do not drop the user out of dev-only routes.

While the game is pre-alpha, internal Redux state shape may change without backward compatibility. Save payloads are versioned so compatibility should be handled through explicit store migrations rather than preserving legacy runtime fallbacks in gameplay logic.

Future save state should store:

- region state;
- migration and colony history where historically meaningful;
- support allocations beyond current upkeep state.

Prefer storing current state over every past event. Migration records are an intentional exception because abandoned cities, specialists, capitals, and colonies are part of the player's identity.

Potential future sharing:

- JSON build export/import.
- File download/upload.
- URL hash-based build sharing.

## 23. Open Questions and Risks

Open design questions:

- Final game title.
- Final name for Threat/Signature/Attention.
- Exact threat formula and whether threat decays naturally.
- Exact demolition threat values and Openness size/threat scaling.
- Target city size and whether city shape matters mechanically.
- Whether support storage exists at all.
- Deficit soft penalties.
- Combat duration and wave/threat scaling.
- Final tower slot list and whether towers can share components.
- Maximum multistructure size and visual treatment of satellites.
- Whether research takes time.
- Number of region archetypes and release endings.
- Maximum active city count.
- How much story text the game should include.

Major risks:

- Content explosion.
- Balancing expressive broken builds without making all choices meaningless.
- Analysis paralysis from too many options.
- Large save files.
- Late-game performance with many cities, buildings, and tower effects.
- Research tree usability at high content counts.
- Maintaining content without data-driven schemas.

Prototype success criteria:

- City building feels good.
- Combat validates planning.
- Threat/signature is understandable.
- Support economy feels distinct from idle stockpiling.
- Multistructures are satisfying.
- Migration feels meaningful.
- At least two radically different strategies are viable.

## 24. Reference Documents

Detailed design notes live in:

- `docs/vision.md`
- `docs/Best Idle Game Ever 2 — Game Design Document.md`
- `docs/coreLoop.md`
- `docs/economy.md`
- `docs/cityBuilding.md`
- `docs/threat.md`
- `docs/combat.md`
- `docs/towers.md`
- `docs/research.md`
- `docs/multistructures.md`
- `docs/regions-and-crises.md`
- `docs/migrations.md`
- `docs/endings.md`
- `docs/ui-and-player-experience.md`
- `docs/technical-architecture.md`
- `docs/backlog-and-open-questions.md`
- `docs/ideas.md` is currently empty.

When changing architecture, gameplay scope, or major conventions, update this specification and the relevant focused document together.

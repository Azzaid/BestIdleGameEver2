# Project Specification: Best Idle Game Ever 2

Last updated: 2026-06-14 (local)

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

## 2. Current Prototype Scope

The current app is a frontend-only prototype with multiple routed views:

- Battle: Pixi/canvas battlefield rendering with enemy spawning, tower fire, projectiles, health bars, wall pressure, and battle state.
- Build: tower assembly from component slots with resolved stats, support costs, warnings, keywords, and synergies.
- Research: radial research tree with unlockable nodes and vector coloring.
- City: SVG hex city visualization with clickable city and wall tiles, build panels, resolved stats, trace/resilience state, and wall-specific construction.
- Statistics: sample time-series charts.

The prototype has no backend and no formal persistence system yet.

## 3. Technical Architecture

Current stack:

- React 19 with TypeScript.
- Vite 7.
- Redux Toolkit.
- React Router.
- vanilla-extract for typed CSS.
- Pixi.js for battle rendering.
- TanStack Table and React Virtual for the Build page parts table.
- react-d3-tree for the Research page tree visualization.

Entry points and app shell:

- `src/main.tsx` loads global styles and renders the app.
- `src/App.tsx` wires `Provider`, `ThemeProvider`, `BrowserRouter`, navigation, routes, theme switching, and the shared upkeep bar.
- `src/store` contains Redux setup, slices, typed hooks, and selectors.
- `src/theme` contains the vanilla-extract theme contract and runtime theme provider.

Primary routes:

- `/` and `/battle` render Battle.
- `/build` renders tower assembly.
- `/research` renders research.
- `/city` renders the city view.
- `/statistics` renders charts.

Important directories:

- `src/pages` contains routed page experiences.
- `src/pages/Battle` contains battle runtime models, factories, spawning, aiming, firing, movement, projectiles, health bars, wall/siege systems, Pixi synchronization, and UI.
- `src/pages/City/Components` contains city hex rendering and helpers.
- `src/pages/Research/Components` contains research tree node components.
- `src/components` contains shared UI such as the upkeep bar.
- `src/models` contains TypeScript domain models.
- `src/data` contains static gameplay data and constants.
- `src/theme` contains theme tokens and runtime theme selection.
- `src/styles` contains global vanilla-extract styles.
- `src/assets` contains active textures organized by gameplay type plus `src/assets/unused` for images not currently loaded.
- `docs` contains product, design, architecture, and open-question notes.
- `public` contains static Vite assets.

Content data layout:

- `src/data/buildings` uses vector-keyed atlas modules.
- `src/data/wall` uses the same atlas pattern, keyed by development vector and flattened for wall lookup. Wall segment content lives under `segments`, wall-top superstructure content lives under `superstructures`, and wall hexes store those two layers separately.
- `src/data/towers` exposes a vector-keyed tower part atlas and flattened helpers for build resolution.
- `src/data/research` exposes a vector-keyed research atlas and flattened helpers for the research tree.
- `src/data/enemies` uses grouped atlas modules, keyed by enemy ecosystem/family and flattened for battle spawning.
- `src/data/identificators` is the single source of truth for content ids. Category folders collect ids by vector or biome and expose structured paths such as `buildings.aether.leylineWell` and `gunparts.barrels.medieval.crudeWood`.
- `/ids` renders an audit table that compares registered ids against data definitions, progression rules, and available assets.

Texture asset layout:

- City building textures live in `src/assets/city/buildings/<vector>` and are registered through `src/models/sprites/buildings`.
- City wall segment textures and metadata live in `src/assets/city/walls/<vector>` and are registered through `src/models/sprites/walls`.
- City wall-top/superstructure textures live in `src/assets/city/wallTops/<vector>` and are registered through `src/models/sprites/wallTops`.
- Battle tower component textures and metadata live in `src/assets/battle/towerParts/<vector>` and are registered through `src/data/towers/partVisualMetadata.ts`.
- Images not currently loaded by code belong under `src/assets/unused`.

Future architecture direction:

- Systems should be generic and content should be data.
- Buildings, multistructures, regions, enemies, crises, technologies, tower components, targeting behaviors, and endings should move toward schema-driven definitions.
- Save state should store current state, not full history, except where migration history matters.
- Content scale is a major risk; new content should feel like adding data rather than writing custom engine code.

## 4. Build, Runtime, and Verification

Use npm. The lockfile is `package-lock.json`, so prefer `npm ci` for clean installs.

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript build checks with `tsc -b`, then creates a Vite production build.
- `npm run lint` runs ESLint.
- `npm run preview` previews the production build.

Node.js 18 or newer is expected because of Vite 7 and the current toolchain.

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
- The app exposes manual theme switching.
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

Each vector has operational support and research support:

- Technology: Electricity and Computing Power.
- Medieval/Human: People and Gold.
- Nature/Biology: Biomass and Mutagens.
- Aether/Magic: Mana and Ancient Knowledge.

Important rules:

- Produced support is total output.
- Free support is unused output.
- Many future systems should intentionally distinguish produced support from free support.
- Support may go negative.
- Existing buildings continue operating during deficits.
- Deficits should block new dependent construction and may later create soft penalties.
- Late-game conversion systems may allow partial substitution, but should add flexibility rather than erase vector identity.

The key economic question is: can this city sustain what the player wants to build next?

## 9. Threat, Trace, and Containment

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

Demolishing buildings permanently increases the current city's base visibility/threat. The in-world explanation is that rubble, waste, damaged machinery, polluted biomass, ritual residue, and other remains must be moved outside the walls to reclaim internal space, and those external scars attract monsters. Obsolete early buildings therefore either occupy land or pollute the city's visibility budget. Migration is the clean way to escape accumulated demolition scars.

Current prototype terminology also uses city trace and resilience:

- City trace is displayed in the shared upkeep bar as a capped meter against current city resilience.
- The meter fill never overflows beyond resilience and shifts from gray through green/yellow to red as it approaches the cap.
- A city is besieged when trace is greater than resilience.
- The city starts with base wall segments, no committed tower, and an initial besieged state caused by the noise of setting camp.

Future naming should reconcile `Threat`, `Trace`, `Visibility`, `Attention`, `Danger`, and related candidates.

## 10. City Building

The city is the player's primary creation and the main screen the game should orbit around.

City rules and goals:

- The city uses a hex grid.
- Land is acquired through expansion.
- Expansion increases available land, flexibility, perimeter, complexity, and threat.
- Each settlement site has Openness, which raises maximum city size while multiplying city visibility/threat.
- Buildings produce support, consume support, create threat, reduce threat, strengthen neighbors, unlock research, form multistructures, and may create crises.
- Demolishing buildings frees land but leaves permanent demolition threat on the current city.
- Placement matters through adjacency and district formation.
- The city should feel like a living puzzle-machine.

Building categories:

- Production buildings.
- Research buildings.
- Defensive buildings.
- Utility/infrastructure buildings.
- Threat management buildings.
- Special buildings and megaproject cores.

City view implementation:

- The City page renders an SVG hex map.
- Normal city hexes use city building data.
- The top hex row is reserved for wall hexes and uses the wall build catalog.
- Tiles without texture render a colored fallback with the building id so unfinished content remains visible.
- Selecting a tile shows build options and resolved stats.

## 11. Walls and Battle State

The wall is the central connector between city and combat.

In the city view:

- The wall appears as the top row of city hexes.
- Wall hexes can contain wall-specific buildings such as wall segments and tower platforms.

In battle:

- The same wall appears as the lower boundary of the battlefield.
- Enemies approach from beyond it.

Wall buildings may define:

- upkeep cost;
- resilience;
- camo level;
- ignored threat;
- keyword-driven effects such as slow, harm, and push.

Current battle/wall behavior:

- Wall buildings do not define the city trace cap, but their combined resilience defines how much active siege pressure the wall can endure during battle.
- Battle uses a growing threat counter instead of a player-facing wave counter.
- Threat starts at 80% of current city trace and grows until it reaches city trace or the siege breaks the wall line.
- If the city is not besieged, battle still runs as constant wall pressure with threat locked to current city trace.
- Enemies stop once their hit radius reaches the wall.
- Stopped enemies add siege pressure equal to their pressure reduced by the wall's ignored threat.
- If combined siege pressure exceeds combined wall resilience, battle ends before the city trace target and the city retreats by one radius.
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
- Shared tower content starts in `src/data/towers/parts`, with tower parts split by development vector.
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
- Node internals render through custom SVG/HTML foreignObject content.
- The early progression spine follows `docs/progression_drafts.md`: Shelter unlocks Foraging; Foraging unlocks scrap gathering and the crude barrel; Stalker House opens seed gathering and scrap tools; those split into herbalist/botany, forester/workable timber, farm/money/market, mysticism, and magic-stone tower parts.
- The first tower can be assembled without a barrel: the initial required parts are the crude wood frame, stone basket, and crude sling launcher. The crude barrel is an early Foraging unlock.

Future categories include infrastructure, military, science, society, and special projects. The research tree may eventually be very large, so filtering and discoverability are important risks.

## 15. Multistructures

Multistructures are manual district upgrades created from a core building plus adjacent satellite buildings.

Core rules:

- Multistructures never appear automatically.
- The player selects the core and explicitly confirms the upgrade.
- Required satellites must be adjacent to the core, not arranged in fixed shapes.
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

1. Threat or trace.
2. Support.
3. Containment or resilience.
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

## 20. Statistics

The current Statistics page draws simple sample time-series line graphs for damage, gold, and accuracy on canvas.

Future statistics should focus on understanding:

- tower behavior and targeting choices;
- support production, use, and deficits;
- threat and containment margin over time;
- wall pressure contributors;
- battle replays or post-battle lessons;
- city/district efficiency.

## 21. Data and Content Direction

Current content layout:

- `src/data/buildings/` uses vector-keyed atlas modules.
- `src/data/wall/` uses the same atlas pattern, keyed by development vector and flattened for wall lookup. Wall segment content lives under `segments`, wall-top superstructure content lives under `superstructures`, and wall hexes store those two layers separately.
- `src/data/enemies/` uses grouped atlas modules, keyed by enemy ecosystem/family and flattened for battle spawning.
- `src/data/towers/` exposes a vector-keyed tower part atlas and flattened helpers for build resolution.
- `src/data/research/` exposes a vector-keyed research atlas and flattened helpers for the research tree.
- `src/data/identificators/` owns content ids for buildings, technologies, tower parts, enemies, wall segments, and wall superstructures. Add ids there first, then consume those constants from data, progression, state defaults, and asset registries.
- `/ids` is the content audit screen for checking missing definitions, progression rules, and assets by id.

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

Persistence is not implemented yet.

Future save state should store:

- built structures;
- support allocations;
- researched technologies;
- tower configurations;
- region state;
- city status;
- migration and colony history where historically meaningful.

Prefer storing current state over every past event. Migration records are an intentional exception because abandoned cities, specialists, capitals, and colonies are part of the player's identity.

Potential future sharing:

- JSON build export/import.
- `localStorage` session saves.
- File download/upload.
- URL hash-based build sharing.

## 23. Open Questions and Risks

Open design questions:

- Final game title.
- Final name for Threat/Trace/Visibility/Attention.
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
- Threat/trace is understandable.
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

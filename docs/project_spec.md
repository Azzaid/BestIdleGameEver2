# Project Specification: Tower Defense Idle (best_idle_game_ever_2)

Last updated: 2025-08-08 16:24 (local)

## 1. Purpose and Scope
A browser-based tower-defense idle game prototype with multiple views:
- Battle: canvas-based battlefield rendering and basic controls.
- Build: choose components to assemble a tower from slots (barrel, base, aimSystem, ammo, barrelAttachment, loadingSystem, launchSystem).
- Research: navigate a tech tree; unlock nodes with research points, visualize dependencies.
- City: canvas-based city visualization with clickable buildings and resource panel.
- Statistics: display sample time-series stats (damage, gold, accuracy) with simple canvas charts.

The UI supports dynamic theming tied to gameplay emphasis (research path/build composition) and a manual theme switcher for demonstration.

## 2. High-level Architecture
- UI Framework: React 19 with TypeScript.
- Bundler/Dev Server: Vite 7.
- Routing: react-router-dom v7.
- Styling: vanilla-extract (typed CSS-in-TS) with theme contracts.
- Theming: vanilla-extract createTheme/contract; runtime selection via ThemeProvider.
- Canvas: HTML canvas used directly for simple rendering (Battle, City, Statistics graphs).

Directory overview:
- src/
  - App.tsx, App.css.ts – App shell, navigation, theme switcher.
  - main.tsx – Entry; applies global styles.
  - styles/global.css.ts – Global tag styles, utility classes bound to theme vars.
  - theme/
    - theme.css.ts – Theme contract + theme tokens (tech, nature, medieval, aether).
    - ThemeProvider.tsx – Context + runtime theme class application and helper to compute theme from game state.
  - pages/
    - Battle/… – BattlePage.tsx + .css.ts
    - Build/… – BuildPage.tsx + .css.ts
    - Research/… – ResearchPage.tsx + .css.ts
    - City/… – CityPage.tsx + .css.ts
    - Statistics/… – StatisticsPage.tsx + .css.ts

## 3. Theming Requirements and Design
Themes to reflect gameplay emphasis:
- tech: blue/grey/violet
- nature: white/green/yellow
- medieval: dark brown/red/gold
- aether: white/light turquoise/deep blue

Implementation:
- src/theme/theme.css.ts defines a theme contract `vars` with color tokens: primary, primaryDark, secondary, text, background, border, link, buttonText.
- Each theme (techTheme, natureTheme, medievalTheme, aetherTheme) binds concrete values.
- ThemeProvider wraps the app and applies the selected theme class to a top-level div.
- Theme selection:
  - Manual: ThemeSwitcher component exposes buttons for each theme.
  - Automatic (stub): computeThemeFromGameState(researchPath?, buildCompositionEmphasis?) returns a ThemeName based on keywords. Integrate with actual game state in the future.

Usage in styles:
- Use `vars.color.*` tokens in component styles for consistent theming.
- Global styles (links, buttons, headings, body BG/text) are bound to `vars`.

## 4. Styling Conventions (vanilla-extract)
- All component styles are colocated using `*.css.ts` next to components/pages.
- Prefer composition via class names rather than deep selectors.
- Important rule: Do not use descendant selectors like `& a` or `& select`. Allowed:
  - `&` (self) and modifiers/pseudo-classes (e.g., `&:hover`, `&:focus`).
  - Parent scoping when needed: template parent targeting such as `${parent} &` (defined in the parent and applied to the child).
- Global styles live only in `src/styles/global.css.ts`.
- Legacy CSS files were deprecated and no longer imported; do not reintroduce raw `.css` modules for components/pages.

## 5. Pages Overview
- BattlePage
  - Renders a canvas showing a simple path, tower, and walls.
  - Styles: src/pages/Battle/BattlePage.css.ts.

- BuildPage
  - Allows selecting components for defined slots; highlights selection; shows derived stats.
  - Uses TanStack Table v8 for the parts table with per-column filtering, column visibility toggles, and row virtualization via @tanstack/react-virtual.
  - Styles: src/pages/Build/BuildPage.css.ts; uses class toggles like `componentOptionSelected`.

- ResearchPage
  - Radial research tree rendered with react-d3-tree in polar orientation; nodes are collapsible and colored by research vector (tech, nature, medieval, aether).
  - Node content is structured (no free-form markdown): summary, unlocks list, costs, and notes; rendered inside an HTML foreignObject for rich layout.
  - Data model: each node is a RawNodeDatum with `name`, optional `children`, and an `attributes` object containing `{ id: string, name: string, vector: ThemeVector, summary?: string, unlocks?: string[], costs?: { type: string; amount: number }[], notes?: string }`.
  - Styles: the canvas background/legend are inline; vanilla-extract file remains for page-level layout (filters, container) but node internals are rendered via SVG/HTML in the custom renderer.

- CityPage
  - Canvas city map with buildings; on click, shows info panel; actions panel & resources summary.
  - Styles: src/pages/City/CityPage.css.ts.

- StatisticsPage
  - Draws simple line graphs for sample series (damage, gold, accuracy) on canvas; includes a legend and axes.
  - Styles: src/pages/Statistics/StatisticsPage.css.ts.

## 6. Navigation
- Router: BrowserRouter with routes
  - `/` -> Battle
  - `/battle`, `/build`, `/research`, `/city`, `/statistics`
- Top navigation bar in App.tsx with links styled by App.css.ts.

## 7. Build and Runtime Requirements
- Node.js: Vite 7 and vanilla-extract tooling require Node >= 18 (Vite 7 engines: ^18.0.0 || >=20.0.0). Using Node 16 may cause failures (e.g., during Vite config resolution or due to missing `crypto.getRandomValues`).
- npm scripts (package.json):
  - `npm run dev` – start Vite dev server.
  - `npm run build` – type-check and build.
  - `npm run preview` – preview the production build.
- Vite plugins: `@vanilla-extract/vite-plugin` for processing `.css.ts`.

## 8. Extensibility Guidelines
- Adding a new theme:
  1) Extend ThemeName and themeByName in `src/theme/theme.css.ts` with new tokens.
  2) Provide palette values for the `vars` contract.
  3) Expose a switch in ThemeSwitcher or integrate into computeThemeFromGameState.

- Adding a new page:
  1) Create `PageName/PageName.tsx` and `PageName/PageName.css.ts`.
  2) Add a route in App.tsx and update navigation.
  3) Follow styling conventions; use `vars` for colors.

- Component styling:
  - Create separate classes for sub-elements; avoid descendant selectors under `&`.
  - Use pseudo-classes on the same element (`&:hover`) as needed.

## 9. Testing and Linting
- ESLint configured via eslint.config.js; run `npm run lint`.
- No formal unit tests included yet; canvas rendering is visual.
- Consider adding Vitest + React Testing Library in the future.

## 10. Current Limitations / Future Work
- Theming is manual or heuristic; integrate with actual game state to auto-switch based on research/build emphasis.
- Canvas rendering is rudimentary; consider extracting to dedicated rendering modules and adding resize/redraw strategies.
- Accessibility: expand keyboard navigation and ARIA for interactive elements.
- Performance: memoize heavy components, consider virtualization for large research trees.
- Internationalization: not implemented.

## 11. Legacy and Migration Notes
- Legacy `.css` files were deprecated; their contents replaced with deprecation comments where left for reference.
- All pages and App now use vanilla-extract `.css.ts` files.

## 12. Quickstart
1) Ensure Node >= 18 (recommended latest LTS) and npm.
2) Install deps: `npm ci` (or `npm i`).
3) Dev: `npm run dev` -> open the printed localhost URL.
4) Build: `npm run build`; Preview: `npm run preview`.
5) Switch theme via the buttons in the top-right ThemeSwitcher.

## 13. Security & Privacy
- No backend; no data persisted or transmitted in this prototype.
- When adding persistence, define a data model and storage policy.

---
This document is the single source of truth for project requirements and architecture. Keep it updated with any significant changes to structure, dependencies, or conventions.


---

## 14. Gameplay Mechanics (Extended Design Notes)

### 14.1 Core Mechanics
- Single tower located in the center of a city wall at the bottom of the screen.
- Enemies approach from the top, moving downward.
- The tower is constructed from multiple parts:
  - Barrel, Ammo, Loader, Scope
- Each part has `tags` and `effects` that interact with others to generate emergent behavior.
- Tag synergies allow unique effects when certain combinations are active.

### 14.2 Synergy System

```ts
const tagSynergies = {
  "piercing+explosive": (tower) => tower.splash += 1,
  "plasma+rapid": (tower) => tower.burnDuration += 2,
};
```

### 14.3 Math Utilities
Use libraries like `vec2` or `pts.js` to assist with:
- Rotation and recoil of layered sprites
- Lead prediction (aiming at moving enemies)
- Projectile trajectories

---

## 15. UI Interaction and Views

### 15.1 View Tab (Battle View)
- Canvas-only, non-interactive.
- Shows the turret firing automatically at targets.
- Visual only; no click interaction.

### 15.2 Assemble Tab
- Tabbed UI showing part selection per component slot (Barrel, Loader, etc.)
- Each tab shows a table with:
  - Name
  - Tags
  - Description
  - Stat Modifiers
- Build is resolved via effects and tag synergies.
- Current implementation stores the active tower assembly in Redux as selected part ids, resolves it through `src/models/battle/resolveTowerAssembly.ts`, and shares the resolved stats, support costs, keywords, targeting keywords, warnings, and synergies between the Build and Battle pages.
- Shared tower part content starts in `src/data/towers/parts.ts`; part rows may be locked by research ids, consume upkeep/support types, and contribute modifiers or targeting behavior.

### 15.3 Statistics Tab
- DPS and efficiency stats.
- Synergy list.
- Graph or visual feedback panel.

### 15.4 City View (Future)
- Visual city layout with empty or filled building slots.
- Buildings provide persistent bonuses (e.g., unlockers, multipliers, synergy buffs).
- Examples:
  - Foundry: Improves metal-based parts
  - Lab: Unlocks synergy hints
  - Generator: Boosts loader speed

---

## 16. Persistence

- JSON-based build export/import
- Uses `localStorage` for in-browser session saves
- Optional future support for:
  - File download/upload
  - URL hash–based build sharing

---

## 17. Out of Scope (Reiterated)

- No active enemy wave system
- No multiplayer
- No complex AI/collision/physics
- No real-time strategy map — focus remains on tower composition

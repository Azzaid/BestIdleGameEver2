# AGENTS.md

Guidance for AI agents working in this repository.

## Project Architecture

This is a browser-based tower-defense idle game prototype built with React 19, TypeScript, Vite 7, Redux Toolkit, React Router, vanilla-extract, and Pixi.js.

The app entry is `src/main.tsx`, which loads global vanilla-extract styles and renders `src/App.tsx`. `App.tsx` wires the Redux `Provider`, runtime theme provider, browser routes, top navigation, and shared upkeep bar.

Primary routes:

- `/` and `/battle` render the battle view.
- `/build` renders tower assembly.
- `/research` renders the research tree.
- `/city` renders the hex city view.
- `/statistics` renders statistics charts.

State is managed with Redux Toolkit in `src/store`. The root reducer uses `combineSlices`, with domain slices under folders such as `src/store/city` and `src/store/upkeep`.

Domain definitions live mostly in `src/models` and `src/data`. Battle runtime logic is split into models plus page-local systems under `src/pages/Battle`, including world state, factories, spawning, aiming, firing, movement, projectiles, health bars, and Pixi synchronization.

Styling uses vanilla-extract `*.css.ts` files colocated with pages/components. Theme tokens are defined in `src/theme/theme.css.ts`, with runtime theme selection through `src/theme/ThemeProvider.tsx`.

`docs/project_spec.md` contains the most complete product and architecture notes. Keep it in sync when making significant structural or gameplay changes.

## Important Directories

- `src/pages` - top-level routed page experiences: Battle, Build, City, Research, and Statistics.
- `src/pages/Battle` - Pixi/canvas battle feature code, organized into `assets`, `build`, `core`, `factories`, `keywords`, `spawn`, `systems`, and `ui`.
- `src/pages/City/Components` - city hex rendering and helper logic.
- `src/pages/Research/Components` - research tree node components.
- `src/components` - shared UI components, currently including the upkeep bar.
- `src/store` - Redux store setup, root reducer, typed hooks, slices, and selectors.
- `src/models` - TypeScript domain models for city, battle, research, sprites, themes, and upkeep.
- `src/data` - static gameplay data and constants.
- `src/theme` - vanilla-extract theme contract, theme values, and theme provider.
- `src/styles` - global vanilla-extract styles only.
- `src/assets` - bundled image assets, including city/building art.
- `docs` - project specifications and design notes.
- `public` - static Vite public assets.

## Build and Test Commands

Use npm. The lockfile is `package-lock.json`, so prefer `npm ci` for clean installs.

- `npm run dev` - start the Vite development server.
- `npm run build` - run TypeScript build checks with `tsc -b`, then create a Vite production build.
- `npm run lint` - run ESLint over the repository.
- `npm run preview` - preview the production build locally.

There is no formal unit test command or test framework configured yet. For behavior changes, run at least `npm run lint` and `npm run build` when practical. For visual/frontend work, also inspect the affected page in the browser.

## Coding Conventions

- Use TypeScript and React function components.
- Keep page-specific code under the relevant `src/pages/<PageName>` folder.
- Keep shared, reusable UI in `src/components`.
- Keep domain types and data outside React components when they are not view-specific.
- Use Redux Toolkit slices for shared app state. Add selectors beside the slice when derived data is needed.
- Import local TypeScript modules with explicit `.ts`/`.tsx` extensions, matching the existing code and `allowImportingTsExtensions` setting.
- Preserve the existing semicolon-light style unless editing a nearby block that already uses semicolons consistently.
- Prefer typed data models and small pure helpers for gameplay/math logic.
- Keep Pixi rendering synchronization and per-frame battle systems separated from React UI where possible.
- Use `vars` from `src/theme/theme.css.ts` for themed colors instead of hardcoding page palettes.

## Styling Conventions

- Use vanilla-extract `*.css.ts` files for component and page styling.
- Colocate styles with the component/page they style.
- Put global tag styles only in `src/styles/global.css.ts`.
- Do not introduce new raw component/page CSS files. A legacy `StatisticsPage.css` exists, but new styling should use `*.css.ts`.
- Prefer separate exported class names for sub-elements instead of descendant selectors.
- Avoid descendant selectors such as `& a` or `& select`.
- Allowed selector patterns include self selectors/pseudo-classes like `&:hover` and explicit parent scoping such as `${parent} &`.
- Use theme tokens from `vars.color.*` for colors, borders, focus states, surfaces, and text.

## Constraints and Preferences

- Do not modify generated or dependency folders such as `node_modules` or `dist`.
- Keep changes narrowly scoped to the requested feature or fix.
- Do not revert unrelated work in a dirty working tree.
- Preserve existing assets unless the task specifically calls for asset changes.
- This is currently a frontend-only prototype with no backend and no persistence policy beyond future notes in the spec.
- Node.js 18 or newer is expected because of Vite 7 and the current toolchain.
- TypeScript is strict: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports` are enabled.
- When adding new routes, update both `src/App.tsx` routing and navigation.
- When adding new themes, update theme names/models, `theme.css.ts`, and any manual theme switcher UI that should expose them.
- When changing architecture, gameplay scope, or major conventions, update `docs/project_spec.md` as part of that change.

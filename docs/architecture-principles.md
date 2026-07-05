# Best Idle Game Ever 2 - Architecture Principles

Last updated: 2026-06-24

This document captures the architectural decisions that should survive even if the project moves from the current browser prototype to another engine such as Unreal.

The current React/Pixi app is a prototype shell. The most valuable technical asset is the game schema: data shapes, value names, resolution rules, unlock contracts, and the high-level interactions between city, research, towers, walls, global events, and combat.

## Core Principle

The game should be data-first and system-driven.

Content should say what exists and what it contributes. Systems should resolve those contributions through shared rules.

The preferred direction is:

- Data defines buildings, research, wall segments, wall superstructures, tower parts, enemies, global events, and global modifiers.
- Typed factories normalize that data into domain objects.
- Shared requirement and value-resolution rules decide visibility, unlocks, upkeep, stats, pressure, and derived values.
- UI and rendering consume resolved state; they should not become the source of gameplay truth.

## Portable Core

If the project moves to Unreal, preserve these pieces first:

- `src/data`: progression catalogs, balance values, content IDs, vector grouping, and static definitions.
- `src/data/homogeneousValues/index.ts`: the value vocabulary, display methods, initial values, and special resolution methods.
- `src/models/homogeneousValues.ts`: the shared shape for values, modifiers, roles, and adjacency rules.
- `src/models/homogeneousValueResolution.ts`: the rules for turning content contributions into resolved city/tower/wall/research values.
- `src/models/progression/requirements.ts`: the requirement vocabulary used by research, build visibility, and unlock gates.
- `src/models/battle/resolveTowerAssembly.ts`: the contract for assembling modular tower parts into stats, warnings, keywords, support cost, and homogeneous values.
- `src/store/*/selectors.ts`: the high-level interaction architecture, especially where city, tower, research, wall, unlock, global event, and upkeep state are resolved together.
- `docs`: design intent and mechanic explanations.

The least portable pieces are React components, routing, vanilla-extract styles, Redux Toolkit implementation details, Pixi display objects, and Vite configuration. These are useful as reference, not as engine-level assets.

## Content Data Pipeline

Current content flows through vector-keyed JSON catalogs and typed factories.

Implemented content families:

- Buildings: `src/data/buildings/<vector>.json`
- Research: `src/data/research/<vector>.json`
- Tower parts: `src/data/gunParts/<vector>.json`
- Wall segments: `src/data/wallSegments/<vector>.json`
- Wall superstructures: `src/data/wallSuperstructures/<vector>.json`
- Enemies: `src/data/enemies/*.json`
- Global events: `src/data/globalEvents/events.json`
- Global modifiers: `src/data/globalModifiers/modifiers.json`

Factories add stable defaults and normalize raw JSON into domain objects:

- Buildings and superstructures use `createBuildingFactory`.
- Research uses `createTechnologyFactory`.
- Tower parts use `createTowerPartFactory`.
- Wall content uses wall segment and wall superstructure factories.

The data pipeline should stay engine-neutral. In Unreal, these catalogs could become Data Tables, Data Assets, Primary Data Assets, or imported JSON, but the content vocabulary should remain stable.

## Homogeneous Values

Homogeneous values are the shared stat/resource/effect layer.

They are used for:

- resource production and upkeep;
- unlock requirements;
- city signature, territory, and footprint;
- monster and siege modifiers;
- wall resilience and wall zone effects;
- tower stats such as shots per second, damage, range, spread, rotation limits, and weight;
- derived nature balance values.

Each contribution has:

- a `valueId`;
- role keywords such as `production`, `upkeep`, or `unlock`;
- optional additive and multiplier values;
- optional keyword additions/removals.

Resolution rules:

- Contributions are grouped by value ID and role.
- Production uses the value definition's resolution method: `sum`, `minimum`, or `maximum`.
- Upkeep and unlock values are additive after multiplier application.
- `availableValue = producedValue - upkeepValue`.
- `unlockSatisfied = producedValue >= unlockRequiredValue`.
- Derived values are resolved after direct values, then explicit derived contributions can be applied.
- Rounding is controlled by each value definition.

This is the central rule system to preserve during an engine migration.

## Requirements

Requirements are the shared gate language.

Current requirement types include:

- building keyword exists;
- building exists;
- technology unlocked;
- global flag exists;
- global flag missing;
- homogeneous value at least;
- homogeneous value less than.

Requirements are used for research, build visibility, build validation, and future global event gates. New systems should prefer extending this requirement vocabulary instead of creating isolated gate logic.

## Keywords And Modifiers

Keywords are the connective tissue between content and systems.

They describe vector identity, entity kind, role, slot, resource family, display behavior, targeting behavior, and modifier eligibility.

Modifier rules can:

- target entities by required or forbidden building keywords;
- target value contributions by required or forbidden value keywords;
- add or remove effective building keywords;
- add flat values;
- multiply values;
- act locally, by adjacency radius, or globally.

The resolver iterates keyword effects until stable. This allows a building, tower, technology, or global modifier to alter how other content is classified before values are resolved.

## System Interaction Architecture

The high-level interaction model is:

1. City hexes, walls, researched technologies, towers, and global modifiers are converted to homogeneous entities.
2. The homogeneous resolver produces effective keywords, matched rules, resolved contributions, and final values.
3. City selectors compute support, upkeep, signature, controlled territory, footprint, and build availability.
4. Tower selectors assemble tower parts, then city-aware selectors apply wall/city/research/global modifiers back onto tower stats.
5. Wall selectors resolve wall segment and wall superstructure effects into wall resilience, suppression, pushback, and zone damage.
6. Research and unlock selectors use requirements plus resolved city state to decide visible, unlockable, and purchased content.
7. Battle consumes resolved tower, wall, enemy, and siege values.

This keeps interaction rules centralized. Page components should present choices and resolved outcomes, not duplicate the resolver.

## State Boundaries

Redux currently stores player state and editor/runtime choices. Selectors derive most gameplay behavior.

Important slices:

- `city`: hexes, placed buildings, wall layers, battlefield shape, city footprint, and structures.
- `research`: purchased technologies.
- `towers`: available tower builds and active draft assembly.
- `wall`: wall construction state.
- `upkeep`: controlled territory and last siege signature.
- `unlocks`: discovered buildings, tower parts, wall segments, and wall superstructures.
- `globalEvents`: active flags/events/modifiers.
- `debug`: debug route visibility.

In Unreal, these slice shapes can inform SaveGame objects, subsystem state, and player progression structs. The Redux implementation itself should not be preserved as architecture.

## IDs And Vocabulary

Stable IDs are part of the design asset.

Preserve:

- content IDs;
- value IDs;
- requirement type names;
- vector keys: `tech`, `nature`, `medieval`, `aether`;
- tower slot names;
- keyword names where they are used as rule contracts.

Changing IDs casually makes content harder to migrate, breaks saved state, and weakens audit tooling.

## Current Implementation Status

As of 2026-06-24:

- The browser app uses React, TypeScript, Redux Toolkit, vanilla-extract, Vite, React Router hash routing, and Pixi.js.
- Main player routes are Battle, Tower, Research, City, and History.
- Debug routes include Progression, IDs, Entity Create, Gun Part Editor, and Global Events.
- Content is already largely data-driven for buildings, research, towers, walls, enemies, events, and modifiers.
- Homogeneous value resolution is implemented and used by city, towers, walls, research/global modifiers, upkeep, unlocks, and battle-adjacent state.
- No backend or persistence policy is implemented yet.

## Design Rule

When adding a feature, first ask:

> Can this be expressed as data plus a shared resolver rule?

If yes, prefer that over page-specific logic.

If no, define the new system boundary clearly and keep its output compatible with the shared value, requirement, keyword, and ID vocabulary.

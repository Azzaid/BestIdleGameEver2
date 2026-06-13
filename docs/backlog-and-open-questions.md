# Best Idle Game Ever 2 — Backlog and Open Questions

## Purpose of this document

This document collects:

- unresolved questions;
- risky assumptions;
- experimental ideas;
- future mechanics;
- design concerns.

This is intentionally not a polished design document.

Its purpose is to preserve thinking.

Many ideas may later be rejected.

That is acceptable.

A documented bad idea is more useful than a forgotten good idea.

---

# Status Legend

## Solved

A decision exists.

Implementation may not exist yet.

---

## Open

The design direction is known.

Details remain unresolved.

---

## Experimental

Interesting idea.

Needs testing.

---

## Dangerous

May threaten the project.

Requires special attention.

---

# Core Identity

## Open

What is the final title of the game?

Current working title:

Best Idle Game Ever 2

This is useful internally but probably not the final name.

---

## Open

What should the world call Threat?

Current candidates:

- Threat
- Visibility
- Attention
- Danger
- Challenge
- Exposure
- Disturbance

Requirements:

- understandable;
- fits both city and combat;
- works in UI.

---

# City Building

## Solved

Hexagonal grid.

---

## Solved

Expansion generates Threat.

---

## Solved

Buildings produce Support instead of traditional resources.

---

## Open

How large should cities become?

Possible options:

Small:
30–60 hexes

Medium:
100–150 hexes

Large:
200+ hexes

Need prototyping.

---

## Open

Should city shape matter mechanically?

Possibilities:

- perimeter length;
- wall efficiency;
- district efficiency.

Currently undecided.

---

# Threat

## Solved

Threat drives attacks.

---

## Solved

Threat blocks expansion.

---

## Solved

Threat can block research.

---

## Open

Exact Threat formula.

Current sources:

- city size;
- buildings;
- megastructures.

Need balancing.

---

## Open

Should Threat decay naturally?

Possible answers:

No.

Very slowly.

Region dependent.

Needs testing.

---

# Support Economy

## Solved

Support replaces traditional resource accumulation.

---

## Solved

Support can go negative.

---

## Solved

Existing buildings continue functioning during deficits.

---

## Open

Should deficits have soft penalties?

Possible examples:

- reduced efficiency;
- crisis acceleration;
- slower research.

---

## Open

Should support storage exist at all?

Current leaning:

No.

But emergency reserves may be interesting.

---

# Combat

## Solved

Wall has no HP.

---

## Solved

Wall uses Load.

---

## Solved

Containment Level is earned through combat.

---

## Solved

Combat appears as modal overlay.

---

## Open

Combat duration.

Questions:

- fixed time?
- dynamic time?
- wave count based?

Needs testing.

---

## Open

How visible should tower logic be?

Possibilities:

- detailed logic tree;
- simple behavior summary;
- both.

---

## Experimental

Replay Mode.

After combat:

Show why enemies were prioritized.

Potentially useful.

---

# Towers

## Solved

Tower built from components.

---

## Solved

Maximum five towers.

---

## Solved

Components consume Support.

---

## Open

Final slot list.

Current candidates:

- Weapon
- Ammo
- Loader
- Targeting
- Utility
- Special

May expand.

---

## Open

Can towers share components?

Example:

One targeting computer controlling several towers.

Interesting but adds complexity.

---

## Experimental

Tower blueprints.

Save favorite designs.

Potentially useful.

---

# Multistructures

## Solved

Core + Satellites model.

---

## Solved

Manual upgrade.

---

## Solved

Blob-shaped structures allowed.

---

## Solved

No strict shape requirements.

---

## Open

Maximum size.

Questions:

- 3 hexes?
- 5 hexes?
- 10+ hexes?

Need content planning.

---

## Open

Should satellites remain visible?

Possible approaches:

Hide completely.

Remain visible.

Hybrid visual approach.

---

## Experimental

Regional multistructures.

Special districts available only in specific regions.

Looks promising.

---

# Research

## Solved

Research unlocked by infrastructure.

---

## Solved

Research uses building requirements.

---

## Solved

Research uses containment requirements.

---

## Open

Should research require time?

Options:

Instant.

Short delay.

Long projects.

This decision affects pacing heavily.

---

## Dangerous

Research becoming too large.

The tree may eventually contain hundreds of technologies.

Need filtering tools.

---

# Regions

## Solved

Regions have modifiers.

---

## Solved

Regions define enemy ecosystems.

---

## Solved

Regions encourage migration.

---

## Open

How many region archetypes are needed for release?

Rough estimate:

10–20.

Needs planning.

---

## Experimental

Region evolution.

Example:

Industrialization changes local modifiers.

Interesting but potentially expensive.

---

# Crises

## Solved

Crises mostly affect other vectors.

---

## Solved

Crises encourage synergy.

---

## Open

Crisis frequency.

Need balance testing.

---

## Open

Can multiple crises coexist?

Likely yes.

Need UI support.

---

## Experimental

Regional crises.

Seems promising.

---

# Migration

## Solved

Nomad path.

---

## Solved

Colonizer path.

---

## Solved

Specialist bonuses.

---

## Solved

Capital system.

---

## Open

Maximum city count.

Possible limits:

Soft limit.

Hard limit.

No limit.

Need testing.

---

## Open

How visible should abandoned cities remain?

Options:

Map markers.

Historical records.

Full revisit support.

Undecided.

---

# Endings

## Solved

Endings are megaprojects.

---

## Solved

Each vector receives unique endings.

---

## Solved

True Ending repairs the world.

---

## Open

How many endings for release?

Current estimate:

8–12.

---

## Open

Can endings coexist?

Example:

Empire
+
Planetary Restoration

Interesting question.

---

## Experimental

Secret endings.

Strong thematic potential.

---

# Content Scale

## Dangerous

Content explosion.

This project naturally encourages:

- more buildings;
- more technologies;
- more tower components.

Need content discipline.

---

## Dangerous

Balancing.

The game intentionally allows:

- broken builds;
- strange synergies.

Need to decide how much imbalance is acceptable.

---

## Dangerous

Analysis paralysis.

Too many choices may overwhelm players.

Need strong UI.

---

# Lore

## Open

Who exactly are the survivors?

Current concept:

Near-immortal augmented humans.

Could evolve.

---

## Open

What caused the collapse?

Current answer:

Deliberately vague.

May remain mysterious.

---

## Open

How much narrative should exist?

Minimal?

Moderate?

Heavy?

Needs decision.

---

# Technical Risks

## Dangerous

Large save files.

Many cities.

Many buildings.

Need efficient save format.

---

## Dangerous

Content maintenance.

Without data-driven systems content creation will become impossible.

---

## Dangerous

Performance.

Late-game:

- many cities;
- many structures;
- many tower effects.

Need scalable architecture.

---

# Future Features

## Experimental

Trade routes.

---

## Experimental

City governors.

---

## Experimental

Factions.

---

## Experimental

Wandering traders.

---

## Experimental

Weather systems.

---

## Experimental

Seasonal cycles.

---

## Experimental

Ancient ruins exploration.

---

## Experimental

Rare world events.

---

# Questions To Revisit After Prototype

1. Is combat fun to watch?
2. Is Threat understandable?
3. Is Support intuitive?
4. Are multistructures satisfying?
5. Are migrations frequent enough?
6. Are crises meaningful?
7. Is tower construction deep enough?
8. Are endings motivating?
9. Is there enough incentive to mix vectors?
10. Is city planning interesting after 20+ hours?

---

# Prototype Success Criteria

The prototype succeeds if:

- building cities feels good;
- combat validates planning;
- players naturally understand Threat;
- support economy feels different;
- multistructures are exciting;
- migration feels meaningful;
- at least two radically different strategies are viable.

Everything else can be improved later.

---

# Design North Star

Do not optimize for balance.

Do not optimize for realism.

Optimize for interesting decisions.

Whenever two solutions are possible:

Choose the one that creates a better story and a more interesting city.
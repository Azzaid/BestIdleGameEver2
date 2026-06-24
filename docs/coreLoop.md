# Best Idle Game Ever 2 — Core Gameplay Loop

## Purpose of this document

This document describes the gameplay loops that drive the game.

Every mechanic in the game should support at least one of these loops.

If a mechanic does not strengthen any loop, it probably should not exist.

Current implementation note, 2026-06-24:

- The current prototype implements the city, research, tower design, wall, battle, upkeep/signature, unlock, global event, and statistics surfaces.
- Migration, colonies, capitals, regional travel, crises as full systems, endings, and megaprojects remain design-direction material unless represented as data stubs or global-event experiments.
- The practical implemented loop is: place city/wall content, resolve support and signature, unlock research/content, assemble towers, trigger siege when signature exceeds controlled territory, fight in Battle, then expand controlled territory.

---

# Primary Loop

The entire game is built around a repeating cycle.

1. Build city
2. Increase support
3. Unlock research
4. Improve towers
5. Increase threat
6. Fight attack
7. Gain containment level
8. Expand city
9. Repeat

Diagram:

Build
↓
Support
↓
Research
↓
Tower
↓
Threat
↓
Battle
↓
Containment
↓
Expansion
↓
Build

The player should naturally move through this cycle without explicit instructions.

---

# City Development Loop

The city is the engine that powers everything.

Loop:

Build structures
↓
Generate support
↓
Unlock stronger structures
↓
Generate more support
↓
Create larger city
↓
Generate more threat
↓
Need stronger defense
↓
Build structures

This loop exists from the first minute until the ending.

---

# Threat Loop

Threat is the balancing force.

Without threat the player would simply expand forever.

Loop:

More city
↓
More threat
↓
Stronger attacks
↓
Need stronger defense
↓
Need stronger city
↓
More city

Threat converts growth into challenge.

---

# Research Loop

Research transforms support into options.

Loop:

Build prerequisite structures
↓
Unlock research
↓
Gain new buildings
↓
Gain new support
↓
Unlock more research

Research should never feel disconnected from the city.

Buildings unlock science.

Science unlocks buildings.

---

# Tower Design Loop

The tower is the player's main toy.

Loop:

Gain new components
↓
Create new build
↓
Test build in combat
↓
Identify weakness
↓
Modify build
↓
Test again

This loop is the closest thing the game has to character progression.

---

# Combat Validation Loop

Combat exists to validate planning.

Loop:

Plan
↓
Build
↓
Fight
↓
Observe
↓
Improve
↓
Fight again

The player should learn something after every battle.

Even victory should reveal weaknesses.

---

# Expansion Loop

Expansion is intentionally dangerous.

Loop:

Reach containment target
↓
Expand city
↓
Gain land
↓
Build more structures
↓
Generate more threat
↓
Need higher containment

Expansion is never free.

---

# Multistructure Loop

Multistructures create city-building puzzles.

Loop:

Build structures
↓
Create adjacency
↓
Unlock multistructure
↓
Gain unique bonuses
↓
Increase threat
↓
Need stronger city

The player should constantly search for better layouts.

---

# Crisis Loop

Specialization creates problems.

Loop:

Focus one vector
↓
Create crisis
↓
Need another vector
↓
Gain synergy
↓
Enable stronger specialization

The goal is to encourage hybrid cities.

---

# Regional Loop

Different locations create different problems.

Loop:

Enter region
↓
Discover modifiers
↓
Adapt build
↓
Reach limit
↓
Move to new region

This keeps the game from becoming solved permanently.

---

# Nomad Loop

The migration-focused strategy.

Build city
↓
Extract specialists
↓
Abandon city
↓
Start stronger city
↓
Extract more specialists

The player concentrates knowledge into one settlement.

---

# Colonizer Loop

The empire-focused strategy.

Build city
↓
Keep city alive
↓
Create colony
↓
Send support to capital
↓
Strengthen capital
↓
Create more colonies

The player builds a network instead of abandoning settlements.

---

# Capital Loop

A special loop unique to empire play.

Create capital
↓
Receive imports
↓
Build megaprojects
↓
Need more imports
↓
Create colonies

The capital becomes a late-game sink for resources.

---

# Ending Loop

The final loop.

Reach requirements
↓
Begin megaproject
↓
Defend city
↓
Complete project
↓
Win

Every ending follows this pattern.

The difference is the requirements.

---

# System Interaction Matrix

City → Support
Support → Research
Research → Buildings
Buildings → Threat
Threat → Combat
Combat → Containment
Containment → Expansion
Expansion → City

This is the core engine of the game.

Breaking this cycle should be done carefully.

---

# Design Rule

Whenever a new mechanic is proposed:

1. Which loop does it belong to?
2. What problem does it solve?
3. What decision does it create?
4. Which other loop does it interact with?

If these questions cannot be answered, the mechanic probably should not be added.

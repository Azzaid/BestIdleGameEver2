# Best Idle Game Ever 2 — Multistructures

## Purpose of this document

This document describes the Multistructure system.

Multistructures are one of the most important mechanics in the entire project.

They are intended to become:

- the primary city-building puzzle;
- the main source of unique building combinations;
- a major research unlock mechanism;
- a source of city identity.

The goal is to make city planning feel creative rather than procedural.

---

# Core Philosophy

Most city builders use one of two approaches.

## Approach 1

Every building exists independently.

Example:

Farm
Farm
Farm
Farm

This is easy to understand but becomes repetitive.

---

## Approach 2

Buildings upgrade directly.

Example:

Farm I
↓
Farm II
↓
Farm III

This creates progression but often removes spatial planning.

---

# Multistructure Approach

This project uses a third approach.

Buildings combine into larger systems.

A Farm does not become a better Farm.

Instead:

A Farm +
A Warehouse +
A Mill

becomes

Agricultural Complex.

The city evolves through composition.

---

# Design Goals

Multistructures should:

- reward planning;
- create recognizable districts;
- unlock unique research;
- increase city identity;
- support different playstyles;
- generate meaningful tradeoffs.

---

# Core Rule

Multistructures never appear automatically.

The player must intentionally create them.

This avoids confusion.

The player always understands what happened.

---

# Structure Core

Every multistructure has a Core.

Examples:

Warehouse
Library
Factory
Temple
Town Hall

The Core determines:

- visual identity;
- upgrade path;
- research unlocks;
- future evolution.

---

# Satellite Buildings

The Core requires nearby support structures.

Example:

Warehouse

requires:

- Farm
- Mill

to become

Agricultural Hub.

---

# Why Satellites Exist

Without satellites:

The player upgrades buildings directly.

With satellites:

The player designs districts.

The city becomes a puzzle.

---

# Adjacency Requirement

Buildings must be adjacent to the Core.

Not adjacent to each other.

This rule is extremely important.

It simplifies everything.

---

# Why Not Fixed Shapes

Many games require exact patterns.

Example:

X
O
X

X
O
X

This creates problems.

Players spend more time fighting geometry than making decisions.

---

# Blob Philosophy

Multistructures should allow "blobs."

As long as required buildings touch the Core:

the structure works.

Example:

      Farm

Mill  Warehouse

This is valid.

So is:

Farm  Warehouse  Mill

Both produce the same result.

---

# Benefits of Blob Design

Advantages:

- easier to explain;
- easier to implement;
- more player freedom;
- fewer frustrating layouts;
- organic city appearance.

---

# Visual Integration

Although the original buildings are consumed by the upgrade,

visually they become one structure.

Implementation direction:

- the core hex owns the multistructure gameplay identity;
- every part stores the multistructure id and a pointer to the core hex;
- selection, adjacency, economy, signature, and research checks resolve structure parts through the core;
- each part may store its own sprite id so the structure can become visually integrated without duplicating gameplay effects.

The player sees:

One District

instead of

Three Buildings.

---

# Visual Goals

The player should immediately recognize:

- Industrial District
- Research Campus
- Arcane Complex
- Agricultural Network
- Military Compound

from appearance alone.

---

# Manual Upgrade Process

Example:

Step 1

Build Warehouse.

Step 2

Build Farm.

Step 3

Build Mill.

Step 4

Select Warehouse.

Step 5

"Upgrade to Agricultural Hub"

appears.

Step 6

Player confirms.

Multistructure created.

Current prototype behavior:

- selecting a core tile shows possible multistructure candidates;
- complete candidates show a Transform action;
- incomplete candidates show connected and missing adjacent buildings;
- transformation is blocked during sieges;
- after transformation, the core and matched satellites store the multistructure id and the core hex key;
- research checks the built multistructure id from the linked structure rather than merely possible layouts.

---

# Why Manual Creation Exists

Automatic upgrades create confusion.

Example:

Player places building.

Suddenly everything transforms.

Player asks:

"What happened?"

Manual activation removes this problem.

---

# Upgrade Tiers

Multistructures may evolve.

Example:

Agricultural Hub
↓
Agricultural District
↓
Agricultural Province

Each tier requires:

- additional satellites;
- additional support;
- additional threat.

---

# Threat Cost

Multistructures should not be free.

They concentrate activity.

Therefore they generate additional Threat.

Examples:

Research Campus

+ Knowledge
+ Threat

Industrial Complex

+ Production
+ Large Threat

---

# Why Threat Is Important

Without Threat:

The optimal strategy becomes:

Convert everything into multistructures.

This removes choice.

Threat prevents that.

---

# Strategic Tradeoff

Normal Buildings:

- flexible;
- low threat;
- easy to place.

Multistructures:

- powerful;
- efficient;
- high threat.

Both remain useful.

---

# Research Unlocks

Many technologies require multistructures.

Example:

Advanced Genetics

requires:

Bio Research Campus

Temporal Mechanics

requires:

Quantum Laboratory Complex

This makes city planning part of the research system.

---

# Building Trees

Every Core can have its own upgrade tree.

Example:

Library

↓

Archive

↓

Knowledge District

↓

Great Academy

↓

World Repository

This creates long-term progression.

---

# Cross-Vector Structures

Some multistructures require multiple vectors.

Example:

Tech Laboratory
+
Temple

=

Arcane Computing Center

These structures encourage synergy.

---

# Why Cross-Vector Structures Matter

They solve a common problem.

Without them:

Players specialize.

With them:

Players experiment.

---

# District Identity

Each district should have a clear purpose.

Examples:

Agriculture

Food production.

Industry

Support production.

Research

Knowledge generation.

Military

Defense.

Arcane

Mana systems.

Nature

Threat reduction.

---

# Rare Structures

Some structures should be difficult to build.

Requirements may include:

- specific terrain;
- specific technologies;
- specific containment levels.

These become prestige projects.

---

# Regional Structures

Certain regions may unlock unique districts.

Example:

Volcanic Region

Magma Forge

Forest Region

World Grove

Arcane Region

Reality Observatory

This makes regions memorable.

---

# Capital Structures

Some multistructures should only exist in the Capital.

Examples:

Imperial Palace

World Congress

Grand Archive

Planetary Command

These help differentiate Capitals from ordinary cities.

---

# Ending Structures

Most endings should require at least one unique multistructure.

Examples:

Temporal Shift Barrier

World Brain

Ascension Nexus

Imperial Core

Planetary Restoration Network

This ties city-building directly into victory.

---

# Technical Simplification

The actual implementation should remain simple.

Recommended logic:

1. Select Core.
2. Check adjacent buildings.
3. Compare requirements.
4. Show available upgrades.
5. Upgrade if player confirms.

No continuous scanning required.

No complex shape detection required.

No pattern matching nightmares.

---

# Future Expansion

New multistructures should be easy to add.

A structure definition should contain:

Core Building

Required Satellites

Threat Modifier

Visual Set

Unlocked Research

Unlocked Upgrades

Special Effects

This allows content expansion without rewriting systems.

---

# Design Rules

Whenever a new multistructure is proposed:

1. Does it create a meaningful city-planning decision?
2. Does it have a clear identity?
3. Does it generate appropriate Threat?
4. Does it unlock something interesting?
5. Does it compete with normal buildings?

If not, it probably should not become a multistructure.

---

# Design North Star

A city should not look like:

Building
Building
Building
Building

It should look like:

District
District
District
Infrastructure
Megaproject

The player is not placing objects.

The player is shaping a civilization.

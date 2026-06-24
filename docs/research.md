# Best Idle Game Ever 2 — Research

## Purpose of this document

This document describes the Research system.

Research is not merely a progression mechanic.

Research is one of the primary ways players express strategic direction.

Research determines:

- which buildings can exist;
- which towers can be designed;
- which multistructures can be created;
- which endings become possible.

Current implementation note, 2026-06-24:

- Research data lives in vector-keyed JSON files under `src/data/research`.
- `createTechnologyFactory` normalizes raw technology definitions into `ResearchNodeData`.
- Purchased technologies are stored in the research slice, then exposed as homogeneous entities so their values and global modifier effects participate in the same resolver as buildings, towers, and walls.
- Research currently supports technology prerequisites, additional requirements, unlock lists, required buildings, required structures, required free upkeep, required aether atmosphere, required biodiversity, homogeneous value gates, and notes.
- The visible research page is backed by `researchTree` and vector atlases; debug progression tools derive graph/audit views from the same data.

---

# Core Philosophy

Most strategy games use:

Research Points
↓
Technology

This project uses:

Infrastructure
↓
Technology

The player does not buy knowledge.

The player creates the conditions necessary for knowledge to emerge.

---

# Design Goals

Research should:

- encourage city planning;
- reward specialization;
- reward experimentation;
- integrate with buildings;
- integrate with multistructures;
- create long-term goals;
- avoid passive accumulation.

---

# Research Philosophy

A civilization does not discover advanced genetics because it accumulated enough points.

It discovers advanced genetics because it built:

- laboratories;
- archives;
- bio-complexes;
- research communities.

Knowledge emerges from infrastructure.

---

# Research as Capability

Research represents capability.

Not currency.

Not progress bars.

Capability.

The city gains access to new possibilities because it became capable of supporting them.

---

# Research Loop

Build Infrastructure
↓
Unlock Technology
↓
Unlock New Buildings
↓
Create Better Infrastructure
↓
Unlock New Technology

Research and construction continuously feed each other.

---

# Current Prototype Behavior

Research unlocks are automatic.

When the city satisfies a technology's prerequisite technologies, required buildings, built multistructures, upkeep, Aether atmosphere, biodiversity, and siege-state checks, the technology is purchased immediately by the app.

The research tree therefore acts as a capability map rather than a purchase screen:

- locked nodes explain missing requirements;
- ready nodes show that they are unlocking;
- completed nodes show as researched;
- newly unlocked technologies create notifications.

While the city is besieged, technologies do not auto-unlock.

---

# Research Requirements

Technologies primarily require:

- buildings;
- multistructures;
- support capacity;
- containment levels.

Not resource spending.

---

# Example

Advanced Genetics

Requires:

- Bio Laboratory
- Mutagen Production
- Research Campus

Not:

500 Science Points

---

# Why This Approach Exists

Benefits:

- ties science to city building;
- makes infrastructure meaningful;
- encourages planning;
- reduces grind.

The player builds knowledge.

They do not purchase it.

---

# Research Resources

Each vector possesses a dedicated research resource.

These resources represent intellectual capability.

---

## Technology

Research Resource:

Computing Power

Represents:

- simulations;
- processing;
- data analysis.

---

## Medieval

Research Resource:

Gold

Represents:

- patronage;
- institutions;
- craftsmen;
- scholars.

---

## Nature

Research Resource:

Mutagens

Represents:

- experimentation;
- adaptation;
- biological innovation.

---

## Aether

Research Resource:

Ancient Knowledge

Represents:

- lost lore;
- magical understanding;
- arcane traditions.

---

# Why Separate Research Resources Exist

Research resources create identity.

Different civilizations learn differently.

Technology studies.

Nature evolves.

Magic remembers.

Humanity organizes.

---

# Research Categories

Technologies generally belong to one of several categories.

---

# Infrastructure

Unlocks:

- support buildings;
- utility structures;
- logistics.

Examples:

Road Networks

Power Distribution

Water Systems

Mana Conduits

---

# Military

Unlocks:

- weapons;
- defenses;
- combat systems.

Examples:

Ballistics

Siege Engineering

Living Weapons

Reality Cannons

---

# Science

Unlocks:

- advanced production;
- efficiency systems;
- support conversion.

Examples:

Automation

Food Synthesis

Genetic Optimization

Temporal Analysis

---

# Society

Unlocks:

- population systems;
- administration;
- governance.

Examples:

Guilds

Bureaucracy

Civil Service

Imperial Logistics

---

# Special Projects

Unlocks:

- megaprojects;
- endings;
- unique structures.

Examples:

Ascension

World Brain

Temporal Barrier

Ark Program

---

# Technology Tiers

Technologies naturally form tiers.

---

## Tier 1

Simple infrastructure.

Basic support generation.

---

## Tier 2

Districts.

Specialization.

Basic multistructures.

---

## Tier 3

Cross-vector systems.

Advanced support management.

---

## Tier 4

Regional mastery.

Large-scale optimization.

---

## Tier 5

Megaproject preparation.

---

## Tier 6

Ending technologies.

---

# Building-Based Unlocks

Many technologies require specific buildings.

Example:

Automation

Requires:

Factory

Power Plant

Workshop

---

# Multistructure-Based Unlocks

Advanced technologies require districts.

Example:

Quantum Simulation

Requires:

Research Campus

---

# Why Multistructures Matter

This prevents:

Build one lab.
Research everything.

The city must actually evolve.

---

# Containment Requirements

Research may require sufficient Containment.

Example:

Reality Manipulation

Requires:

Containment Level 8

Reason:

The city must survive the consequences.

---

# Threat Restrictions

Threat can block research.

---

# Example

Threat:
12

Containment:
8

Research Locked

Reason:

The city is under too much pressure.

---

# Narrative Justification

People are busy surviving.

Resources are redirected.

Infrastructure is strained.

Research slows down.

---

# Why Threat Blocks Research

Without this system:

Players could ignore combat.

The game would become:

Build Science
↓
Win

Threat keeps science connected to defense.

---

# Research Trees

Each vector has its own tree.

---

# Technology Tree

Focuses on:

- efficiency;
- precision;
- automation;
- engineering.

---

# Medieval Tree

Focuses on:

- population;
- organization;
- logistics;
- leadership.

---

# Nature Tree

Focuses on:

- adaptation;
- sustainability;
- ecosystems;
- biological control.

---

# Aether Tree

Focuses on:

- rituals;
- reality manipulation;
- mana systems;
- transcendence.

---

# Cross-Vector Technologies

Some technologies require multiple vectors.

Examples:

Arcane Computing

Technology + Aether

Bioindustry

Nature + Technology

Living Empire

Nature + Medieval

---

# Why Cross-Vector Technologies Exist

They encourage synergy.

Without them:

Specialization dominates.

With them:

Hybrid play becomes attractive.

---

# Conversion Technologies

Late-game technologies may convert support types.

Examples:

Automation

People → Electricity

Food Synthesizer

Electricity → Biomass

Soul Engine

Mana → People

Bio Reactor

Biomass → Mana

---

# Purpose of Conversion

Not replacement.

Flexibility.

Players gain tools to solve problems.

---

# Research Visibility

Players should always understand:

- what is locked;
- why it is locked;
- what is missing.

The UI should answer:

> What must I build next?

---

# Research Discovery

Some technologies may begin hidden.

The player discovers them by:

- entering regions;
- creating multistructures;
- reaching threat thresholds;
- triggering crises.

This creates exploration.

---

# Regional Technologies

Certain technologies only exist in specific regions.

Example:

Volcanic Engineering

Requires Volcanic Region.

World Grove

Requires Living Forest.

Reality Anchors

Requires Arcane Scar.

---

# Crisis Technologies

Some technologies emerge from problems.

Example:

Pollution Control

Appears after Pollution Crisis.

This makes crises productive rather than purely negative.

---

# Research and Endings

Endings are primarily research goals.

Every ending should require:

- unique technologies;
- unique structures;
- unique city designs.

The player gradually discovers a path to victory.

---

# Why Endings Use Research

Research provides long-term direction.

The player sees the destination years before reaching it.

---

# Future Expansion

The system should support:

- thousands of technologies;
- modular content additions;
- region-specific branches;
- vector-specific branches;
- hidden branches.

Adding content should not require redesigning the framework.

---

# Design Rules

Whenever a new technology is proposed:

1. What does it unlock?
2. What infrastructure enables it?
3. Which vector owns it?
4. What new decisions does it create?
5. Could it be replaced by a building?

If those questions are unclear, the technology probably needs redesign.

---

# Design North Star

Research should not feel like:

> Wait until the number is big enough.

Research should feel like:

> Build the civilization capable of understanding this idea.

# Best Idle Game Ever 2 — Technical Architecture

## Purpose of this document

This document describes the content architecture of the game.

It is not code.

It is a blueprint for future implementation.

The primary goal is:

> Adding content should be easier than creating systems.

The game should eventually contain:

- hundreds of buildings;
- hundreds of technologies;
- hundreds of tower components;
- dozens of regions;
- dozens of crises;
- dozens of endings.

The architecture must support that scale.

---

# Core Philosophy

Systems should be generic.

Content should be data.

Example:

Bad:

Factory has custom code.

Good:

Factory is a Building Definition.

The game engine understands buildings.

Content defines what a building does.

---

# Content Hierarchy

The game consists of:

World
↓
Regions
↓
Cities
↓
Buildings
↓
Multistructures
↓
Support
↓
Research
↓
Tower Components
↓
Combat

Everything should ultimately be represented through data.

---

# Building Definition

Every building should follow a common schema.

---

## Building

```json
{
  "id": "power_plant",
  "name": "Power Plant",
  "vector": "technology",
  "tier": 2,
  "supportProduction": {},
  "supportConsumption": {},
  "researchProduction": {},
  "threat": 12,
  "adjacencyEffects": [],
  "tags": []
}
```

---

# Required Fields

Every building should contain:

- id
- name
- vector
- tier
- threat

Everything else can be optional.

---

# Building Tags

Tags are extremely important.

Example:

```json
[
  "industrial",
  "power",
  "technology"
]
```

Tags should drive most future systems.

---

# Why Tags Matter

Instead of:

If building is Factory

Use:

If building has "industrial"

This makes expansion much easier.

---

# Support Production

Example:

```json
{
  "electricity": 25
}
```

---

# Support Consumption

Example:

```json
{
  "people": 5
}
```

---

# Research Production

Example:

```json
{
  "computing": 10
}
```

---

# Adjacency Definition

Example:

```json
{
  "targetTag": "farm",
  "bonus": 0.25,
  "effect": "biomass"
}
```

Meaning:

Warehouse increases nearby farm biomass production by 25%.

---

# Multistructure Definition

Multistructures should be fully data-driven.

---

## Example

```json
{
  "id": "agricultural_hub",
  "core": "warehouse",
  "requiredBuildings": [
    "farm",
    "mill"
  ]
}
```

---

# Why Core-Based Definitions

The current design uses:

Core
+
Satellite Buildings

This avoids shape complexity.

---

# Multistructure Fields

Recommended:

```json
{
  "id": "",
  "name": "",
  "core": "",
  "requiredBuildings": [],
  "requiredTags": [],
  "threatModifier": 0,
  "visualSet": "",
  "researchUnlocks": [],
  "effects": []
}
```

---

# Upgrade Chains

Multistructures should support evolution.

Example:

```json
Agricultural Hub
↓
Agricultural District
↓
Agricultural Province
```

---

# Region Definition

Regions should be content-driven.

---

## Example

```json
{
  "id": "living_forest",
  "name": "Living Forest"
}
```

---

# Region Fields

```json
{
  "modifiers": [],
  "enemyEcosystem": "",
  "uniqueStructures": [],
  "uniqueTechnologies": [],
  "crises": []
}
```

---

# Region Modifiers

Example:

```json
{
  "target": "biomass",
  "modifier": 0.30
}
```

Meaning:

+30% biomass production.

---

# Enemy Ecosystems

Regions reference enemy pools.

Example:

```json
{
  "enemyEcosystem": "forest"
}
```

The ecosystem controls:

- enemy types;
- visuals;
- encounter themes.

---

# Enemy Definition

Enemies should be data-driven.

---

## Example

```json
{
  "id": "wolf",
  "health": 100,
  "threatValue": 5
}
```

---

# Enemy Fields

```json
{
  "health": 0,
  "speed": 0,
  "threatValue": 0,
  "resistances": {},
  "abilities": [],
  "tags": []
}
```

---

# Why Threat Value Exists

Threat Value directly contributes to Wall Load.

This keeps combat connected to city systems.

---

# Crisis Definition

Crises should also be content-driven.

---

## Example

```json
{
  "id": "pollution"
}
```

---

# Crisis Fields

```json
{
  "trigger": {},
  "effects": [],
  "solutions": []
}
```

---

# Trigger Example

```json
{
  "industrialBuildings": 20
}
```

Meaning:

Activate after 20 industrial buildings.

---

# Solution Example

```json
[
  "forest_sanctuary",
  "purification_plant"
]
```

---

# Technology Definition

Research should be fully data-driven.

---

## Example

```json
{
  "id": "automation"
}
```

---

# Technology Fields

```json
{
  "name": "",
  "vector": "",
  "requirements": [],
  "unlocks": []
}
```

---

# Requirements

Requirements should support:

- buildings;
- multistructures;
- containment;
- technologies.

---

## Example

```json
{
  "building": "factory"
}
```

or

```json
{
  "multistructure": "research_campus"
}
```

---

# Unlock Definitions

Unlocks may include:

- buildings;
- technologies;
- tower components;
- endings.

---

# Tower Component Definition

Tower components should be content-first.

---

## Example

```json
{
  "id": "laser_emitter"
}
```

---

# Component Fields

```json
{
  "slotType": "weapon",
  "vector": "technology",
  "supportCost": {},
  "effects": []
}
```

---

# Slot Types

Possible slot types:

- weapon
- ammunition
- targeting
- loader
- utility
- special

These categories should remain generic.

---

# Targeting Behaviors

Targeting should be data-driven.

---

## Example

```json
{
  "id": "strongest_target"
}
```

---

# Fields

```json
{
  "priority": "highestHealth"
}
```

---

# Endings

Endings should also be data.

---

## Example

```json
{
  "id": "world_brain"
}
```

---

# Ending Fields

```json
{
  "requirements": [],
  "megaproject": "",
  "finalChallenge": ""
}
```

---

# Why Data-Driven Endings

Allows:

- expansion packs;
- new endings;
- hidden endings;
- hybrid endings.

Without engine changes.

---

# City State

The actual save file should mostly contain:

- built structures;
- support allocations;
- researched technologies;
- tower configurations;
- region state.

Everything else can be reconstructed.

---

# Save Philosophy

Prefer:

State

over

History

Example:

Store:

Current Buildings

Do NOT store:

Every building ever placed.

Keeps saves small.

---

# Migration Records

Exception:

Migration history should be preserved.

Examples:

- abandoned cities;
- specialists earned;
- capitals founded.

These contribute to player identity.

---

# Content Pipeline Goal

The ideal future workflow:

Designer adds JSON

↓

Game works

Without code changes.

---

# Why This Matters

The game's biggest risk is content volume.

A data-driven architecture reduces that risk dramatically.

---

# Design North Star

The engine should understand systems.

Content should define the world.

Adding a new building, technology, tower component, crisis or ending should feel like writing data, not writing code.
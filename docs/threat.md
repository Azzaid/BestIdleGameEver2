# Best Idle Game Ever 2 — Threat System

## Purpose of this document

This document describes the Threat system.

Threat is one of the most important mechanics in the game.

Almost every major system interacts with Threat:

- city growth;
- combat;
- research;
- expansion;
- endings;
- migration;
- regional progression.

Threat is the pressure that keeps the game moving.

Without Threat the player would simply build forever.

Current implementation note, 2026-06-24:

- The implemented threat-like pressure is currently named City Signature in code and UI.
- Effective signature is derived from building signature, territory signature, and city footprint.
- Controlled territory is stored in upkeep state. When effective signature exceeds controlled territory, the city becomes besieged outside debug mode.
- Wall values can suppress or reshape battle pressure through resilience, threat suppression, pushback, and zone damage effects.
- The richer regional threat, threat debt, crisis, and migration interactions in this document remain design direction.

---

# Core Philosophy

Threat is the price of civilization.

The more advanced the city becomes:

- the louder it becomes;
- the brighter it becomes;
- the more resources it consumes;
- the more it disturbs the world.

The world notices.

Threat represents that attention.

---

# What Threat Is

Threat is not:

- enemy strength;
- city size;
- military power.

Threat is:

> How noticeable and disruptive the city has become.

A city can be:

- small but extremely threatening;
- huge but surprisingly quiet.

---

# Design Goals

Threat should:

- create pressure;
- encourage adaptation;
- connect city building to combat;
- prevent infinite growth;
- reward efficient design;
- make every expansion meaningful.

---

# Threat Loop

The central loop:

More City
↓
More Threat
↓
More Attacks
↓
Need More Defense
↓
Need Better City
↓
More City

The game should never escape this cycle.

---

# Threat Sources

Threat comes from many places.

This is intentional.

The player should not solve Threat through a single building.

---

# City Size Threat

Every occupied hex generates Threat.

Reason:

A larger city is easier to notice.

Even empty infrastructure creates activity.

---

# Expansion Threat

Expansion creates a large immediate Threat increase.

Why?

The city suddenly occupies more territory.

New roads.

New lights.

New activity.

New noise.

The world notices.

---

# Building Threat

Most buildings generate Threat.

Different categories generate different amounts.

---

# Demolition Footprint

Demolishing a building permanently increases the city's footprint.

Reason:

The building disappears from the city grid, but its rubble, waste, broken machinery, contaminated soil, ritual residue, and other remains must be dragged outside the walls to free usable land.

The cleared hex becomes useful again.

The settlement becomes easier to find.

This creates a direct tradeoff:

- keep obsolete one-shot buildings and lose city space;
- demolish them and permanently raise city footprint.

Early disposable buildings should therefore create long-term pressure. They either occupy precious land or leave a visible footprint on the city when removed.

Demolition footprint is part of the city's persistent local history. It should not naturally decay during the same settlement lifecycle.

Migration is the clean way to escape accumulated demolition footprint.

---

## Technology Threat

Usually high.

Examples:

- power plants;
- factories;
- computation centers;
- reactors.

Reason:

Machines are loud.

Machines produce heat.

Machines consume resources.

---

## Aether Threat

Usually high.

Examples:

- rituals;
- mana wells;
- dimensional anchors;
- summoning circles.

Reason:

Magic disturbs reality.

---

## Medieval Threat

Usually moderate.

Examples:

- markets;
- barracks;
- workshops.

Reason:

Human activity attracts attention.

---

## Nature Threat

Usually low.

Examples:

- farms;
- groves;
- habitats.

Reason:

Nature blends into the environment.

---

# Megastructure Threat

Megaprojects generate enormous Threat.

Examples:

- World Brain;
- Temporal Barrier;
- Ascension Nexus;
- Planetary Restoration Network.

These projects should feel dangerous to construct.

---

# Threat Modifiers

Threat is not fixed.

Many systems can modify it.

Examples:

- technologies;
- regional bonuses;
- terrain openness;
- structures;
- crises.

---

# Terrain Openness

Every settlement site has an Openness value.

Openness represents how exposed the surrounding terrain is.

Examples:

Dense forest:

- low Openness;
- lower visibility multiplier;
- smaller maximum city size.

Open plain:

- high Openness;
- higher visibility multiplier;
- larger maximum city size.

Openness affects two things:

1. maximum possible city size;
2. multiplier applied to the city's visibility/Threat scale.

This makes open terrain attractive but dangerous.

A low-tech settlement usually prefers hidden, cramped terrain.

An advanced civilization with better walls, camouflage, logistics, and containment can exploit larger, more open locations.

---

# Threat Reduction

Some buildings reduce Threat.

Examples:

Technology:

- stealth fields;
- signal suppressors.

Nature:

- ecological restoration.

Aether:

- concealment rituals.

Medieval:

- hidden roads;
- decentralized settlements.

---

# Local vs Global Threat

Threat may exist at two scales.

---

## Global Threat

Used for:

- wave generation;
- progression;
- containment requirements.

Represents the city as a whole.

---

## Local Threat

Used for:

- district design;
- future mechanics;
- regional effects.

Represents specific dangerous areas.

Example:

Industrial Quarter:
+40 Local Threat

Forest District:
+5 Local Threat

---

# Threat and Combat

Threat directly influences combat.

Higher Threat means:

- stronger attacks;
- more enemies;
- rarer enemy types.

Threat does not determine enemy species.

Regions do that.

Threat determines intensity.

---

# Threat and Containment

Containment represents:

> How much Threat the city can safely handle.

Example:

Threat:
4

Containment:
6

Safe

Threat:
7

Containment:
6

Unsafe

The city has outgrown its defenses.

---

# Threat Thresholds

Threat naturally creates progression tiers.

Example:

Threat 1-3

Village Scale

Threat 4-6

Town Scale

Threat 7-10

City Scale

Threat 11-15

Metropolis Scale

Threat 16+

Megaproject Scale

Exact values TBD.

---

# Threat and Research

Threat can block research.

Reason:

People are busy surviving.

Infrastructure is under stress.

Resources are redirected.

---

# Why Research Blocks Exist

Without them:

The player could ignore defense.

They could:

- overexpand;
- ignore combat;
- rush science.

Threat prevents that.

---

# Threat and Expansion

Expansion should require sufficient containment.

Example:

Threat:
8

Containment:
5

Expansion blocked.

Not because the city lacks land.

Because it cannot safely manage additional territory.

---

# Threat Debt

The player may temporarily exceed safe Threat.

This creates interesting situations.

Example:

Containment:
5

Threat:
7

Consequences:

- research blocked;
- expansion beyond the wall-protected hex is blocked only while the city is besieged;
- stronger attacks.

The city still functions: buildings, demolition, tower rebuilding, and wall-protected claims remain available.

The player must recover.

---

# Why Threat Debt Exists

Instant punishment is boring.

Recovery is interesting.

The player should be able to make risky decisions.

---

# Threat Archetypes

Different city styles create different Threat profiles.

---

## Fortress City

High Threat

High Containment

Huge Wall Investment

---

## Hidden Village

Very Low Threat

Minimal Defenses

Relies on obscurity

---

## Industrial Monster

Extreme Threat

Extreme Production

Constant pressure

---

## Living Sanctuary

Low Threat

Nature Focus

Slow Growth

---

## Arcane Beacon

High Threat

Massive Magical Effects

Unstable

---

# Threat and Regions

Different regions react differently.

Example:

Forest Region

Threat grows slowly.

Industrial Wasteland

Threat grows rapidly.

Arcane Scar

Magic buildings generate additional Threat.

This keeps regions unique.

---

# Threat and Crises

High concentration of one vector may create crises.

Examples:

Too much Industry:

Pollution

Too much Aether:

Reality Instability

Too much Nature:

Ecological Overgrowth

Too much Medieval:

Bureaucratic Corruption

Threat may amplify these effects.

---

# Threat and Migration

Migration is one way to reset pressure.

The player may decide:

"This location has become too difficult."

Instead of solving the problem forever:

Move.

The world remains larger than any single city.

---

# Threat and Endings

Every ending represents a solution to Threat.

Examples:

Temporal Barrier

Ignore the world.

World Brain

Control the world.

Ascension

Leave the world.

Hidden Village

Avoid the world.

Empire

Dominate the world.

Planetary Restoration

Heal the world.

---

# Threat as Narrative

Threat is not just a number.

It tells a story.

Low Threat:

The city is quiet.

High Threat:

The city changes the world.

Extreme Threat:

The city becomes impossible to ignore.

---

# UI Representation

Threat should always be visible.

Recommended:

Global Threat Meter

Current Threat

Safe Threat

Containment Margin

Warning States

The player should immediately understand:

How dangerous the city has become.

---

# Future Extensions

Threat could later affect:

- diplomacy;
- wandering traders;
- rare events;
- region evolution;
- monster migration patterns.

The system should remain extensible.

---

# Design Rules

Whenever a new mechanic is proposed:

1. Does it increase Threat?
2. Does it reduce Threat?
3. Does it interact with Threat?
4. Does it create an interesting Threat decision?

If the answer is "none of the above", the mechanic may be disconnected from the core game.

---

# Design North Star

Threat is the heartbeat of the game.

Support enables growth.

Threat challenges growth.

Containment regulates growth.

Everything else exists somewhere inside that triangle.

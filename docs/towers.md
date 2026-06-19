# Best Idle Game Ever 2 — Towers

## Purpose of this document

This document describes the Tower system.

Towers are the primary defensive tool available to the player.

The city exists to support towers.

Combat exists to test towers.

Research exists to improve towers.

While cities create the strategic layer, towers create the tactical layer.

---

# Core Philosophy

The tower is not a building.

The tower is not a unit.

The tower is a machine.

Players do not upgrade towers.

Players design towers.

---

# Design Goals

The tower system should:

- support experimentation;
- create emergent combinations;
- reward creativity;
- support multiple strategies;
- remain understandable;
- scale through content additions.

The player should feel like an engineer.

---

# Tower Philosophy

Many tower defense games use:

Tower Type A
Tower Type B
Tower Type C

This project uses:

Component A
+
Component B
+
Component C

=

New Tower

The player creates the weapon.

---

# Tower Slots

A tower consists of components.

Possible categories:

- Weapon
- Ammunition
- Loader
- Targeting
- Utility
- Special Module

The exact number of slots may change.

The important part is modularity.

---

# Why Components

Components allow:

- huge variety;
- easier content creation;
- cross-vector combinations;
- emergent builds.

One new component can create dozens of new tower configurations.

---

# Support Requirements

Every component consumes Support.

Example:

Laser

Consumes Electricity.

Necrotic Crystal

Consumes Mana.

Beast Handler

Consumes Biomass.

Elite Crew

Consumes People.

The city determines what towers are possible.

---

# Multiple Towers

The player may build up to five towers.

This limit exists for:

- readability;
- performance;
- build diversity.

The goal is not quantity.

The goal is interesting combinations.

---

# Why No Increasing Tower Cost

Many games use:

Tower 1 = Cheap

Tower 2 = Expensive

Tower 3 = Very Expensive

This creates obvious optimal behavior.

Instead:

Tower costs depend on components.

Not on tower count.

---

# Economic Differences

Vector costs differ.

---

## Technology

Expensive

High support requirements.

Reliable.

---

## Medieval

Cheap

Accessible.

Flexible.

---

## Nature

Cheap to moderate.

Support focused.

Sustainable.

---

## Aether

Very expensive.

Powerful.

Rare.

---

# Tower Roles

A tower can fulfill many roles.

Examples:

- DPS
- Control
- Debuff
- Sniper
- Siege
- Support
- Utility

These roles emerge naturally.

Not through class restrictions.

---

# Targeting Philosophy

Targeting is one of the most important systems.

The player should not merely decide:

What weapon fires.

The player should decide:

What weapon fires at what target.

---

# Targeting Components

Targeting behavior is determined by modules.

Accuracy behavior is also part of the tower machine. Projectile radius, projectile spread, and trigger tolerance are tower values that components can tune. Trigger tolerance controls how close the current barrel angle must be to the desired target angle before the tower may fire.

Examples:

Nearest

Farthest

Strongest

Weakest

Highest Threat

Lowest Health

Most Dangerous

No Resistance

Largest Group

---

# Why Targeting Matters

A mediocre weapon with excellent targeting may outperform a powerful weapon with poor targeting.

This creates depth.

---

# Vector Identities

Each vector approaches targeting differently.

---

# Technology

Technology values simplicity and precision.

---

## Characteristics

- accurate;
- predictable;
- efficient.

---

## Typical Targeting

Nearest

Farthest

Strongest

Weakest

Basic tactical logic.

---

## Weakness

Limited flexibility early.

Technology must research advanced behavior.

---

# Medieval

Human operators.

Human intuition.

Human mistakes.

---

## Characteristics

- critical hits;
- randomness;
- adaptation.

---

## Typical Targeting

Closest To Aim

Best Splash Opportunity

Most Valuable Target

Most Enemies Nearby

Humans make judgments.

---

## Weakness

Misses.

Inconsistency.

Human error.

---

# Nature

Instinct.

Predation.

Biological intelligence.

---

## Characteristics

- perfect instinct;
- limited reasoning;
- excellent tracking.

---

## Typical Targeting

Weakest

Bleeding

Poisoned

Isolated

Nature attacks vulnerability.

---

## Weakness

Cannot easily follow player-defined logic.

---

# Aether

Magic values meaning over practicality.

---

## Characteristics

- complex logic;
- absurd priorities;
- powerful effects.

---

## Typical Targeting

Highest Health

Highest Resistance

Lowest Resistance

Most Mana

Most Threat

Most Souls

Most Cursed

Magic seeks significance.

---

## Weakness

Poor basic practicality.

A mage may refuse obvious targets.

---

# Weapon Philosophy

Weapons define how damage is delivered.

Targeting defines where.

Support defines whether it can exist.

---

# Weapon Categories

Possible categories:

- Projectile
- Beam
- Area
- Summon
- Aura
- Curse
- Biological
- Temporal

These categories are independent of vectors.

---

# Example

Laser

Technology Weapon

Technology Targeting

Technology Support

Pure Technology Tower

---

# Example

Laser

Technology Weapon

Nature Targeting

Mana Amplifier

Hybrid Tower

---

# Why Hybrid Towers Matter

The game should reward strange combinations.

Interesting examples:

Technology Weapon
+
Nature Targeting

Aether Weapon
+
Technology Tracking

Medieval Crew
+
Arcane Ammunition

These combinations are the heart of the game.

---

# Damage Philosophy

The game should avoid:

Everything is DPS.

Different vectors should solve problems differently.

---

# Technology Damage

Moderate damage.

High reliability.

Armor penetration.

Resistance bypass.

---

# Medieval Damage

High damage.

Large variance.

Critical hits.

---

# Nature Damage

Damage over time.

Debuffs.

Control.

Attrition.

---

# Aether Damage

Massive impact.

Long cooldowns.

Spectacular effects.

---

# Why Different Damage Models

Different damage models create different city designs.

The player chooses an approach.

Not merely bigger numbers.

---

# Resistance Philosophy

Enemies may have resistances.

The vectors interact differently.

---

## Technology

Often bypasses resistance.

---

## Medieval

Usually suffers against resistance.

---

## Nature

Often ignores conventional resistance.

---

## Aether

May exploit or manipulate resistance.

---

# Cooldowns

Vectors should feel different.

Technology:

Fast.

Steady.

Medieval:

Slow.

Heavy.

Nature:

Moderate.

Persistent.

Aether:

Very slow.

Catastrophic.

---

# Control Effects

Control is a valid strategy.

Examples:

- Slow
- Freeze
- Sleep
- Root
- Fear
- Confusion
- Disease

The player should not be forced into DPS.

---

# Support Towers

Some towers may focus on enabling others.

Examples:

Targeting Relays

Aura Totems

Command Towers

Mana Amplifiers

These towers increase strategic depth.

---

# Unique Aether Restriction

Current concept:

Powerful Aether systems dislike duplication.

Examples:

- one Ascension Tower;
- one Archmage Tower;
- one Reality Anchor.

This creates identity.

Not every strategy should scale through repetition.

---

# Tower Rebuilding

Players may redesign towers.

However:

Major changes trigger combat.

---

# Trigger Conditions

Possible triggers:

- changing two or more components;
- installing rare modules;
- major upgrades.

Lore:

Construction activity attracts attention.

---

# Why Trigger Combat

Prevents exploit behavior.

The player cannot:

1. Build support city.
2. Install temporary components.
3. Unlock everything.
4. Remove components.

The design must survive testing.

---

# Tower Progression

Tower progression should come from:

- new components;
- new combinations;
- new support types;
- new targeting options.

Not merely bigger numbers.

---

# Research Integration

Research primarily unlocks:

- components;
- behaviors;
- support systems.

The player expands possibility space.

Not raw stats.

---

# Future Expansion

New content should mostly be:

Components.

Not new tower classes.

This makes scaling easier.

---

# Design Rules

Whenever a new tower component is proposed:

1. What problem does it solve?
2. Which vector owns it?
3. Which support does it consume?
4. What combinations become possible?
5. Does it create a new strategy?

If not, it is probably redundant.

---

# Design North Star

A player should never ask:

> Which tower should I build?

Instead they should ask:

> What kind of tower do I want to create?

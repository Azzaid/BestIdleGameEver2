# Best Idle Game Ever 2 — Combat

## Purpose of this document

This document describes combat systems.

Combat is not the primary activity of the game.

Combat exists to validate city planning, economic decisions, research choices and tower design.

The player should spend more time preparing for combat than actively fighting.

Current implementation note, 2026-06-24:

- Battle is implemented as a Pixi-backed mode inside the shared City canvas.
- Runtime code is split across world state, asset loading, spawning, aiming, firing, projectile movement, monster movement, lifespan, health, wall load, siege, wall zone effects, UI health bars, and Pixi synchronization under `src/pages/Battle`.
- Battle consumes resolved tower, wall, enemy, and siege state from the shared data/value architecture rather than owning the whole progression model.
- The current trigger model uses city signature versus controlled territory: when effective signature exceeds controlled territory, the city becomes besieged. Siege escalates battle pressure, but research, city building, demolition, tower rebuilding, and migration remain available. Wall-protected territory claims remain available during siege; expansion outside the protected hex is available only when there is no active siege.
- The visible siege meter tracks defeated monster `strengthCost` divided by the precomputed total wave strength budget for the siege. It fills from kills rather than elapsed time.
- Siege wave timing resolves through the `siege.waveTime` homogeneous value, which defaults to `SIEGE_WAVE_INTERVAL_SECONDS`. A siege wave can release when that countdown expires or immediately after all currently spawned enemies are cleared.
- Siege threat advances by `siege.threatStepPercent` each released wave until the target-threat wave has been generated.
- Enemies may define `cloakRange`. Cloaked enemies start transparent, fade in over that distance from the battlefield top, cannot be chosen by tower targeting or single-target tower effects until fully visible, and are immediately revealed inside the wall-distance reveal band defined by the best resolved `tower.detectionRange` among active towers and standalone wall-top defenses. Projectile collision, AOE, wall zones, and tower zones can still harm cloaked enemies.

---

# Design Goals

Combat should:

- validate planning;
- create tension;
- reward preparation;
- support many strategies;
- avoid twitch gameplay;
- remain understandable;
- create memorable stress tests.

Combat should answer one question:

> Is the city capable of containing the danger it creates?

---

# Core Philosophy

The city generates threat.

Threat attracts enemies.

Combat measures whether the city can handle that threat.

The city is not attacked because time passed.

The city is attacked because it became noticeable.

---

# Combat Flow

Combat begins when:

- the city reaches certain threat levels;
- the player expands the city;
- the player performs major tower rebuilds;
- the player constructs certain megastructures;
- scripted events occur.

---

# Why Combat Exists

Combat serves three functions:

1. Validation
2. Progression Gate
3. Feedback

Validation:

Did the build work?

Progression Gate:

Can the city safely continue growing?

Feedback:

What weaknesses were revealed?

---

# Combat UI

Combat appears as a modal overlay.

The city remains visible behind it.

The player should never feel that they entered a different game mode.

Instead:

> The camera simply moved from inside the city to outside the wall.

---

# The Wall

The wall is the center of the combat system.

Unlike traditional tower defense games:

The wall has no HP.

The wall cannot be destroyed.

Instead it has:

## Load

or

## Pressure

or

## Stress

(final naming TBD)

---

# Wall Load

Wall Load represents how much danger currently threatens the city.

It is not cumulative damage.

It is a live measurement.

Example:

5 small enemies near wall

Load = 20

1 giant siege beast

Load = 80

Load constantly changes.

---

# Why No Wall HP

Wall HP creates boring situations:

- slowly repairing damage;
- waiting for recovery;
- meaningless chip damage.

Load creates immediate pressure.

The player cares about:

"How dangerous is the situation right now?"

instead of:

"How much damage happened ten minutes ago?"

---

# Enemy Threat Value

Every enemy has a Threat Value.

Examples:

Rat Swarm:
1

Wolf:
5

Mutant:
15

Siege Beast:
100

Living Fortress:
500

Threat Value contributes to Wall Load.

---

# Which Enemies Generate Load

An enemy generates load if:

- it reached the wall;
- it can attack the wall;
- it can bombard the city.

Enemies walking through the battlefield generate little or no load.

Current prototype behavior:

- melee enemies enter attack mode when they reach wall contact;
- ranged enemies enter attack mode when they are within their `shotDistance` from the wall;
- attack mode uses the enemy's optional `attackMovement` JSON definition and defaults to standing still;
- tower push-back or movement effects can move an attacking enemy out of engagement range, returning it to walk mode.

---

# Status Effects and Load

Status effects modify Threat Value.

Examples:

Frozen:
-50%

Poisoned:
-20%

Panicked:
-75%

Sleeping:
-100%

Current prototype behavior:

- Infection is implemented as a reusable enemy status. Each application adds stacks up to its configured maximum, refreshes duration, slows movement by stack, and deals damage over time through the normal battle damage resolver.
- Wall superstructures can apply single-target infection on cooldown with `tower.singleTargetInfection*` values. Projectile ammo can later apply the same status on hit with `tower.projectileInfection*` values.

This creates alternative strategies.

---

# Control Strategies

The player does not need to kill everything.

Control is a valid defense method.

Examples:

- freezing;
- slowing;
- confusion;
- fear;
- sleep;
- roots;
- disease.

An enemy wandering around harmlessly is almost as good as a dead enemy.

---

# Maximum Enemy Limit

The battlefield has a cap on active enemies.

Example:

50 active enemies.

If the battlefield is full:

new enemies cannot spawn.

This creates an important strategy.

---

# DPS Strategy

Kill enemies quickly.

Advantages:

- fewer enemies alive;
- faster wave progression;
- easier scaling.

Weaknesses:

- expensive;
- vulnerable to tank enemies.

---

# Control Strategy

Keep enemies alive but harmless.

Advantages:

- lower wall load;
- fewer reinforcements;
- cheaper damage requirements.

Weaknesses:

- battlefield congestion;
- possible collapse if control breaks.

---

# Hybrid Strategy

Expected default playstyle.

Combination of:

- damage;
- control;
- prioritization.

---

# Waves

Combat is organized into waves.

Each wave is stronger than the previous one.

The goal is not survival forever.

The goal is to reach the highest possible wave.

---

# Wave Scaling

Waves should not scale linearly.

Instead:

Early waves:
small increases.

Late waves:
large increases.

Example:

Wave 1:
10 power

Wave 2:
15 power

Wave 3:
22 power

Wave 4:
35 power

Wave 5:
55 power

Wave 6:
90 power

etc.

This creates dramatic endings.

---

# Region-Based Enemies

Enemy composition depends on region.

Not city.

The city affects strength.

The region affects species.

---

# Examples

Forest Region:

- beasts
- insects
- plant monsters

Industrial Region:

- machines
- drones
- mutants

Arcane Region:

- spirits
- constructs
- magical entities

---

# Threat Scaling

City threat increases wave strength.

Threat does NOT determine enemy type.

Threat determines quantity and power.

This allows:

same region

different difficulty

without changing identity.

---

# Distant Predators

At high threat levels:

additional enemy types may arrive.

Lore:

The city becomes visible from farther away.

Examples:

- dragons
- titans
- orbital horrors
- ancient guardians

---

# Containment Level

Containment Level is the primary combat reward.

The city earns a Containment Level based on:

highest successfully handled wave.

Example:

Reached Wave 7.

Containment Level = 7.

---

# Why Containment Exists

Containment is a progression gate.

Instead of:

"Need 5000 gold."

The game says:

"Need Containment Level 7."

This keeps combat relevant.

---

# Uses of Containment

Containment may unlock:

- expansion;
- research;
- buildings;
- megaprojects;
- endings.

---

# Surplus Containment

The player can exceed requirements.

Example:

Current City Threat:
3

Containment:
6

The city has safety margin.

This enables future growth.

---

# Wall Reinforcement

Support can be allocated to the wall.

Examples:

Technology:
force fields

Nature:
living roots

Aether:
barriers

Medieval:
garrisons

---

# Why Wall Investment Exists

Allows alternative builds.

Possible archetypes:

Glass Cannon City

Huge Towers
Weak Wall

Fortress City

Weak Towers
Massive Wall

Balanced City

Both

---

# Combat Duration

Combat lasts a fixed amount of time.

The player is not expected to survive forever.

Combat ends when:

- timer expires;
- wall load exceeds limit.

---

# Victory

Victory means:

Containment Level achieved.

The city proved itself.

---

# Defeat

Defeat means:

Wall Load exceeded maximum.

The city became overwhelmed.

The city is not destroyed.

Instead:

Containment was insufficient.

The player must improve the city.

---

# Megaproject Battles

Some construction projects trigger special attacks.

Examples:

Temporal Shield construction.

Ascension ritual.

World Brain growth.

Ark launch.

These battles function as final exams.

---

# Design Rules

Whenever a new combat mechanic is proposed:

1. Does it create meaningful choices?
2. Does it support planning?
3. Does it interact with threat?
4. Does it support multiple strategies?
5. Does it reinforce containment?

If not, it probably does not belong in combat.

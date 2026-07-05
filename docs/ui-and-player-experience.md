# Best Idle Game Ever 2 — UI and Player Experience

## Purpose of this document

This document describes how the player should experience the game.

It is not a technical UI specification.

It is a design document focused on:

- clarity;
- information flow;
- player understanding;
- emotional impact.

The goal is to ensure the game feels like a single coherent system rather than several disconnected screens.

Current implementation note, 2026-06-24:

- The app shell uses hash-routed pages for Battle, Tower, Research, City, and History.
- The shared upkeep/signature bar appears outside Battle and includes city expansion controls on the City route.
- Build and Research navigation become blocked during siege when the city has an effective tower build and debug mode is off.
- Debug mode exposes Progression, IDs, Entity Create, Gun Part Editor, and Global Events tools.
- Notifications are mounted at the app shell level, and force-level global events navigate to History.

---

# Core Philosophy

The player should never feel that they are:

- leaving the city;
- entering a different game;
- switching to a different mode.

Everything should feel like one living world.

---

# Design Goals

The UI should:

- emphasize the city;
- make combat feel connected;
- make threat understandable;
- make support understandable;
- explain why things happen;
- support experimentation.

---

# The City Is The Main Screen

The city view is the default state of the game.

The player spends most of their time here.

Everything should orbit around the city.

Not around menus.

Not around combat.

Not around spreadsheets.

The city is home.

---

# Visual Hierarchy

The player should immediately understand:

1. Threat
2. Support
3. Containment
4. Expansion Opportunities
5. Research Opportunities

These values drive the entire game.

Therefore they deserve constant visibility.

---

# Shared World Philosophy

One of the biggest dangers in strategy games is fragmentation.

Example:

City Screen

↓

Research Screen

↓

Combat Screen

↓

World Screen

↓

Another Screen

The player stops feeling connected to the city.

---

# Proposed Solution

Everything should remain visually connected.

Whenever possible:

The city remains visible.

The player always knows:

> This is still my city.

---

# The Wall

The wall is the visual anchor of the game.

It connects:

- city building;
- combat;
- containment;
- expansion.

The wall should become iconic.

---

# Shared Wall Concept

The wall exists in both views.

---

## City View

The wall appears as the upper edge of the city.

The top row of hexes is attached to it.

---

## Combat View

The same wall appears at the bottom of the battlefield.

Enemies approach from beyond it.

---

# Why This Matters

The player immediately understands:

Where enemies come from.

What they are defending.

Why combat matters.

---

# Combat Presentation

Combat should not open a separate screen.

Combat should appear as a modal overlay.

---

# Why Modal Combat

The player remains connected to the city.

Instead of:

Open New Scene

the game becomes:

Zoom Out
↓
Show Battlefield
↓
Continue Existing Story

---

# Visual Transition

Recommended flow:

City
↓
Camera Pulls Back
↓
Wall Becomes Visible
↓
Battlefield Appears
↓
Combat Starts

This strengthens immersion.

---

# Emotional Goal

The player should feel:

> The city I built is being tested.

Not:

> Minigame starting.

---

# Threat Display

Threat is one of the most important values.

Threat should always be visible.

---

## Recommended Display

Current Threat

Safe Threat

Containment Margin

Warning State

Example:

Threat:
12

Containment:
15

Margin:
+3

Safe

---

# Why Margin Matters

Most players think in safety margins.

Not absolute values.

The UI should support that.

---

# Containment Display

Containment should feel earned.

Suggested presentation:

Containment Level VII

instead of

Containment = 7

Makes progression feel more significant.

---

# Support Display

Support is the economic foundation.

Support should be visible without overwhelming the player.

---

## Recommended Format

Technology

⚡ Produced: 450
⚡ Used: 390
⚡ Free: 60

Nature

🌿 Produced: 320
🌿 Used: 290
🌿 Free: 30

Simple.

Readable.

Actionable.

---

# Deficit Display

Deficits should feel important but not catastrophic.

Example:

⚠ Electricity Deficit

-50

Effects:

- New electric structures unavailable
- Existing structures continue operating

The player immediately knows:

Problem
↓
Consequence
↓
Solution

---

# Expansion UI

Expansion should feel significant.

The player is not buying a tile.

The player is extending civilization.

---

## Recommended Flow

Hover Expansion

Shows:

Threat Increase

Expected Wave Increase

New Land Gained

Research Opportunities

Player makes informed decision.

---

# Research UI

Research should answer:

> Why can't I unlock this?

---

## Example

Temporal Mechanics

Missing:

✓ Research Campus

✓ Containment 7

✗ Quantum Laboratory

The player instantly knows the next step.

---

# Multistructure UI

One of the most important systems.

The UI must make it easy.

---

# Core Building View

Selecting a core building should show:

Current Structure

Possible Upgrades

Missing Requirements

Potential Benefits

---

## Example

Warehouse

Can Upgrade To:

Agricultural Hub

Missing:

✓ Farm
✗ Mill

The player immediately understands the goal.

---

# Tower Construction UI

The tower editor is one of the game's most important screens.

It should feel like engineering.

---

# Recommended Layout

Tower Visualization

↓

Component Slots

↓

Support Costs

↓

Behavior Summary

---

# Behavior Summary

Extremely important.

The player should see:

> What this tower actually does.

---

## Example

Current Tower Behavior:

- Targets strongest enemy
- Ignores armor
- Fires every 2.5 seconds
- Causes burn
- Prioritizes groups

Readable.

Human language.

Not formulas.

---

# Why Behavior Summaries Matter

The player experiments more.

They spend less time decoding mechanics.

---

# Combat Readability

The player must understand:

Why enemies are dangerous.

---

# Enemy Display

Recommended:

Threat Value

Health

Status Effects

Current Contribution to Wall Load

---

# Example

Siege Beast

Threat:
80

Current Load:
80

Frozen:
50%

Effective Load:
40

This immediately teaches mechanics.

---

# Wall Load Display

Wall Load is the most important combat value.

---

## Recommended

Current Load

Maximum Load

Largest Contributors

---

Example:

Load:
65 / 100

Top Contributors:

Siege Beast:
40

War Machine:
15

Raiders:
10

The player knows what to solve first.

---

# Crisis Display

Crises should feel like consequences.

Not random punishment.

---

## Example

Pollution Crisis

Cause:

Industrial Output Too High

Effects:

Population -15%

Possible Solutions:

- Forest District
- Purification Plant
- Nature Sanctuary

Always explain:

Cause
↓
Effect
↓
Solution

---

# Region Screen

Regions should feel tempting.

Not merely different.

---

# Region Preview

Before migration:

Show:

Advantages

Disadvantages

Unique Structures

Enemy Ecosystem

Special Technologies

The player should already begin planning.

---

# Capital UI

Colonizer players need empire tools.

---

# Capital Overview

Show:

Imports

Exports

Deficits

Megaproject Progress

The Capital becomes its own management layer.

---

# Nomad UI

Nomad players need different information.

Show:

Potential Specialist Gain

Migration Bonus

Regional Opportunities

This supports both playstyles equally.

---

# Ending Progress

Players should always know:

What ending they are moving toward.

---

## Example

World Brain

Requirements:

✓ Biomass Threshold

✓ Mutagen Research

✓ Living Nexus

✗ Planetary Root Network

Progress:
75%

This creates long-term motivation.

---

# Information Philosophy

Whenever possible:

Explain outcomes.

Not formulas.

Bad:

+15% Hidden Modifier

Good:

Produces 15% more Biomass because it is adjacent to a Warehouse.

---

# Emotional Goals

Early Game:

Curiosity

Mid Game:

Optimization

Late Game:

Mastery

End Game:

Achievement

The UI should reinforce those feelings.

---

# Design Rules

Whenever a new UI element is proposed:

1. Does it explain decisions?
2. Does it explain consequences?
3. Does it reduce confusion?
4. Does it support experimentation?
5. Does it strengthen connection to the city?

If not, it probably should not exist.

---

# Design North Star

The player should never feel like they are managing menus.

They should feel like they are guiding a civilization through a dangerous world.

# Branch Identity and Scaling Rules

This document describes the intended identity, resource model, scaling model and city-shape philosophy of each progression branch.

The purpose of this document is to guide future content additions and ensure that new buildings, technologies and mechanics reinforce the unique identity of each branch rather than turning them into recolored versions of one another.

---

# Core Principle

The four branches should not simply use different resources.

Each branch should answer the question:

"How does a civilization grow and survive?"

in a fundamentally different way.

---

# Medieval Branch

## Core Resources

* People
* Gold

## Identity

The medieval branch scales through population, professions and specialization.

Growth is achieved by:

* increasing population
* improving infrastructure
* training specialists
* organizing trade

## City Shape

Many small and medium superstructures.

Examples:

```text
House + Field = Farm

House + Tool Shed = Craftsman's House

Shop + Trade Station = Trading Station
```

The city gradually becomes a network of specialized districts.

## Main Problem

Not enough people.

## Main Solution

Build more housing, farms and economic infrastructure.

## Wall Identity

Strong defensive structures.

Examples:

* Stone Wall
* Fortress Wall
* Bastion

The medieval branch survives through organized defense.

---

# Magic Branch

## Core Resource

* Mana

## Hidden Atmospheric Values

Magic does not primarily scale through resource accumulation.

Instead it scales through magical atmosphere.

The player should not see raw numbers.

Instead the game should expose atmospheric states.

Examples:

```text
Weak
Moderate
Strong
Overwhelming
```

Atmospheric categories:

* Veil
* Mana Flows
* Death

Atmospheric levels:

```text
Veil:
Impermeable
Thinned
Damaged
Torn
Gate

Mana Flows:
Surges
Springs
Streams
Flows
Weave

Death:
Presence
Breath
Gaze
Touch
Realm
```

## Atmospheric Calculation

Internally:

```text
Veil State =
Total Veil Influence /
City Size

Mana Flow State =
Total Mana Flow Influence /
City Size

Death State =
Total Death Influence /
City Size
```

Each aether building may contribute influence to one or more of these three atmospheric values.

The current level is calculated as:

```text
floor(Total Influence / City Hex Count)
```

The result is clamped to the visible level range:

```text
0 or 1 = level 1
2 = level 2
3 = level 3
4 = level 4
5 or more = level 5
```

Because aura is normalized by city size, magical cities naturally prefer concentration over expansion.

## Visual Representation

Magic atmosphere is represented by a mystical orb.

Color channels:

* Red = Mana Flows
* Blue = Veil
* Darkness/Saturation = Death

Examples:

Pure Veil:

* Bright Blue

Pure Mana Flows:

* Bright Red

Mana Flows + Veil:

* Purple

High Death:

* Darker colors

Maximum values:

* Deep Dark Purple

The player should be able to roughly understand the magical character of the city from the orb without opening statistics panels.

## Technology Requirements

Technologies should require atmospheric states rather than numerical values.

Good:

```text
Requires Death: Gaze
Requires Veil: Torn
Requires Mana Flows: Streams
```

Bad:

```text
Requires 5 Death
Requires 3 Mana Flows
```

## Identity

Magic changes the nature of the city.

Examples:

* replace People with Mana
* bind spirits into matter
* alter targeting behavior
* suppress signatures
* create magical atmospheres

## City Shape

Few superstructures.

Many independent magical nodes.

Examples:

* Obelisk
* Spirit Hut
* Veil Thinning
* Suppression Totem

These buildings influence surrounding areas rather than forming large industrial districts.

## Main Problem

The city lacks the proper atmosphere.

## Main Solution

Change the magical balance of the settlement.

---

# Bio Branch

## Core Resource

* Biomass

## Core Hidden Value

Biodiversity

## Biodiversity Calculation

Internally:

```text
Biodiversity =
Unique Nature Hex Types /
City Size
```

Biodiversity is shown to the player as a numeric requirement with two decimal places.

Expected progression requirements should usually sit between:

```text
1.00
5.00
```

Example:

```text
Forest
Fungus
Flowers
Wetlands
Vines
```

is better than:

```text
Forest
Forest
Forest
Forest
Forest
```

## Identity

Biology does not rebuild.

Biology grows.

## Upgrade Philosophy

Buildings should often upgrade in place.

Instead of:

```text
Build
Demolish
Replace
```

the branch prefers:

```text
Grow
Mutate
Evolve
```

## City Signature Interaction

Because biological structures grow and evolve instead of being demolished, the branch naturally produces fewer permanent city traces.

Biological structures may also become one of the primary methods of reducing accumulated city traces.

## Environmental Requirements

Biological structures should frequently require surrounding ecosystems.

Examples:

```text
Requires nearby Fungus Colony

Requires 3 different Nature Hexes

Requires Forest nearby

Requires Water nearby
```

## City Shape

Organic clusters.

Examples:

```text
Fungus Colony

Forest

Ancient Forest

Living Grove
```

Clusters should reinforce each other.

Some biological structures may naturally expand over time.

## Main Problem

The ecosystem is unhealthy.

## Main Solution

Increase biodiversity and create stable ecological networks.

---

# Technology Branch

## Core Resource

* Electricity

## Scaling Philosophy

Technology should experience permanent energy hunger.

Energy costs should not scale linearly.

Instead they should scale exponentially.

Example:

```text
1
10
100
1000
10000
```

A player should never feel that energy production is fully solved.

## Identity

Technology scales through infrastructure.

Every solution creates larger future energy demands.

## Megastructures

Technology should contain the largest superstructures in the game.

Examples:

```text
Research Complex

Industrial Zone

Data Center

Fusion Facility

Orbital Infrastructure
```

These may occupy large areas.

## City Shape

Dense infrastructure.

Technology prefers tightly packed industrial and research districts.

## City Signature

Technology naturally produces extremely high city signature.

Examples:

* light pollution
* heat
* radio emissions
* industrial activity

Technology is likely to become the least stealthy branch.

## Main Problem

Not enough power.

## Main Solution

Build increasingly absurd energy infrastructure.

---

# Branch Summary

Medieval:

* scales through population

Magic:

* scales through atmosphere concentration

Biology:

* scales through biodiversity

Technology:

* scales through energy production

These identities should remain visible whenever new buildings, technologies, resources or mechanics are added.

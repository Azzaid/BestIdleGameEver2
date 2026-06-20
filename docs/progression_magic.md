# Magic Progression Branch

Draft of the magic progression branch.

Entry format:

```text
Name (branch, type)
```

Branches:
- medieval
- bio
- magic
- tech

Types:
- technology
- building
- superstructure
- wall
- wall_upgrade
- launcher
- ammo
- tower_base
- loader
- targeting
- resource
- resource_production

---

# Entry From Medieval Branch

## Wicked Items (magic, technology)

Unlocked By:
- Stalker Hut (medieval, superstructure)

Unlocks:
- Dolmen (magic, building)

Description:
Strange scavenged objects make early ritual stonework possible.

---

## Mysticism (magic, technology)

Unlocked By:
- Shaman Hut (magic, superstructure)

Unlocks:
- Magic Stones (magic, technology)

Description:
Early mystical practices, omens and ritual specialists emerge from the first Shaman Hut.

---

## Dolmen (magic, building)

Unlocked By:
- Wicked Items (magic, technology)

Description:
Early ritual stone structure.

Can Combine With:
- Stalker Hut (medieval, superstructure)

Forms:
- Shaman Hut (magic, superstructure)

Can Also Combine With:
- Warded Home (magic, building)

Forms Also:
- Runed House (magic, superstructure)

---

## Shaman Hut (magic, superstructure)

Components:
- Dolmen (magic, building)
- Stalker Hut (medieval, superstructure)

Unlocks:
- Mysticism (magic, technology)
- Veil: Thinned

Description:
An early magical specialist dwelling.

---

## Magic Stones (magic, technology)

Unlocked By:
- Mysticism (magic, technology)
- Veil: Impermeable

Unlocks:
- Warded Home (magic, building)
- Floating Platform (magic, tower_base)

---

## Warded Home (magic, building)

Unlocked By:
- Magic Stones (magic, technology)
- Veil: Thinned

Produces:
- People
- Small amount of Mana

Effects:
- Lower City Signature than Wooden House

Description:
A dwelling protected by charms, talismans and simple magical rituals.
The inhabitants often cannot explain why it feels safer and more comfortable, only that it does.

Can Combine With:
- Dolmen (magic, building)

Forms:
- Runed House (magic, superstructure)

---

## Floating Platform (magic, tower_base)

Unlocked By:
- Magic Stones (magic, technology)

Effects:
- Faster tower rotation.

Description:
A magical wall tower using floating stones.

---

# Runed House and Coven

## Runed House (magic, superstructure)

Components:
- Warded Home (magic, building)
- Dolmen (magic, building)

Produces:
- People
- Mana

Effects:
- Lower City Signature than an ordinary magical dwelling.

Description:
A house protected and empowered by carved or painted runes.

Can Combine With:
- Runed House (magic, superstructure)

Forms:
- Coven (magic, superstructure)

---

## Coven (magic, superstructure)

Components:
- Runed House (magic, superstructure)
- Runed House (magic, superstructure)

Produces:
- Mana

Unlocks:
- Mana Flow Command (magic, technology)
- Veil Communion (magic, technology)
- Mystical Hostility (magic, technology)

Description:
The first organized magical household circle. Rituals, spiritual knowledge and magical disciplines become shared practice.

---

# Mana Flow Command

## Mana Flow Command (magic, technology)

Unlocked By:
- Coven (magic, superstructure)
- Mana Flows: Springs

Unlocks:
- Guiding Stone (magic, launcher)
- Obelisk (magic, building)

Theme:
Mana flow shaping, direction and formalized magical authority.

---

## Guiding Stone (magic, launcher)

Unlocked By:
- Mana Flow Command (magic, technology)

Effects:
- Low direct damage.
- Significantly increases projectile speed.

Description:
A magical launcher/focus that commands the projectile and pushes it toward the target.

---

## Obelisk (magic, building)

Unlocked By:
- Mana Flow Command (magic, technology)
- Mana Flows: Springs

Produces:
- Mana

Effects:
- Produces more Mana than a Runed House.
- Produces Mana with lower City Signature than early ritual structures.

Description:
A more refined and efficient magical structure.

Can Combine With:
- Spirit Hut (magic, building)

Forms:
- Embodiment Stone (magic, superstructure)

---

# Veil Communion

## Veil Communion (magic, technology)

Unlocked By:
- Coven (magic, superstructure)
- Veil: Damaged

Unlocks:
- Whispering Spirit (magic, targeting)
- Spirit Hut (magic, building)

Theme:
Cooperation with spirits through a thinning and damaged veil.

---

## Whispering Spirit (magic, targeting)

Unlocked By:
- Veil Communion (magic, technology)

Effects:
- Increases targeting range.
- Targets the most dangerous monsters instead of the closest monsters.

Description:
A spirit that helps tower crews recognize the real danger.

---

## Spirit Hut (magic, building)

Unlocked By:
- Veil Communion (magic, technology)
- Veil: Damaged

Effects:
- Converts 25% of People requirements in nearby buildings into Mana requirements.

Description:
Helpful spirits perform part of the work normally done by citizens.

Can Combine With:
- Spirit Hut (magic, building)
- Spirit Hut (magic, building)

Forms:
- House of Spirits (magic, superstructure)

Can Also Combine With:
- Suppression Totem (magic, building)

Forms Also:
- Spirit Trap (magic, superstructure)

Can Also Combine With:
- Obelisk (magic, building)

Forms Also:
- Embodiment Stone (magic, superstructure)

---

## House of Spirits (magic, superstructure)

Components:
- Spirit Hut (magic, building)
- Spirit Hut (magic, building)
- Spirit Hut (magic, building)

Effects:
- Converts 50% of People requirements into Mana requirements.

Unlocks:
- Ancestor Spirits (magic, technology)

Description:
A place densely inhabited by cooperative spirits near a torn veil.

---

## Ancestor Spirits (magic, technology)

Unlocked By:
- House of Spirits (magic, superstructure)
- Veil: Torn
- Death: Presence

Unlocks:
- Poltergeist (magic, loader)
- Veil Thinning (magic, building)

Description:
The settlement learns to call and cooperate with ancestral spirits.

---

## Poltergeist (magic, loader)

Unlocked By:
- Ancestor Spirits (magic, technology)

Effects:
- Greatly increases shots per second.

Description:
A ghostly loader that manipulates tower mechanisms.

---

## Veil Thinning (magic, building)

Unlocked By:
- Ancestor Spirits (magic, technology)

Produces:
- Large amount of Mana.

Effects:
- Strongly increases City Signature.

Description:
A small weak point where the spirit world leaks into reality. It is not a stable portal, but the boundary is dangerously thin.

---

# Mystical Hostility

## Mystical Hostility (magic, technology)

Unlocked By:
- Coven (magic, superstructure)

Unlocks:
- Malevolent Totem (magic, wall_upgrade)
- Suppression Totem (magic, building)

Theme:
Suppression, coercion and aggressive spirit use.

---

## Malevolent Totem (magic, wall_upgrade)

Unlocked By:
- Mystical Hostility (magic, technology)

Effects:
- Deals small damage to all monsters within a certain distance from the wall.

Description:
A hostile wall-mounted spirit totem that attacks approaching monsters.

---

## Suppression Totem (magic, building)

Unlocked By:
- Mystical Hostility (magic, technology)

Consumes:
- Mana

Effects:
- Strongly reduces City Signature of nearby buildings.
- Reduces productivity of nearby buildings.

Description:
A suppressive magical structure that quiets and weakens everything around it.

Can Combine With:
- Spirit Hut (magic, building)

Forms:
- Spirit Trap (magic, superstructure)

---

## Spirit Trap (magic, superstructure)

Components:
- Spirit Hut (magic, building)
- Suppression Totem (magic, building)

Produces:
- Large amount of Mana.

Effects:
- Adjacent buildings generate no Mana.
- Reduces People production by 50%.

Unlocks:
- Death Energy (magic, technology)

Description:
A cruel magical structure that captures spirits and extracts power from them.

---

## Death Energy (magic, technology)

Unlocked By:
- Spirit Trap (magic, superstructure)

Unlocks:
- Bone Barrel (magic, launcher)

Description:
Magic that uses death as fuel and spreads destruction from dying enemies.

---

## Bone Barrel (magic, launcher)

Unlocked By:
- Death Energy (magic, technology)

Effects:
- Enemies killed by shots explode.
- Explosion damages nearby enemies.

Description:
A necromantic barrel that turns death into a secondary attack.

---

# Embodiment and Living Clay

## Embodiment Stone (magic, superstructure)

Components:
- Obelisk (magic, building)
- Spirit Hut (magic, building)

Unlocks:
- Living Clay (magic, technology)

Description:
A stone used to bind spirits into matter.

Notes:
This is about binding spirits into flesh, clay or constructed bodies, not merely controlling them from outside.

---

## Living Clay (magic, technology)

Unlocked By:
- Embodiment Stone (magic, superstructure)

Unlocks:
- Predatory Clay (magic, ammo)
- Living Platform (magic, tower_base)
- Golem Builder (magic, building)

Description:
The settlement learns to bind spirits into clay bodies and animated matter.

---

## Predatory Clay (magic, ammo)

Unlocked By:
- Living Clay (magic, technology)

Effects:
- Slows enemies.
- Deals damage over time.

Description:
Living clay projectiles that cling to monsters and gnaw at them.

---

## Living Platform (magic, tower_base)

Unlocked By:
- Living Clay (magic, technology)

Description:
An animated living wall tower.

Notes:
Exact stats are undecided. It should probably mitigate weight and rotate without needing human crews.

---

## Golem Builder (magic, building)

Unlocked By:
- Living Clay (magic, technology)

Effects:
- Replaces all People requirements in a radius with Mana requirements.

Description:
A workshop where clay bodies are animated by bound spirits.

---

# Design Notes

## Magic Branch Identity

The magic branch should not be just another numeric upgrade path.

Current identity:
- Replace People requirements with Mana requirements.
- Trade production for reduced City Signature.
- Use spirits for targeting and reloading.
- Generate large amounts of Mana with serious drawbacks.
- Bind spirits into matter to create golems and living platforms.

## Main Magic Subthemes

Mana Flow Command:
- Guiding projectiles.
- Efficient Mana structures.
- Formal shaping of mana flows.

Veil Communion:
- Helpful spirits.
- Ancestors.
- Replacement of human labor by cooperative spirits near a damaged veil.

Mystical Hostility:
- Suppression.
- Spirit traps.
- Death energy.
- Damage near walls and corpse explosions.

Embodiment:
- Binding spirits into matter.
- Living clay.
- Golems.

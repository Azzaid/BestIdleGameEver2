# Medieval Progression Branch

Черновик средневековой ветки прогрессии.

Формат записи:

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

# Early Survival Chain

## Shelter (medieval, building)

Description:
Primitive shelter made from branches, scavenged wood and cloth.

Produces:
- People

Unlocks:
- Foraging (medieval, technology)

Notes:
First building of the settlement.

---

## Primitive Launcher (medieval, launcher)

Description:
Starting launcher component of the first tower.

Notes:
The first tower does not require a barrel. It only needs:
- launcher
- ammunition

---

## Stone Basket (medieval, ammo)

Description:
Starting ammunition storage: a basket full of stones.

---

## Scrap Wall (medieval, wall)

Description:
Initial wall made from trash, branches, scrap wood, metal sheets and broken concrete.

Notes:
Weak starting wall.

---

## Foraging (medieval, technology)

Unlocked By:
- Shelter (medieval, building)

Unlocks:
- Crude Hollow Trunk (medieval, launcher)
- Scrap Collection Point (medieval, building)

Description:
The settlement learns to survive by searching the surrounding ruins for useful materials.

---

## Crude Hollow Trunk (medieval, launcher)

Unlocked By:
- Foraging (medieval, technology)

Description:
A crude barrel-like launcher made from an old hollow tree trunk.

---

## Scrap Collection Point (medieval, building)

Unlocked By:
- Foraging (medieval, technology)

Description:
A place where scavenged materials, broken tools, herbs, small animals and other useful findings are sorted.

Can Combine With:
- Shelter (medieval, building)

Forms:
- Stalker Hut (medieval, superstructure)

---

## Stalker Hut (medieval, superstructure)

Temporary name. Alternative names may be needed.

Components:
- Shelter (medieval, building)
- Scrap Collection Point (medieval, building)

Unlocks:
- Seed Gathering (bio, technology)
- Scrap Tools (medieval, technology)

Description:
A home and preparation place for a scavenger who goes into the ruins, forests and dangerous places outside the settlement.

Notes:
This is one of the key early crossroads.

---

# Early Bio-Linked Survival Chain

## Seed Gathering (bio, technology)

Unlocked By:
- Stalker Hut (medieval, superstructure)

Unlocks:
- Wild Garden (bio, building)

Description:
The settlement starts collecting useful seeds from wild plants.

---

## Wild Garden (bio, building)

Unlocked By:
- Seed Gathering (bio, technology)

Description:
A small garden with wild edible, medicinal and strange plants.

Can Combine With:
- Stalker Hut (medieval, superstructure)

Forms:
- Herbalist Hut (bio, superstructure)

---

## Herbalist Hut (bio, superstructure)

Components:
- Stalker Hut (medieval, superstructure)
- Wild Garden (bio, building)

Unlocks:
- Plant Cultivation (bio, technology)

Description:
A hut where gathered plants are cultivated, studied and prepared.

---

## Plant Cultivation (bio, technology)

Unlocked By:
- Herbalist Hut (bio, superstructure)

Unlocks:
- Poisoned Stones (bio, ammo)
- Field (bio, building)

Description:
The settlement learns to deliberately grow and use plants.

---

## Poisoned Stones (bio, ammo)

Unlocked By:
- Plant Cultivation (bio, technology)

Effects:
- Applies poison damage over time.
- Slightly reduces fire rate due to careful handling.

---

## Field (bio, building)

Unlocked By:
- Plant Cultivation (bio, technology)

Effects:
- +25% People production in adjacent buildings.
- +25% Biomass production in adjacent buildings.

Can Combine With:
- Wooden House (medieval, building)

Forms:
- Farm (medieval, superstructure)

Notes:
Bonuses should be meaningful. Around 25% is the intended baseline for major adjacency bonuses.

---

# Tools and Wood Chain

## Scrap Tools (medieval, technology)

Unlocked By:
- Stalker Hut (medieval, superstructure)

Unlocks:
- Tool Shed (medieval, building)

Description:
Primitive tools made from scavenged materials.

---

## Tool Shed (medieval, building)

Unlocked By:
- Scrap Tools (medieval, technology)

Description:
A storage and repair place for tools.

Can Combine With:
- Stalker Hut (medieval, superstructure)

Forms:
- Lumberjack House (medieval, superstructure)

Can Also Combine With:
- Wooden House (medieval, building)

Forms Also:
- Craftsman's House (medieval, superstructure)

---

## Lumberjack House (medieval, superstructure)

Components:
- Stalker Hut (medieval, superstructure)
- Tool Shed (medieval, building)

Unlocks:
- Timber Processing (medieval, technology)

Description:
A household focused on cutting, selecting and processing useful wood.

---

## Timber Processing (medieval, technology)

Unlocked By:
- Lumberjack House (medieval, superstructure)

Unlocks:
- Wooden Barrel (medieval, launcher)
- Wooden House (medieval, building)

Description:
Knowledge of useful construction wood and better wooden parts.

Notes:
Original draft called this "деловое дерево". It probably means usable construction timber or timber processing.

---

## Wooden Barrel (medieval, launcher)

Unlocked By:
- Timber Processing (medieval, technology)

Description:
A better wooden launcher/barrel made after the settlement learns proper wood processing.

---

## Wooden House (medieval, building)

Unlocked By:
- Timber Processing (medieval, technology)

Produces:
- People

Description:
A better residential building than Shelter.

Can Combine With:
- Field (bio, building)

Forms:
- Farm (medieval, superstructure)

Can Also Combine With:
- Tool Shed (medieval, building)

Forms Also:
- Craftsman's House (medieval, superstructure)

---

# Farm, Money and Market Chain

## Farm (medieval, superstructure)

Components:
- Field (bio, building)
- Wooden House (medieval, building)

Unlocks:
- Money (medieval, technology)
- Market (medieval, building)
- Trained Shooter (medieval, loader_upgrade)

Description:
The first major economic apex of the early game.

Notes:
This is the first stage that requires not only People but also Gold/Money-related economy.

---

## Money (medieval, technology)

Unlocked By:
- Farm (medieval, superstructure)

Description:
The settlement develops exchange value, payment and early economic specialization.

Notes:
"Money" is fixed as a technology term for now.

---

## Market (medieval, building)

Unlocked By:
- Farm (medieval, superstructure)

Produces:
- Gold

Unlocks:
- Mysticism (magic, technology)

Description:
A trading and social center where merchants, fortune tellers and strange wandering people appear.

Notes:
Market is fixed as a building term for now.

---

## Trained Shooter (medieval, loader_upgrade)

Unlocked By:
- Farm (medieval, superstructure)

Effects:
- Increases reload speed.

Description:
An early tower crew improvement. People are trained to operate the tower rather than relying on whoever reaches it first.

Notes:
This may later be represented as a loader component or loader upgrade.

---

# Mysticism Gateway

## Mysticism (magic, technology)

Unlocked By:
- Market (medieval, building)

Unlocks:
- Dolmen (magic, building)

Description:
Early mystical practices, fortune tellers, omens and ritual specialists emerge around the market economy.

Notes:
This is the bridge from medieval economy into the magic branch.

---

## Dolmen (magic, building)

Unlocked By:
- Mysticism (magic, technology)

Description:
Early ritual stone structure.

Can Combine With:
- Stalker Hut (medieval, superstructure)

Forms:
- Shaman Hut (magic, superstructure)

Can Also Combine With:
- Stone House (medieval, building)

Forms Also:
- Shrine (magic, superstructure)

---

## Shaman Hut (magic, superstructure)

Components:
- Dolmen (magic, building)
- Stalker Hut (medieval, superstructure)

Unlocks:
- Magic Stones (magic, technology)

Description:
An early magical specialist dwelling.

---

## Magic Stones (magic, technology)

Unlocked By:
- Shaman Hut (magic, superstructure)

Unlocks:
- Floating Platform (magic, tower_base)

---

## Floating Platform (magic, tower_base)

Unlocked By:
- Magic Stones (magic, technology)

Effects:
- Faster tower rotation.

Description:
A magical tower platform using floating stones.

---

# Crafting and Stone Chain

## Craftsman's House (medieval, superstructure)

Components:
- Wooden House (medieval, building)
- Tool Shed (medieval, building)

Unlocks:
- Woodworking (medieval, technology)
- Stoneworking (medieval, technology)

Description:
Formerly called Workshop in earlier notes. Renamed to avoid conflict with the later Engineering Workshop.

---

## Woodworking (medieval, technology)

Unlocked By:
- Craftsman's House (medieval, superstructure)

Unlocks:
- Crossbow Launcher (medieval, launcher)
- Wheeled Platform (medieval, tower_base)
- Palisade (medieval, wall)

Description:
Advanced woodworking for mechanisms, defensive construction and tower components.

---

## Crossbow Launcher (medieval, launcher)

Unlocked By:
- Woodworking (medieval, technology)

Description:
A mechanical launcher for the tower.

Notes:
Requires ammunition.

---

## Wheeled Platform (medieval, tower_base)

Unlocked By:
- Woodworking (medieval, technology)

Effects:
- Faster rotation.
- Mitigates rotation penalties from tower component weight.

Design Notes:
Each tower component has weight. Weight slows tower rotation. Tower bases help mitigate this, making advanced platforms useful even in late game.

---

## Palisade (medieval, wall)

Unlocked By:
- Woodworking (medieval, technology)

Effects:
- Stronger than Scrap Wall.
- Cheap.
- Does not require Gold upkeep.

Description:
A wooden defensive wall.

---

## Stoneworking (medieval, technology)

Unlocked By:
- Craftsman's House (medieval, superstructure)

Unlocks:
- Stone Wall (medieval, wall)
- Stone House (medieval, building)

---

## Stone Wall (medieval, wall)

Unlocked By:
- Stoneworking (medieval, technology)

Effects:
- High durability.
- Ignores part of monster Threat.
- Requires Gold upkeep.

---

## Stone House (medieval, building)

Unlocked By:
- Stoneworking (medieval, technology)

Produces:
- People
- Gold

Effects:
- Adds less City Signature than Wooden House because it blocks sound, smells and heat better.

Can Combine With:
- Dolmen (magic, building)

Forms:
- Shrine (magic, superstructure)

Can Also Combine With:
- Chemical Storage (medieval, building)

Forms Also:
- Alchemical Laboratory (medieval, superstructure)

Can Also Combine With:
- Workshop (medieval, building)

Forms Also:
- Engineer's House (medieval, superstructure)

---

# University and Natural Philosophy

## University (medieval, building)

Requires:
- 3 Stone Houses (medieval, building)

Unlocks:
- Natural Philosophy (medieval, technology)

Description:
A dedicated institution that becomes possible after the settlement reaches a critical mass of stable stone housing and educated population.

Notes:
University is not necessarily a physical merge of three houses. The three Stone Houses are an infrastructure requirement.

---

## Natural Philosophy (medieval, technology)

Unlocked By:
- University (medieval, building)

Unlocks:
- Animal Husbandry (medieval, technology)
- Engineering (medieval, technology)
- Alchemy (medieval, technology)
- Chemical Storage (medieval, building)

Description:
Early systematic knowledge of nature, materials, animals and practical observation.

---

# Alchemy and Gunpowder

## Chemical Storage (medieval, building)

Unlocked By:
- Natural Philosophy (medieval, technology)

Description:
Storage for reagents, salts, sulfur, acids, poisons and other unstable materials.

Can Combine With:
- Stone House (medieval, building)

Forms:
- Alchemical Laboratory (medieval, superstructure)

---

## Alchemical Laboratory (medieval, superstructure)

Components:
- Chemical Storage (medieval, building)
- Stone House (medieval, building)

Unlocks:
- Gunpowder (medieval, technology)

Description:
A place for controlled experiments, reagents and dangerous mixtures.

---

## Gunpowder (medieval, technology)

Unlocked By:
- Alchemical Laboratory (medieval, superstructure)

Unlocks:
- Gunpowder Chamber (medieval, launcher)
- Gunpowder Bomb (medieval, ammo)

---

## Gunpowder Chamber (medieval, launcher)

Unlocked By:
- Gunpowder (medieval, technology)

Description:
A heavy explosive launcher mechanism.

Effects:
- High power.
- Heavy component.

---

## Gunpowder Bomb (medieval, ammo)

Unlocked By:
- Gunpowder (medieval, technology)

Effects:
- Expensive ammunition.
- Small area damage.

---

# Engineering

## Engineering (medieval, technology)

Unlocked By:
- Natural Philosophy (medieval, technology)

Unlocks:
- Workshop (medieval, building)

Description:
Formal understanding of mechanisms, production organization and construction.

---

## Workshop (medieval, building)

Unlocked By:
- Engineering (medieval, technology)

Effects:
- +25% production of adjacent buildings.
- -25% Mana production of adjacent buildings.

Description:
A practical engineering workshop. Improves material production but interferes with mystical activity.

Can Combine With:
- Stone House (medieval, building)

Forms:
- Engineer's House (medieval, superstructure)

---

## Engineer's House (medieval, superstructure)

Components:
- Workshop (medieval, building)
- Stone House (medieval, building)

Produces:
- Small amount of People
- Large amount of Gold

Unlocks:
- Fortification (medieval, technology)
- Ballistics (medieval, technology)

Description:
Residence and workplace of professional engineers.

---

## Fortification (medieval, technology)

Unlocked By:
- Engineer's House (medieval, superstructure)

Unlocks:
- Bastion (medieval, wall_upgrade)
- Fortress Wall (medieval, wall)
- Barracks (medieval, building)

---

## Bastion (medieval, wall_upgrade)

Unlocked By:
- Fortification (medieval, technology)

Effects:
- Increases flat amount of Threat ignored by walls.
- Requires Gold upkeep.

---

## Fortress Wall (medieval, wall)

Unlocked By:
- Fortification (medieval, technology)

Description:
Improved version of Stone Wall.

Effects:
- Stronger than Stone Wall.
- More expensive than Stone Wall.
- Requires Gold upkeep.

---

## Barracks (medieval, building)

Unlocked By:
- Fortification (medieval, technology)

Consumes:
- Gold

Effects:
- Sends patrols to kill monsters outside the walls.
- Reduces City Signature.

Description:
Military infrastructure that protects the settlement beyond the wall line.

---

## Ballistics (medieval, technology)

Unlocked By:
- Engineer's House (medieval, superstructure)

Description:
Knowledge of trajectories, projectile weapons and siege mechanics.

Notes:
Paused for now. Future home for advanced launchers, sights and siege-style tower components.

---

# Animal Husbandry and Trade

## Animal Husbandry (medieval, technology)

Unlocked By:
- Natural Philosophy (medieval, technology)

Unlocks:
- Barn (medieval, building)

---

## Barn (medieval, building)

Unlocked By:
- Animal Husbandry (medieval, technology)

Effects:
- Reduces People requirements of nearby buildings.

Can Combine With:
- Farm (medieval, superstructure)

Forms:
- Stable (medieval, superstructure)

---

## Stable (medieval, superstructure)

Components:
- Barn (medieval, building)
- Farm (medieval, superstructure)

Unlocks:
- Horses (medieval, technology)

---

## Horses (medieval, technology)

Unlocked By:
- Stable (medieval, superstructure)

Unlocks:
- Horse Drive (medieval, tower_base)
- Trade Station (medieval, building)

---

## Horse Drive (medieval, tower_base)

Unlocked By:
- Horses (medieval, technology)

Effects:
- Strongly increases tower rotation speed.

Description:
A tower platform rotated by animal power through gears, ropes or capstans.

---

## Trade Station (medieval, building)

Unlocked By:
- Horses (medieval, technology)

Effects:
- Increases adjacency bonus radius for neighboring buildings.

Description:
A logistics and transport building for carts, horses and organized movement of goods.

Unlocks:
- Trade (medieval, technology)

---

## Trade (medieval, technology)

Unlocked By:
- Trade Station (medieval, building)

Unlocks:
- Shop (medieval, building)
- Dedicated Loader (medieval, loader)

---

## Shop (medieval, building)

Unlocked By:
- Trade (medieval, technology)

Produces:
- Gold

Can Combine With:
- Trade Station (medieval, building)

Forms:
- Trading Station (medieval, superstructure)

---

## Dedicated Loader (medieval, loader)

Unlocked By:
- Trade (medieval, technology)

Effects:
- Increases reload speed.

Description:
A paid and trained tower crew member. Reloading is handled by a permanent shift instead of random citizens.

---

## Trading Station (medieval, superstructure)

Components:
- Shop (medieval, building)
- Trade Station (medieval, building)

Unlocks:
- Caravans (medieval, technology)

Description:
A developed trade and logistics hub.

---

## Caravans (medieval, technology)

Unlocked By:
- Trading Station (medieval, superstructure)

Effects:
- Organized migration transfers 10% of free Support into the new city.

Notes:
The basic "Abandon City" button is available from the start as an emergency reset.
Caravans are a stronger, organized migration mechanic for later progression.

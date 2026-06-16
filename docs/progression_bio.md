# Bio Progression Branch

Черновик биологической ветки прогрессии.

Файл пока содержит только уже придуманные элементы, которые появились как ранние переходы из средневековой ветки.

Формат записи:

```text
Name (branch, type)
```

---

# Early Bio Entry From Stalker Hut

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
This is currently duplicated in the medieval file because Farm is part of the early economy bridge.
Later this file should become the full biological branch.

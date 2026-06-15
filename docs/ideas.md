# Ideas

Raw future-facing notes. These are not commitments; they preserve design and technical thoughts for later triage.

## 2026-06-15 Future Work Notes

- Fix scroll and drag behavior on graph-based pages.
- Move battle tuning values out into named constants:
  - siege duration;
  - auto-victory threshold at `1.2` city threat;
  - wave internal threat to city threat ratio;
  - wave interval in siege mode;
  - wave interval in pressure mode.
- Keep sieges time-limited, but use a dedicated duration constant instead of a hardcoded one-minute limit.
- Unify data folder structure.
- Add multistructures.
- Slightly adjust battle scale.
- Allow choosing which tower is currently being edited.
- Pick an English term for "надстройка над стеной".
  - Likely candidates: `battlement` for a defensive top structure, `parapet` for the protective wall edge, `wall-walk` for the walkway on top of the wall.
- If all on-screen monsters are destroyed, fast-forward to the next wave, but only in siege mode.
- When siege is won or lost, keep the battle screen visible and transition it into pressure mode instead of hiding it.
- Add a subtle yellow-ish siege frame so siege mode is visually recognizable and feels more oppressive without becoming too bright.

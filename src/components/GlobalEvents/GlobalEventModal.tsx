import {GLOBAL_EVENTS} from "../../data/globalEvents/index.ts";
import {GLOBAL_MODIFIERS} from "../../data/globalModifiers/index.ts";
import {getHomogeneousValueDefinition} from "../../data/homogeneousValues/index.ts";
import type {EffectTemplate, GlobalEventAction} from "../../models/globalEvents.ts";
import type {GlobalEventModalEntry} from "../../models/store/globalEvents.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {dismissGlobalEventModalEntries} from "../../store/globalEvents/slice.ts";
import {selectPendingGlobalEventModalEntries} from "../../store/globalEvents/selectors.ts";
import * as s from "./GlobalEventModal.css.ts";

type EffectLine = {
  title: string;
  description: string;
};

export function GlobalEventModal() {
  const dispatch = useTypedDispatch();
  const entries = useTypedSelector(selectPendingGlobalEventModalEntries);
  if (entries.length === 0) return null;

  const title = entries.length === 1 ? "Global Event" : "Global Events";

  return (
    <div className={s.backdrop} role="presentation" onClick={() => dispatch(dismissGlobalEventModalEntries())}>
      <section
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-event-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={s.header}>
          <h2 id="global-event-modal-title" className={s.heading}>{title}</h2>
          <button
            className={s.closeButton}
            type="button"
            onClick={() => dispatch(dismissGlobalEventModalEntries())}
            aria-label="Close global event details"
          >
            x
          </button>
        </header>

        <div className={s.body}>
          {entries.map((entry, index) => (
            <GlobalEventBlock key={`${entry.eventId}:${index}`} entry={entry} />
          ))}
        </div>

        <footer className={s.footer}>
          <button className={s.primaryButton} type="button" onClick={() => dispatch(dismissGlobalEventModalEntries())}>
            Continue
          </button>
        </footer>
      </section>
    </div>
  );
}

function GlobalEventBlock({entry}: {entry: GlobalEventModalEntry}) {
  const definition = GLOBAL_EVENTS[entry.eventId];
  const effectLines = createEffectLines(entry.actions);

  return (
    <article className={s.eventBlock}>
      {definition?.imageSrc && (
        <img
          className={s.eventImage}
          src={definition.imageSrc}
          alt={definition.imageAlt ?? definition.title}
        />
      )}
      <div>
        <h3 className={s.eventTitle}>{definition?.title ?? entry.eventId}</h3>
        {definition?.description && (
          <p className={s.eventDescription}>{definition.description}</p>
        )}
      </div>
      <ul className={s.effectList}>
        {effectLines.map((effect, index) => (
          <li className={s.effectItem} key={`${effect.title}:${index}`}>
            <span className={s.effectTitle}>{effect.title}</span>
            <span className={s.effectDescription}>{effect.description}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function createEffectLines(actions: readonly GlobalEventAction[]): EffectLine[] {
  const lines = actions.flatMap(createActionEffectLines);

  return lines.length
    ? lines
    : [{title: "World State", description: "The global event state was updated."}];
}

function createActionEffectLines(action: GlobalEventAction): EffectLine[] {
  if (action.type === "applyGlobalModifier") {
    const modifier = GLOBAL_MODIFIERS[action.modifierId];
    if (!modifier) {
      return [{
        title: action.modifierId,
        description: "Applies a persistent global modifier.",
      }];
    }

    return modifier.effects.map(effect => ({
      title: modifier.title,
      description: [describeEffectTemplate(effect), modifier.description].filter(Boolean).join(" "),
    }));
  }

  if (action.type === "abandonCity") {
    return [{title: "City Abandoned", description: "Ends the current city and prepares the next transition."}];
  }

  if (action.type === "triggerEnding") {
    return [{title: "Ending Triggered", description: `Starts ending ${action.endingId}.`}];
  }

  if (action.type === "showCutscene") {
    return [{title: "Cutscene", description: `Shows cutscene ${action.cutsceneId}.`}];
  }

  if (action.type === "unlockTechnology") {
    return [{title: "Technology Unlocked", description: `Unlocks technology ${action.technologyId}.`}];
  }

  return [];
}

function describeEffectTemplate(effect: EffectTemplate): string {
  const definition = getHomogeneousValueDefinition(effect.valueId);
  const role = getEffectRole(effect);

  if (role === "upkeep") return `Adds ${definition.label} upkeep.`;
  if (role === "unlock") return `Adds ${definition.label} unlock progress.`;

  return `Adds ${definition.label} production.`;
}

function getEffectRole(effect: EffectTemplate): "production" | "upkeep" | "unlock" {
  const keywords = new Set([
    ...(effect.additionalKeywords ?? []),
  ]);

  if (keywords.has("upkeep")) return "upkeep";
  if (keywords.has("unlock")) return "unlock";

  return "production";
}

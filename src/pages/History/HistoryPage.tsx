import {useEffect, useMemo, useRef, useState} from "react";
import {GLOBAL_EVENTS} from "../../data/globalEvents/index.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {
  selectForeseenGlobalEventIds,
  selectGlobalEventHistoryEntries,
  selectLastSeenHistoryEntryId,
} from "../../store/globalEvents/selectors.ts";
import {markGlobalHistorySeen} from "../../store/globalEvents/slice.ts";
import * as s from "./HistoryPage.css.ts";

export default function HistoryPage() {
  const dispatch = useTypedDispatch();
  const eventHistoryEntries = useTypedSelector(selectGlobalEventHistoryEntries);
  const foreseenEventIds = useTypedSelector(selectForeseenGlobalEventIds);
  const lastSeenEntryId = useTypedSelector(selectLastSeenHistoryEntryId);
  const eventRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isForeseenOpen, setIsForeseenOpen] = useState(foreseenEventIds.length > 0);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  const targetEventId = useMemo(
    () => getHistoryScrollTarget(eventHistoryEntries.map(entry => entry.id), lastSeenEntryId),
    [eventHistoryEntries, lastSeenEntryId],
  );
  const latestEntryId = eventHistoryEntries.at(-1)?.id;

  useEffect(() => {
    if (!targetEventId) return;

    setHighlightedEventId(targetEventId);
    const animationFrameId = requestAnimationFrame(() => {
      eventRefs.current[targetEventId]?.scrollIntoView({block: "start", behavior: "smooth"});
      if (latestEntryId) dispatch(markGlobalHistorySeen(latestEntryId));
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [dispatch, latestEntryId, targetEventId]);

  useEffect(() => {
    if (!highlightedEventId) return;

    const timeoutId = window.setTimeout(() => setHighlightedEventId(null), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedEventId]);

  useEffect(() => {
    if (foreseenEventIds.length > 0) setIsForeseenOpen(true);
  }, [foreseenEventIds.length]);

  const foreseenItems = foreseenEventIds.map(eventId => ({
    eventId,
    event: GLOBAL_EVENTS[eventId],
  }));

  return (
    <section className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>History</h1>
      </header>

      <div className={s.timeline}>
        {eventHistoryEntries.length === 0 ? (
          <p className={s.emptyState}>No global events have happened yet.</p>
        ) : (
          eventHistoryEntries.map((entry, index) => {
            const event = GLOBAL_EVENTS[entry.eventId];

            return (
              <article
                key={entry.id}
                ref={element => {
                  eventRefs.current[entry.id] = element;
                }}
                className={highlightedEventId === entry.id ? s.eventCardHighlighted : s.eventCard}
              >
                {event?.imageSrc && (
                  <img
                    className={s.eventImage}
                    src={event.imageSrc}
                    alt={event.imageAlt ?? event.title}
                  />
                )}
                <div className={s.eventContent}>
                  <div className={s.eventMeta}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{event?.notificationLevel ?? "force"}</span>
                  </div>
                  <h2 className={s.eventTitle}>{event?.title ?? entry.eventId}</h2>
                  {event?.description && <p className={s.eventDescription}>{event.description}</p>}
                  {event?.hint && <p className={s.eventHint}>{event.hint}</p>}
                </div>
              </article>
            );
          })
        )}
      </div>

      <aside className={isForeseenOpen ? s.foreseenPanelOpen : s.foreseenPanel}>
        <button
          className={s.foreseenToggle}
          type="button"
          onClick={() => setIsForeseenOpen(open => !open)}
        >
          <span>Foreseen Events</span>
          <span>{foreseenEventIds.length}</span>
        </button>
        <div className={s.foreseenContent}>
          {foreseenItems.length === 0 ? (
            <p className={s.foreseenEmpty}>No active hints.</p>
          ) : (
            foreseenItems.map(({eventId, event}) => (
              <article className={s.foreseenItem} key={eventId}>
                <h3 className={s.foreseenTitle}>{event?.title ?? eventId}</h3>
                <p className={s.foreseenHint}>{event?.hint ?? event?.description ?? eventId}</p>
              </article>
            ))
          )}
        </div>
      </aside>
    </section>
  );
}

function getHistoryScrollTarget(
  historyEntryIds: readonly string[],
  lastSeenEntryId: string | undefined,
): string | undefined {
  if (historyEntryIds.length === 0) return undefined;

  const lastSeenIndex = lastSeenEntryId ? historyEntryIds.indexOf(lastSeenEntryId) : -1;
  if (lastSeenIndex < historyEntryIds.length - 1) {
    return historyEntryIds[lastSeenIndex + 1];
  }

  return undefined;
}

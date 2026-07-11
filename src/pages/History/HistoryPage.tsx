import {useEffect, useMemo, useRef, useState} from "react";
import {ConfirmationModal} from "../../components/ConfirmationModal.tsx";
import {GLOBAL_EVENTS} from "../../data/globalEvents/index.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {cleanSlateAndReload} from "../../store/cleanSlate.ts";
import {
  selectForeseenGlobalEventIds,
  selectGlobalEventHistoryEntries,
  selectLastSeenHistoryEntryId,
} from "../../store/globalEvents/selectors.ts";
import {markGlobalHistorySeen} from "../../store/globalEvents/slice.ts";
import type {GlobalEventHistoryEntry} from "../../models/store/globalEvents.ts";
import * as s from "./HistoryPage.css.ts";

export default function HistoryPage() {
  const dispatch = useTypedDispatch();
  const eventHistoryEntries = useTypedSelector(selectGlobalEventHistoryEntries);
  const foreseenEventIds = useTypedSelector(selectForeseenGlobalEventIds);
  const lastSeenEntryId = useTypedSelector(selectLastSeenHistoryEntryId);
  const eventRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isForeseenOpen, setIsForeseenOpen] = useState(true);
  const [isCleanSlateConfirmationOpen, setIsCleanSlateConfirmationOpen] = useState(false);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  const targetEventId = useMemo(
    () => getHistoryScrollTarget(eventHistoryEntries, lastSeenEntryId),
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
      <article className={s.book}>
        <header className={s.header}>
          <div className={s.headerText}>
            <p className={s.kicker}>Chronicle</p>
            <h1 className={s.title}>History</h1>
          </div>
          <button
            className={s.cleanSlateButton}
            type="button"
            onClick={() => setIsCleanSlateConfirmationOpen(true)}
          >
            Clean slate
          </button>
        </header>

        <div className={s.timeline}>
          {eventHistoryEntries.length === 0 ? (
            <p className={s.emptyState}>No global events have happened yet.</p>
          ) : (
            eventHistoryEntries.map((entry, index) => {
              const event = entry.eventId ? GLOBAL_EVENTS[entry.eventId] : undefined;
              const title = event?.title ?? entry.title ?? entry.eventId ?? "History Entry";
              const description = event?.description ?? entry.message;
              const imageSrc = event?.imageSrc ?? entry.imageUrl;
              const imageAlt = event?.imageAlt ?? title;
              const level = event?.notificationLevel ?? (entry.eventId ? "force" : "notify");

              return (
                <article
                  key={entry.id}
                  ref={element => {
                    eventRefs.current[entry.id] = element;
                  }}
                  className={highlightedEventId === entry.id ? s.eventCardHighlighted : s.eventCard}
                >
                  {imageSrc && (
                    <img
                      className={s.eventImage}
                      src={imageSrc}
                      alt={imageAlt}
                    />
                  )}
                  <div className={s.eventContent}>
                    <div className={s.eventMeta}>
                      <span>Chapter {String(index + 1).padStart(2, "0")}</span>
                      <span>{level}</span>
                    </div>
                    <h2 className={s.eventTitle}>{title}</h2>
                    {description && <p className={s.eventDescription}>{description}</p>}
                    {event?.hint && <p className={s.eventHint}>{event.hint}</p>}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <section className={isForeseenOpen ? s.foreseenPanelOpen : s.foreseenPanel}>
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
        </section>
      </article>
      {isCleanSlateConfirmationOpen && (
        <ConfirmationModal
          title="Clean slate?"
          message="This will wipe the saved city and start again from an empty settlement. This cannot be undone."
          confirmLabel="Clean slate"
          onConfirm={cleanSlateAndReload}
          onCancel={() => setIsCleanSlateConfirmationOpen(false)}
        />
      )}
    </section>
  );
}

function getHistoryScrollTarget(
  historyEntries: readonly GlobalEventHistoryEntry[],
  lastSeenEntryId: string | undefined,
): string | undefined {
  if (historyEntries.length === 0) return undefined;

  const lastSeenIndex = lastSeenEntryId
    ? historyEntries.findIndex(entry => entry.id === lastSeenEntryId)
    : -1;
  const unseenEntries = historyEntries.slice(lastSeenIndex + 1);
  const forceEntry = unseenEntries.find(entry => {
    if (!entry.eventId) return false;
    return (GLOBAL_EVENTS[entry.eventId]?.notificationLevel ?? "force") === "force";
  });

  if (forceEntry) return forceEntry.id;
  if (unseenEntries.length > 0) return unseenEntries[0].id;

  return undefined;
}

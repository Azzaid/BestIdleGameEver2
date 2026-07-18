import {useEffect, useMemo, useRef, useState, type CSSProperties} from "react";
import {ConfirmationModal} from "../../components/ConfirmationModal.tsx";
import {GLOBAL_EVENTS} from "../../data/globalEvents/index.ts";
import {
  DEVELOPMENT_VECTOR_LABELS,
  isDevelopmentVectorKey,
  type DevelopmentVectorKey,
} from "../../models/DevlopmentVector.ts";
import {getGlobalEventVector} from "../../models/globalEvents.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {cleanSlateAndReload} from "../../store/cleanSlate.ts";
import {
  selectForeseenGlobalEventIds,
  selectGlobalEventHistoryEntries,
  selectLastSeenHistoryEntryId,
  selectUnseenHistoryEntryIds,
} from "../../store/globalEvents/selectors.ts";
import {selectIsDebugModeEnabled} from "../../store/debug/selectors.ts";
import {markGlobalHistorySeen} from "../../store/globalEvents/slice.ts";
import type {GlobalEventHistoryEntry} from "../../models/store/globalEvents.ts";
import {selectNotifications, selectUnreadNotificationCount} from "../../store/notifications/selectors.ts";
import {markAllNotificationsRead} from "../../store/notifications/slice.ts";
import type {NotificationItem} from "../../models/notifications.ts";
import * as s from "./HistoryPage.css.ts";

type HistoryTab = "history" | "notifications";

export default function HistoryModal({
  onClose,
  topInsetPx = 0,
}: {
  onClose: () => void;
  topInsetPx?: number;
}) {
  const dispatch = useTypedDispatch();
  const eventHistoryEntries = useTypedSelector(selectGlobalEventHistoryEntries);
  const foreseenEventIds = useTypedSelector(selectForeseenGlobalEventIds);
  const lastSeenEntryId = useTypedSelector(selectLastSeenHistoryEntryId);
  const unseenHistoryEntryCount = useTypedSelector(selectUnseenHistoryEntryIds).length;
  const notifications = useTypedSelector(selectNotifications);
  const unreadNotificationCount = useTypedSelector(selectUnreadNotificationCount);
  const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
  const eventRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeTab, setActiveTab] = useState<HistoryTab>(() => (
    unseenHistoryEntryCount === 0 && unreadNotificationCount > 0 ? "notifications" : "history"
  ));
  const [isForeseenOpen, setIsForeseenOpen] = useState(true);
  const [isCleanSlateConfirmationOpen, setIsCleanSlateConfirmationOpen] = useState(false);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  const targetEventId = useMemo(
    () => getHistoryScrollTarget(eventHistoryEntries, lastSeenEntryId),
    [eventHistoryEntries, lastSeenEntryId],
  );
  const latestEntryId = eventHistoryEntries.at(-1)?.id;

  useEffect(() => {
    if (activeTab !== "history" || !targetEventId) return;

    setHighlightedEventId(targetEventId);
    const animationFrameId = requestAnimationFrame(() => {
      eventRefs.current[targetEventId]?.scrollIntoView({block: "start", behavior: "smooth"});
      if (latestEntryId) dispatch(markGlobalHistorySeen(latestEntryId));
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [activeTab, dispatch, latestEntryId, targetEventId]);

  useEffect(() => {
    if (activeTab === "notifications" && unreadNotificationCount > 0) {
      dispatch(markAllNotificationsRead());
    }
  }, [activeTab, dispatch, unreadNotificationCount]);

  useEffect(() => {
    if (!highlightedEventId) return;

    const timeoutId = window.setTimeout(() => setHighlightedEventId(null), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedEventId]);

  useEffect(() => {
    if (foreseenEventIds.length > 0) setIsForeseenOpen(true);
  }, [foreseenEventIds.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (isCleanSlateConfirmationOpen) {
        setIsCleanSlateConfirmationOpen(false);
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCleanSlateConfirmationOpen, onClose]);

  const foreseenItems = foreseenEventIds.map(eventId => ({
    eventId,
    event: GLOBAL_EVENTS[eventId],
  }));

  return (
    <section
      className={s.backdrop}
      role="presentation"
      style={{"--history-modal-top-inset": `${topInsetPx}px`} as CSSProperties}
      onClick={onClose}
    >
      <article
        className={s.book}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={s.bookSpine} aria-hidden />
        <div className={s.bookSurface}>
          <header className={s.header}>
            <div className={s.headerText}>
              <p className={s.kicker}>Chronicle</p>
              <h1 id="history-modal-title" className={s.title}>History</h1>
            </div>
            <div className={s.headerActions}>
              <button
                className={s.cleanSlateButton}
                type="button"
                onClick={() => setIsCleanSlateConfirmationOpen(true)}
              >
                Clean slate
              </button>
              <button
                className={s.closeButton}
                type="button"
                aria-label="Close history"
                title="Close history"
                onClick={onClose}
              >
                x
              </button>
            </div>
          </header>
          <nav className={s.tabs} aria-label="History sections">
            <button
              className={activeTab === "history" ? s.tabActive : s.tab}
              type="button"
              onClick={() => setActiveTab("history")}
            >
              <span>History</span>
              <span className={s.tabCount}>{eventHistoryEntries.length}</span>
            </button>
            <button
              className={activeTab === "notifications" ? s.tabActive : s.tab}
              type="button"
              onClick={() => setActiveTab("notifications")}
            >
              <span>Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className={s.tabUnread}>{unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}</span>
              )}
            </button>
          </nav>

          <div className={s.body}>
            {activeTab === "history" ? (
              <>
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
                      const eventVector = getHistoryEntryVector(entry, event);

                      return (
                        <article
                          key={entry.id}
                          ref={element => {
                            eventRefs.current[entry.id] = element;
                          }}
                          className={`${highlightedEventId === entry.id ? s.eventCardHighlighted : s.eventCard} ${s.eventTone[eventVector]}`}
                        >
                          <div className={s.eventContent}>
                            {isDebugModeEnabled && (
                              <div className={s.eventMeta}>
                                <span>Chapter {String(index + 1).padStart(2, "0")}</span>
                                <span>{DEVELOPMENT_VECTOR_LABELS[eventVector]}</span>
                                <span>{level}</span>
                              </div>
                            )}
                            <h2 className={s.eventTitle}>{title}</h2>
                            {event?.hint && <p className={s.eventHint}>{event.hint}</p>}
                            {imageSrc && (
                              <img
                                className={s.eventImage}
                                src={imageSrc}
                                alt={imageAlt}
                              />
                            )}
                            {description && <p className={s.eventDescription}>{description}</p>}
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
                        <article className={`${s.foreseenItem} ${s.eventTone[getGlobalEventVector(event)]}`} key={eventId}>
                          <h3 className={s.foreseenTitle}>{event?.title ?? eventId}</h3>
                          <p className={s.foreseenHint}>{event?.hint ?? event?.description ?? eventId}</p>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </>
            ) : (
              <div className={s.notificationsList}>
                {notifications.length === 0 ? (
                  <p className={s.emptyState}>No notifications yet.</p>
                ) : (
                  notifications.map(notification => (
                    <NotificationEntry notification={notification} key={notification.id} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </article>
      {isCleanSlateConfirmationOpen && (
        <div onClick={(event) => event.stopPropagation()}>
          <ConfirmationModal
            title="Clean slate?"
            message="This will wipe the saved city and start again from an empty settlement. This cannot be undone."
            confirmLabel="Clean slate"
            onConfirm={cleanSlateAndReload}
            onCancel={() => setIsCleanSlateConfirmationOpen(false)}
          />
        </div>
      )}
    </section>
  );
}

function NotificationEntry({notification}: {notification: NotificationItem}) {
  return (
    <article className={`${s.notificationCard} ${s.notificationTone[notification.scheme]}`}>
      {notification.imageUrl
        ? <img className={s.notificationImage} src={notification.imageUrl} alt="" />
        : <div className={s.notificationGlyph} aria-hidden>!</div>
      }
      <div className={s.notificationContent}>
        <div className={s.notificationMeta}>
          <span>{formatNotificationTime(notification.createdAt)}</span>
          {!notification.read && <span>New</span>}
        </div>
        <h2 className={s.eventTitle}>{notification.title}</h2>
        <p className={s.eventDescription}>{notification.message}</p>
      </div>
    </article>
  );
}

function getHistoryEntryVector(
  entry: GlobalEventHistoryEntry,
  event: (typeof GLOBAL_EVENTS)[string] | undefined,
): DevelopmentVectorKey {
  if (event) return getGlobalEventVector(event);

  return isDevelopmentVectorKey(entry.scheme) ? entry.scheme : "neutral";
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

function formatNotificationTime(createdAt: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAt);
}

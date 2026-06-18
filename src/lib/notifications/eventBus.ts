import type { NewNotification } from "../../models/notifications.ts";

const BUS_EVENT = "notify";

/**
 * A tiny, global event bus for app-wide notifications.
 * Components can import and call sendNotification() without Redux wiring.
 */
export const notificationBus = new EventTarget();

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Send a notification from anywhere in the app.
 * Listeners (NotificationCenter) will receive it and display toast + archive it.
 */
export function sendNotification(payload: NewNotification): string {
  const id = uid();
  const detail = { ...payload, __id: id };
  const ev = new CustomEvent<ReturnType<typeof Object>>(
    BUS_EVENT as string,
    { detail }
  );
  notificationBus.dispatchEvent(ev);
  return id;
}

/**
 * Low-level subscription helper (used by NotificationCenter).
 */
export function subscribeToNotifications(
  handler: (payload: NewNotification & { __id: string }) => void
): () => void {
  const onNotify = (e: Event) => {
    const ev = e as CustomEvent<NewNotification & { __id: string }>;
    handler(ev.detail);
  };
  notificationBus.addEventListener(BUS_EVENT, onNotify as EventListener);
  return () => notificationBus.removeEventListener(BUS_EVENT, onNotify as EventListener);
}

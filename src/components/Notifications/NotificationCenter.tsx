import { useEffect, useMemo, useState } from "react";
import type { NotificationItem, NotificationScheme, NewNotification } from "../../models/notifications.ts";
import { subscribeToNotifications } from "../../lib/notifications/eventBus.ts";
import { vars } from "../../theme/theme.css.ts";

type StyleMap = Record<NotificationScheme, { accent: string }>;

const styles: StyleMap = {
  neutral:        { accent: "hsl(32 22% 49%)" },
  tech:           { accent: "hsl(200 80% 45%)" },
  nature:         { accent: "hsl(140 28% 35%)" },
  medieval:       { accent: "hsl(354 42% 36%)" },
  aether:         { accent: "hsl(260 45% 45%)" },
  alert:          { accent: "hsl(0 75% 50%)" },
  warning:        { accent: "hsl(40 90% 50%)" },
  congratulation: { accent: "hsl(160 60% 40%)" },
};

const DEFAULT_TOAST_MS = 4000;

export function NotificationCenter() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const unreadCount = useMemo(() => items.reduce((acc, n) => acc + (n.read ? 0 : 1), 0), [items]);

  // Receive notifications from global bus
  useEffect(() => {
    return subscribeToNotifications((payload) => {
      const { __id, ...rest } = payload as NewNotification & { __id: string };
      const baseScheme = (rest.scheme in styles)
        ? (rest.scheme as NotificationScheme)
        : "tech";

      const createdAt = Date.now();
      const toastExpiresAt = createdAt + (rest.durationMs ?? DEFAULT_TOAST_MS);

      setItems((prev) => [
        {
          id: __id,
          title: rest.title,
          message: rest.message,
          imageUrl: rest.imageUrl,
          scheme: baseScheme,
          createdAt,
          toastExpiresAt,
          read: false,
        },
        ...prev,
      ]);
    });
  }, []);

  // Timer to update toast visibility
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const activeToasts = items.filter(n => n.toastExpiresAt > now).slice(0, 3);

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const closeToast = (id: string) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, toastExpiresAt: 0 } : n)));
  };

  // Themed styles (using vars)
  const bellBtnStyle: React.CSSProperties = {
    position: "fixed",
    top: 12,
    right: 12,
    zIndex: 1000,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 8,
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.navbar,
    color: vars.color.text.primary,
    cursor: "pointer",
  };

  const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    padding: "0 4px",
    borderRadius: 9,
    background: vars.color.state.error,
    color: vars.color.text.inverse,
    fontSize: 11,
    lineHeight: "18px",
    textAlign: "center",
    fontWeight: 700,
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: `translate(-50%, ${open ? "0" : "-110%"})`,
    transition: "transform 220ms ease",
    width: "min(680px, 96vw)",
    maxHeight: "70vh",
    overflow: "auto",
    zIndex: 999,
    background: vars.color.background.surface,
    color: vars.color.text.primary,
    border: `1px solid ${vars.color.border.default}`,
    borderTop: "none",
    borderRadius: "0 0 12px 12px",
    boxShadow: vars.color.shadow.popover,
  };

  const panelHeader: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: `1px solid ${vars.color.border.default}`,
    position: "sticky",
    top: 0,
    background: vars.color.background.surface,
    zIndex: 1,
  };

  const listStyle: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };

  const toastStackStyle: React.CSSProperties = {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  const notifCardStyle = (scheme: NotificationScheme): React.CSSProperties => ({
    display: "grid",
    gridTemplateColumns: "40px 1fr",
    gap: 12,
    alignItems: "start",
    padding: "10px 12px",
    borderTop: `3px solid ${styles[scheme].accent}`,
    background: vars.color.background.surfaceHover,
    color: vars.color.text.primary,
  });

  const imageStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    objectFit: "cover",
    borderRadius: 6,
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.background.surface,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    margin: 0,
    color: vars.color.text.heading,
  };

  const msgStyle: React.CSSProperties = {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.9,
    whiteSpace: "pre-line",
    lineHeight: 1.35,
  };

  const toastItemStyle = (scheme: NotificationScheme): React.CSSProperties => ({
    ...notifCardStyle(scheme),
    gridTemplateColumns: "32px 1fr 20px",
    padding: "8px 10px",
    borderRadius: 10,
    boxShadow: vars.color.shadow.card,
    alignItems: "start",
  });

  return (
    <>
      {/* Top-right bell */}
      <button
        type="button"
        aria-label="Notifications"
        style={bellBtnStyle}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) markAllRead();
        }}
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a6 6 0 0 0-6 6v3.586l-.707 1.707A1 1 0 0 0 6.223 15h11.554a1 1 0 0 0 .93-1.414L18 11.586V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.995-2.824L15 19h-6a3 3 0 0 0 2.824 2.995L12 22Z"/>
        </svg>
        {unreadCount > 0 && <span aria-label={`${unreadCount} unread`} style={badgeStyle}>{unreadCount}</span>}
      </button>

      {/* Slide-down panel */}
      <section role="region" aria-label="Notifications" style={panelStyle}>
        <header style={panelHeader}>
          <strong>Notifications</strong>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => markAllRead()}
              style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${vars.color.border.default}`, background: vars.color.background.surfaceHover, color: vars.color.text.primary, cursor: "pointer" }}
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${vars.color.border.default}`, background: vars.color.background.surfaceHover, color: vars.color.text.primary, cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </header>
        <ul style={listStyle}>
          {items.length === 0 && (
            <li style={{ padding: 16, color: vars.color.text.muted }}>No notifications yet.</li>
          )}
          {items.map(n => (
            <li key={n.id} style={{ borderBottom: `1px solid ${vars.color.border.default}` }}>
              <div style={notifCardStyle(n.scheme)}>
                {n.imageUrl
                  ? <img src={n.imageUrl} alt="" style={imageStyle} />
                  : <div style={{ ...imageStyle, display: "grid", placeItems: "center", fontSize: 18 }}>🛈</div>
                }
                <div>
                  <h6 style={titleStyle}>{n.title}</h6>
                  <div style={msgStyle}>{n.message}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Toasts (brief visibility) */}
      <div aria-live="polite" style={toastStackStyle}>
        {activeToasts.map(n => (
          <div key={n.id} style={toastItemStyle(n.scheme)}>
            {n.imageUrl
              ? <img src={n.imageUrl} alt="" style={{ ...imageStyle, width: 28, height: 28 }} />
              : <div style={{ ...imageStyle, width: 28, height: 28, display: "grid", placeItems: "center", fontSize: 16 }}>🛈</div>
            }
            <div>
              <div style={{ ...titleStyle, fontSize: 13 }}>{n.title}</div>
              <div style={{ ...msgStyle, fontSize: 12 }}>{n.message}</div>
            </div>
            <button
              aria-label="Dismiss"
              onClick={() => closeToast(n.id)}
              style={{ background: "transparent", border: "none", color: vars.color.text.primary, cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

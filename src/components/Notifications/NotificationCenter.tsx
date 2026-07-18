import {useEffect, useState, type CSSProperties} from "react";
import type {NotificationScheme, NewNotification} from "../../models/notifications.ts";
import {subscribeToNotifications} from "../../lib/notifications/eventBus.ts";
import {vars} from "../../theme/theme.css.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {selectNotifications} from "../../store/notifications/selectors.ts";
import {addNotificationItem, dismissNotificationToast} from "../../store/notifications/slice.ts";

type StyleMap = Record<NotificationScheme, { accent: string }>;

const styles: StyleMap = {
  neutral: {accent: "hsl(32 22% 49%)"},
  tech: {accent: "hsl(200 80% 45%)"},
  nature: {accent: "hsl(140 28% 35%)"},
  medieval: {accent: "hsl(354 42% 36%)"},
  aether: {accent: "hsl(260 45% 45%)"},
  alert: {accent: "hsl(0 75% 50%)"},
  warning: {accent: "hsl(40 90% 50%)"},
  congratulation: {accent: "hsl(160 60% 40%)"},
};

const neutralHud = {
  surface: "hsl(45 38% 86% / 0.72)",
  border: "hsl(32 22% 38% / 0.34)",
  glow: "0 0 18px hsl(186 54% 48% / 0.24), 0 10px 24px rgba(0, 0, 0, 0.18)",
};

export function NotificationCenter() {
  const dispatch = useTypedDispatch();
  const items = useTypedSelector(selectNotifications);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    return subscribeToNotifications((payload) => {
      const {__id, ...rest} = payload as NewNotification & { __id: string };
      dispatch(addNotificationItem({
        id: __id,
        createdAt: Date.now(),
        ...rest,
      }));
    });
  }, [dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(intervalId);
  }, []);

  const activeToasts = items.filter(notification => notification.toastExpiresAt > now).slice(0, 3);

  const toastStackStyle: CSSProperties = {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  const toastItemStyle = (scheme: NotificationScheme): CSSProperties => ({
    display: "grid",
    gridTemplateColumns: "32px 1fr 20px",
    gap: 12,
    alignItems: "start",
    padding: "8px 10px",
    border: `1px solid ${neutralHud.border}`,
    borderTop: `2px solid ${styles[scheme].accent}`,
    borderRadius: 6,
    background: `linear-gradient(145deg, rgba(255, 255, 255, 0.22), transparent 36%), ${neutralHud.surface}`,
    color: vars.color.text.primary,
    boxShadow: neutralHud.glow,
    backdropFilter: "blur(8px) saturate(1.14)",
  });

  const imageStyle: CSSProperties = {
    width: 28,
    height: 28,
    objectFit: "cover",
    borderRadius: 6,
    border: `1px solid ${neutralHud.border}`,
    background: vars.color.background.surface,
  };

  const titleStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    margin: 0,
    color: vars.color.text.heading,
  };

  const msgStyle: CSSProperties = {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
    whiteSpace: "pre-line",
    lineHeight: 1.35,
  };

  return (
    <div aria-live="polite" style={toastStackStyle}>
      {activeToasts.map(notification => (
        <div key={notification.id} style={toastItemStyle(notification.scheme)}>
          {notification.imageUrl
            ? <img src={notification.imageUrl} alt="" style={imageStyle} />
            : <div style={{...imageStyle, display: "grid", placeItems: "center", fontSize: 16}}>!</div>
          }
          <div>
            <div style={titleStyle}>{notification.title}</div>
            <div style={msgStyle}>{notification.message}</div>
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => dispatch(dismissNotificationToast(notification.id))}
            style={{background: "transparent", border: "none", color: vars.color.text.primary, cursor: "pointer"}}
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}

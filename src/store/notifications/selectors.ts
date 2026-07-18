import type {NotificationItem} from "../../models/notifications.ts";
import type {RootState} from "../../models/store/appStore.ts";

export const selectNotifications = (state: RootState): NotificationItem[] => state.notifications.items;

export const selectUnreadNotificationCount = (state: RootState): number => (
  state.notifications.items.reduce((count, notification) => count + (notification.read ? 0 : 1), 0)
);

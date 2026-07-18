import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {NewNotification, NotificationItem, NotificationScheme} from "../../models/notifications.ts";
import type {NotificationsState} from "../../models/store/notifications.ts";

const DEFAULT_TOAST_MS = 4000;
const KNOWN_SCHEMES: readonly NotificationScheme[] = [
  "neutral",
  "tech",
  "nature",
  "medieval",
  "aether",
  "alert",
  "warning",
  "congratulation",
];

type AddNotificationPayload = NewNotification & {
  id: string;
  createdAt: number;
};

const initialState: NotificationsState = {
  items: [],
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotificationItem: (state, action: PayloadAction<AddNotificationPayload>) => {
      const scheme = KNOWN_SCHEMES.includes(action.payload.scheme)
        ? action.payload.scheme
        : "tech";
      state.items.unshift({
        id: action.payload.id,
        title: action.payload.title,
        message: action.payload.message,
        imageUrl: action.payload.imageUrl,
        scheme,
        createdAt: action.payload.createdAt,
        toastExpiresAt: action.payload.createdAt + (action.payload.durationMs ?? DEFAULT_TOAST_MS),
        read: false,
      });
    },
    dismissNotificationToast: (state, action: PayloadAction<string>) => {
      const item = state.items.find(notification => notification.id === action.payload);
      if (item) item.toastExpiresAt = 0;
    },
    markAllNotificationsRead: (state) => {
      for (const item of state.items) {
        item.read = true;
      }
    },
  },
});

export const {
  addNotificationItem,
  dismissNotificationToast,
  markAllNotificationsRead,
} = notificationsSlice.actions;

export default notificationsSlice;

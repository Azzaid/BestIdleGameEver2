import type { DevelopmentVectorKey } from "./DevlopmentVector.ts";

export type ExtraScheme = "alert" | "warning" | "congratulation";
export type NotificationScheme = DevelopmentVectorKey | ExtraScheme;

export type NewNotification = {
  title: string;
  message: string;
  imageUrl?: string;
  scheme: NotificationScheme;
  // Optional override for toast lifetime in ms (default 4000)
  durationMs?: number;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  scheme: NotificationScheme;
  createdAt: number;
  toastExpiresAt: number; // <= now => toast hidden, but item remains in history
  read: boolean;
};

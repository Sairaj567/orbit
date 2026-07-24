import { create } from 'zustand';

interface NotificationItem {
  id: string;
  title: string;
  read: boolean;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  setItems: (items: NotificationItem[]) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  setItems: (items) => set({ items, unreadCount: items.filter((item) => !item.read).length }),
  markAllRead: () => set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })), unreadCount: 0 })),
}));
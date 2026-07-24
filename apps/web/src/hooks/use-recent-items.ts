import { useState, useEffect, useCallback } from 'react';

export type SearchResultType = 'project' | 'task' | 'note' | 'resource' | 'habit' | 'member';

export interface RecentItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  path: string;
  projectId?: string;
}

const STORAGE_KEY = 'orbit:recent-search-items';
const MAX_ITEMS = 10;

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Load initial items
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse recent items', e);
    }
  }, []);

  const addRecentItem = useCallback((item: RecentItem) => {
    setRecentItems((prev) => {
      // Remove item if it already exists to move it to the top
      const filtered = prev.filter((i) => i.id !== item.id);
      const newItems = [item, ...filtered].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      } catch (e) {
        console.error('Failed to save recent items', e);
      }
      
      return newItems;
    });
  }, []);

  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear recent items', e);
    }
  }, []);

  return {
    recentItems,
    addRecentItem,
    clearRecentItems,
  };
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentDocument {
  id: string;
  title: string;
  viewedAt: string;
}

interface RecentStore {
  recents: RecentDocument[];
  addRecent: (doc: Omit<RecentDocument, 'viewedAt'>) => void;
  removeRecent: (docId: string) => void;
  clearRecents: () => void;
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set, get) => ({
      recents: [],
      addRecent: (doc) => {
        const current = get().recents;
        // 移除已存在的（如果有）
        const filtered = current.filter((r) => r.id !== doc.id);
        // 添加到开头，保留最多 10 条
        const newRecent = { ...doc, viewedAt: new Date().toISOString() };
        set({ recents: [newRecent, ...filtered].slice(0, 10) });
      },
      removeRecent: (docId) => {
        set({ recents: get().recents.filter((r) => r.id !== docId) });
      },
      clearRecents: () => {
        set({ recents: [] });
      },
    }),
    {
      name: 'recent-documents',
    }
  )
);

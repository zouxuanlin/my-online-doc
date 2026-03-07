import { create } from 'zustand';
import { Folder } from '../services/folder.service';

interface FolderState {
  folders: Folder[];
  selectedFolderId: string | null;
  isLoading: boolean;
  setFolders: (folders: Folder[]) => void;
  setSelectedFolderId: (id: string | null) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, data: Partial<Folder>) => void;
  removeFolder: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useFolderStore = create<FolderState>((set) => ({
  folders: [],
  selectedFolderId: null,
  isLoading: false,

  setFolders: (folders) => set({ folders }),

  setSelectedFolderId: (id) => set({ selectedFolderId: id }),

  addFolder: (folder) =>
    set((state) => ({ folders: [...state.folders, folder] })),

  updateFolder: (id, data) =>
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),

  removeFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}));

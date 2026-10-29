import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface FileItem extends File {
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface FileStore {
  files: FileItem[];
  setFiles: (files: FileItem[]) => void;
  clearFiles: () => void;
  addFile: (file: FileItem) => void;
  removeFile: (fileName: string) => void;
}

export const useFileStore = create<FileStore>()(
  devtools((set) => ({
    files: [],
    setFiles: (files: FileItem[]) => set({ files }),
    clearFiles: () => set({ files: [] }),
    addFile: (file: FileItem) =>
      set((state) => ({
        files: [...state.files, file],
      })),
    removeFile: (fileName: string) =>
      set((state) => ({
        files: state.files.filter((file) => file.name !== fileName),
      })),
  }))
);

import { create } from "zustand";


export const useDocumentStore = create((set) => ({
  activeDocument: null,
  saveStatus: "saved", // 'saved' | 'saving' | 'failed'
  lastSavedAt: null,
  isDirty: false,
  wordCount: 0,
  charCount: 0,
  retryPayload: null,

  setActiveDocument: (doc) =>
    set({
      activeDocument: doc,
      saveStatus: "saved",
      isDirty: false,
      lastSavedAt: doc?.updated_at || new Date().toISOString(),
      retryPayload: null,
    }),

  setSaveStatus: (status) => set({ saveStatus: status }),

  markDirty: () => set({ isDirty: true, saveStatus: "saving" }),

  markSaved: (updatedAt = new Date().toISOString()) =>
    set({
      isDirty: false,
      saveStatus: "saved",
      lastSavedAt: updatedAt,
      retryPayload: null,
    }),

  markSaveFailed: (payload) =>
    set({
      saveStatus: "failed",
      retryPayload: payload,
    }),

  setCounts: (wordCount, charCount) => set({ wordCount, charCount }),

  resetStore: () =>
    set({
      activeDocument: null,
      saveStatus: "saved",
      lastSavedAt: null,
      isDirty: false,
      wordCount: 0,
      charCount: 0,
      retryPayload: null,
    }),
}));

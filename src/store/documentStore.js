import { create } from "zustand";

/**
 * Zustand Store: Active Document Editor Runtime State
 *
 * Architectural rationale:
 * - High-frequency editor operations (keystroke counting, auto-save status transitions,
 *   pending retry queues) shouldn't cause widespread context re-renders.
 * - Context API handles app-wide concerns (Auth, Theme, Toast).
 * - Zustand isolates the active editing session state with fine-grained selectors.
 */
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

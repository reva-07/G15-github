import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { createEmptyDocument } from "../utils/documentUtils";

// This hook is called ONCE, at the top of App.jsx.
// Dashboard and Editor both receive its return value as props,
// so they always see the exact same document list (no stale copies).
export function useDocuments() {
  const [documents, setDocuments] = useLocalStorage("documents", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Runs once: if there are no documents saved yet, fetch sample ones
  // from a local JSON file — simulating a real API call.
  useEffect(() => {
    async function loadInitialDocuments() {
      if (documents.length > 0) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("/mock-data.json");
        const sampleDocuments = await response.json();
        setDocuments(sampleDocuments);
      } catch (error) {
        console.error("Could not load sample documents:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createDocument = useCallback(() => {
    const newDoc = createEmptyDocument();
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc.id;
  }, [setDocuments]);

  const updateDocument = useCallback(
    (id, updates) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
            : doc
        )
      );
    },
    [setDocuments]
  );

  const deleteDocument = useCallback(
    (id) => {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    },
    [setDocuments]
  );

  const getDocumentById = useCallback(
    (id) => documents.find((doc) => doc.id === id),
    [documents]
  );

  // Recomputed only when documents or searchTerm actually change.
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) return documents;
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  return {
    documents: filteredDocuments,
    allDocumentsCount: documents.length,
    loading,
    searchTerm,
    setSearchTerm,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
  };
}
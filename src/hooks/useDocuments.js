import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../services/api";
import { useAuth } from "./useAuth";
import { useDebounce } from "./useDebounce";

/**
 * Enhanced useDocuments Hook
 * Manages document fetching, debounced search, sorting, filtering, and CRUD operations
 * through the unified API layer (Supabase PostgreSQL / Isolated Local DB).
 */
export function useDocuments({ view = "all" } = {}) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Debounce
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Sorting
  const [sortBy, setSortBy] = useState("updated_at"); // 'updated_at' | 'title'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Asynchronous data loading with cancel guard (avoids synchronous setState in effect)
  useEffect(() => {
    let ignore = false;

    async function loadDocuments() {
      if (!user) return;
      try {
        const data = await api.documents.list({
          currentUser: user,
          view,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        });
        if (!ignore) {
          setDocuments(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load documents:", err);
          setError(err?.message || "Could not load documents.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      ignore = true;
    };
  }, [user, view, debouncedSearch, sortBy, sortOrder]);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.documents.list({
        currentUser: user,
        view,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });
      setDocuments(data);
    } catch (err) {
      console.error("Failed to refetch documents:", err);
      setError(err?.message || "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, [user, view, debouncedSearch, sortBy, sortOrder]);

  // Document CRUD Operations
  const createDocument = useCallback(
    async ({ title, content } = {}) => {
      if (!user) throw new Error("Must be logged in to create documents");
      const created = await api.documents.create({
        currentUser: user,
        title: title || "Untitled document",
        content: content || "<p>Start writing...</p>",
      });

      setDocuments((prev) => [created, ...prev]);
      return created;
    },
    [user]
  );

  const updateDocument = useCallback(
    async (id, updates) => {
      if (!user) return;
      const updated = await api.documents.update(id, updates, user);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...updated } : doc))
      );
      return updated;
    },
    [user]
  );

  const duplicateDocument = useCallback(
    async (id) => {
      if (!user) return;
      const copy = await api.documents.duplicate(id, user);
      setDocuments((prev) => [copy, ...prev]);
      return copy;
    },
    [user]
  );

  const toggleStar = useCallback(
    async (id, is_starred) => {
      if (!user) return;
      // Optimistic update
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, is_starred } : doc))
      );
      try {
        await api.documents.toggleStar(id, is_starred, user);
      } catch (err) {
        // Rollback on failure
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? { ...doc, is_starred: !is_starred } : doc))
        );
        throw err;
      }
    },
    [user]
  );

  const toggleTrash = useCallback(
    async (id, is_trashed) => {
      if (!user) return;
      await api.documents.toggleTrash(id, is_trashed, user);
      // Remove from current view if it was trashed/restored
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    },
    [user]
  );

  const deletePermanently = useCallback(
    async (id) => {
      if (!user) return;
      await api.documents.deletePermanently(id, user);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    },
    [user]
  );

  const renameDocument = useCallback(
    async (id, newTitle) => {
      return updateDocument(id, { title: newTitle });
    },
    [updateDocument]
  );

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  }, []);

  // Pagination calculation
  const totalItems = documents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return documents.slice(startIndex, startIndex + pageSize);
  }, [documents, currentPage, pageSize]);

  return {
    documents: paginatedDocuments,
    allDocuments: documents,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    loading,
    error,
    searchTerm,
    setSearchTerm: handleSearchChange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleSortChange,
    refetch,
    createDocument,
    updateDocument,
    duplicateDocument,
    toggleStar,
    toggleTrash,
    deletePermanently,
    renameDocument,
  };
}

import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import DocumentCard from "../components/DocumentCard";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import CreateDocModal from "../components/CreateDocModal";
import ShareDocModal from "../components/ShareDocModal";
import ConfirmModal from "../components/ConfirmModal";
import Modal from "../components/Modal";
import InputField from "../components/InputField";
import { useDocuments } from "../hooks/useDocuments";
import { useToast } from "../hooks/useToast";

export default function Dashboard({ defaultView = "all" }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const filter = searchParams.get("filter") || defaultView;
  const {
    documents,
    allDocuments,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    sortOrder,
    handleSortChange,
    refetch,
    createDocument,
    duplicateDocument,
    toggleStar,
    toggleTrash,
    renameDocument,
  } = useDocuments({ view: filter });

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [renameDoc, setRenameDoc] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Handlers
  async function handleCreate(templateData) {
    setIsProcessing(true);
    try {
      const created = await createDocument(templateData);
      setIsCreateOpen(false);
      addToast(`Created "${created.title}"`, "success");
      navigate(`/documents/${created.id}`);
    } catch (err) {
      addToast(err?.message || "Failed to create document", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDuplicate(id) {
    try {
      const copy = await duplicateDocument(id);
      addToast(`Duplicated as "${copy.title}"`, "success");
    } catch {
      addToast("Failed to duplicate document", "error");
    }
  }

  async function handleToggleStar(id, is_starred) {
    try {
      await toggleStar(id, is_starred);
      addToast(is_starred ? "Added to Starred" : "Removed from Starred", "info");
    } catch {
      addToast("Could not update star", "error");
    }
  }

  function handleStartRename(doc) {
    setRenameDoc(doc);
    setNewTitle(doc.title);
  }

  async function handleConfirmRename(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsProcessing(true);
    try {
      await renameDocument(renameDoc.id, newTitle.trim());
      addToast(`Renamed to "${newTitle.trim()}"`, "success");
      setRenameDoc(null);
    } catch {
      addToast("Failed to rename document", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirmMoveToTrash() {
    if (!deleteDoc) return;
    setIsProcessing(true);
    try {
      await toggleTrash(deleteDoc.id, true);
      addToast(`Moved "${deleteDoc.title}" to Trash`, "info");
      setDeleteDoc(null);
    } catch {
      addToast("Failed to move to trash", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  const pageTitle =
    filter === "starred"
      ? "Starred Documents"
      : filter === "owned"
      ? "My Documents"
      : filter === "shared"
      ? "Shared with Me"
      : "All Documents";

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      <div className="app-main">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={pageTitle}
        />

        <main className="dash-body">
          {/* Header & Controls Toolbar */}
          <div className="dash-toolbar">
            <div>
              <h1 className="dash-page-heading">{pageTitle}</h1>
              <p className="dash-page-sub">
                {totalItems} {totalItems === 1 ? "document" : "documents"} available
              </p>
            </div>

            <div className="toolbar-actions">
              <button
                className="btn-clay"
                onClick={() => setIsCreateOpen(true)}
              >
                + New document
              </button>

              <SearchBar value={searchTerm} onChange={setSearchTerm} />

              {/* Sort Selector */}
              <div className="sort-group">
                <label htmlFor="sort-select" className="sr-only">
                  Sort documents
                </label>
                <select
                  id="sort-select"
                  className="tb-select sort-select"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    handleSortChange(field, order);
                  }}
                  aria-label="Sort documents"
                >
                  <option value="updated_at-desc">Last modified (Newest)</option>
                  <option value="updated_at-asc">Last modified (Oldest)</option>
                  <option value="title-asc">Title (A - Z)</option>
                  <option value="title-desc">Title (Z - A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="error-banner" role="alert">
              <span>⚠ {error}</span>
              <button className="btn-ghost" onClick={refetch}>
                Retry
              </button>
            </div>
          )}

          {/* Document Content State */}
          {loading ? (
            <div className="doc-grid-skeleton" aria-busy="true" aria-label="Loading documents">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="skeleton-card" />
              ))}
            </div>
          ) : allDocuments.length === 0 ? (
            <EmptyState
              title={
                filter === "starred"
                  ? "No starred documents yet"
                  : "No documents yet"
              }
              message={
                filter === "starred"
                  ? "Star your favorite documents for quick access anytime."
                  : "Create your first document or pick a template to get started."
              }
              actionLabel="+ Create your first document"
              onAction={() => setIsCreateOpen(true)}
            />
          ) : documents.length === 0 ? (
            <EmptyState
              title="No matching documents"
              message={`Nothing found for "${searchTerm}". Try another search term.`}
              actionLabel="Clear Search"
              onAction={() => setSearchTerm("")}
            />
          ) : (
            <>
              <div className="doc-grid">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDelete={() => setDeleteDoc(doc)}
                    onRename={handleStartRename}
                    onDuplicate={handleDuplicate}
                    onToggleStar={handleToggleStar}
                    onShare={(docToShare) => setShareDoc(docToShare)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateDocModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        isCreating={isProcessing}
      />

      <ShareDocModal
        isOpen={Boolean(shareDoc)}
        onClose={() => setShareDoc(null)}
        document={shareDoc}
      />

      <ConfirmModal
        isOpen={Boolean(deleteDoc)}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleConfirmMoveToTrash}
        title="Move to Trash"
        message={`Are you sure you want to move "${deleteDoc?.title}" to trash? You can restore it later from the Trash folder.`}
        confirmLabel="Move to Trash"
        confirmVariant="danger"
        isProcessing={isProcessing}
      />

      {/* Rename Modal */}
      <Modal
        isOpen={Boolean(renameDoc)}
        onClose={() => setRenameDoc(null)}
        title="Rename Document"
        maxWidth="440px"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setRenameDoc(null)}>
              Cancel
            </button>
            <button
              className="btn-clay"
              onClick={handleConfirmRename}
              disabled={isProcessing || !newTitle.trim()}
            >
              {isProcessing ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleConfirmRename}>
          <InputField
            id="rename-input"
            label="Document Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
}

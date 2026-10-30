import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import DocumentCard from "../components/DocumentCard";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import CreateDocModal from "../components/CreateDocModal";
import { useDocuments } from "../hooks/useDocuments";
import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom";

export default function Trash() {
  const navigate = useNavigate();
  const { addToast } = useToast();
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
    createDocument,
    toggleTrash,
    deletePermanently,
    refetch,
  } = useDocuments({ view: "trash" });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [permanentDeleteDoc, setPermanentDeleteDoc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleRestore(id) {
    try {
      await toggleTrash(id, false);
      addToast("Document restored to your library", "success");
    } catch {
      addToast("Failed to restore document", "error");
    }
  }

  async function handleConfirmPermanentDelete() {
    if (!permanentDeleteDoc) return;
    setIsProcessing(true);
    try {
      await deletePermanently(permanentDeleteDoc.id);
      addToast(`Permanently deleted "${permanentDeleteDoc.title}"`, "info");
      setPermanentDeleteDoc(null);
    } catch (err) {
      addToast(err?.message || "Failed to delete permanently", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCreate(templateData) {
    setIsProcessing(true);
    try {
      const created = await createDocument(templateData);
      setIsCreateOpen(false);
      navigate(`/documents/${created.id}`);
    } catch {
      addToast("Failed to create document", "error");
    } finally {
      setIsProcessing(false);
    }
  }

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
          title="Trash"
        />

        <main className="dash-body">
          <div className="dash-toolbar">
            <div>
              <h1 className="dash-page-heading">Trash</h1>
              <p className="dash-page-sub">
                Items in trash can be restored or deleted permanently.
              </p>
            </div>

            <div className="toolbar-actions">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <span>⚠ {error}</span>
              <button className="btn-ghost" onClick={refetch}>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="doc-grid-skeleton" aria-busy="true">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-card" />
              ))}
            </div>
          ) : allDocuments.length === 0 ? (
            <EmptyState
              title="Trash is empty"
              message="Documents you delete will show up here before permanent removal."
            />
          ) : documents.length === 0 ? (
            <EmptyState
              title="No matching trashed documents"
              message={`No trashed documents match "${searchTerm}".`}
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
                    isTrashView={true}
                    onRestore={handleRestore}
                    onDelete={() => setPermanentDeleteDoc(doc)}
                  />
                ))}
              </div>

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

      <CreateDocModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        isCreating={isProcessing}
      />

      <ConfirmModal
        isOpen={Boolean(permanentDeleteDoc)}
        onClose={() => setPermanentDeleteDoc(null)}
        onConfirm={handleConfirmPermanentDelete}
        title="Delete Permanently"
        message={`Are you sure you want to permanently delete "${permanentDeleteDoc?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Forever"
        confirmVariant="danger"
        isProcessing={isProcessing}
      />
    </div>
  );
}

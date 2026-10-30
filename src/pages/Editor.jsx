import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import ShareDocModal from "../components/ShareDocModal";
import VersionHistoryModal from "../components/VersionHistoryModal";
import { countWordsAndChars, normalizeUrl } from "../utils/documentUtils";
import { getItem } from "../utils/Storage";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useDocumentStore } from "../store/documentStore";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Fine-grained primitive Zustand store selectors (prevents infinite re-render loops)
  const saveStatus = useDocumentStore((state) => state.saveStatus);
  const words = useDocumentStore((state) => state.wordCount);
  const chars = useDocumentStore((state) => state.charCount);

  // Synchronous cache lookup so paper mounts immediately without blank screens
  const [doc, setDoc] = useState(() => {
    try {
      const docs = getItem("gdocs_documents", null) || getItem("documents", null);
      if (Array.isArray(docs)) {
        return docs.find((d) => String(d.id) === String(id)) || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [title, setTitle] = useState(() => doc?.title || "Untitled document");
  const [content, setContent] = useState(() => doc?.content || "");
  const [loading, setLoading] = useState(() => !doc);
  const [error, setError] = useState(null);
  const [isStarred, setIsStarred] = useState(() => Boolean(doc?.is_starred));

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // DOM Ref for contentEditable paper
  const editorRef = useRef(null);
  const initializedDocIdRef = useRef(null);
  const saveSeqRef = useRef(0);

  // Initialize paper innerHTML as soon as editorRef is attached and doc is loaded
  useEffect(() => {
    if (doc && editorRef.current && initializedDocIdRef.current !== doc.id) {
      editorRef.current.innerHTML = doc.content || "";
      initializedDocIdRef.current = doc.id;
      editorRef.current.focus();
    }
  }, [doc]);

  // Asynchronously verify document or load from cloud backend
  useEffect(() => {
    let mounted = true;

    async function loadDoc() {
      try {
        const data = await api.documents.getById(id, user);
        if (!mounted) return;
        setDoc(data);
        setTitle(data.title || "Untitled document");
        setContent(data.content || "");
        setIsStarred(Boolean(data.is_starred));
        useDocumentStore.getState().markSaved(data.updated_at);

        const { words: w, chars: c } = countWordsAndChars(data.content || "");
        useDocumentStore.getState().setCounts(w, c);

        if (editorRef.current && initializedDocIdRef.current !== data.id) {
          editorRef.current.innerHTML = data.content || "";
          initializedDocIdRef.current = data.id;
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Error loading document:", err);
        setError(err?.message || "Document not found or access denied.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (id && (!doc || String(doc.id) !== String(id))) {
      loadDoc();
    } else if (doc) {
      useDocumentStore.getState().markSaved(doc.updated_at);
      const { words: w, chars: c } = countWordsAndChars(doc.content || "");
      useDocumentStore.getState().setCounts(w, c);
    }

    return () => {
      mounted = false;
    };
  }, [id, user, doc]);

  // Persist save to API with concurrency guard
  const persistChanges = useCallback(
    async (currentTitle, currentContent) => {
      const currentSeq = ++saveSeqRef.current;
      useDocumentStore.getState().setSaveStatus("saving");

      try {
        const updated = await api.documents.update(
          id,
          { title: currentTitle, content: currentContent },
          user
        );

        if (currentSeq === saveSeqRef.current) {
          useDocumentStore.getState().markSaved(updated.updated_at || new Date().toISOString());
          setDoc((prev) => (prev ? { ...prev, ...updated } : updated));
        }
      } catch (err) {
        if (currentSeq === saveSeqRef.current) {
          console.error("Auto-save failed:", err);
          useDocumentStore.getState().markSaveFailed({ title: currentTitle, content: currentContent });
          addToast("Failed to auto-save changes. Click 'Retry' to try again.", "error");
        }
      }
    },
    [id, user, addToast]
  );

  // Debounced auto-save effect
  useEffect(() => {
    if (!doc || loading) return;
    if (title === doc.title && content === doc.content) return;

    const timer = setTimeout(() => {
      persistChanges(title, content);
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, doc, loading, persistChanges]);

  // Content change handler for contentEditable
  function handleContentChange() {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    setContent(newHtml);
    useDocumentStore.getState().markDirty();

    const { words: w, chars: c } = countWordsAndChars(newHtml);
    useDocumentStore.getState().setCounts(w, c);
  }

  function handlePaperClick(e) {
    const anchor = e.target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href) return;

    // Prevent default in-app navigation so the editor is never unloaded unexpectedly
    e.preventDefault();

    const safeUrl = normalizeUrl(href);
    if (safeUrl) {
      window.open(safeUrl, "_blank", "noopener,noreferrer");
    }
  }

  function handleTitleChange(e) {
    setTitle(e.target.value);
    useDocumentStore.getState().markDirty();
  }

  async function handleToggleStar() {
    const nextStarred = !isStarred;
    setIsStarred(nextStarred);
    try {
      await api.documents.toggleStar(id, nextStarred, user);
      addToast(nextStarred ? "Starred document" : "Removed star", "info");
    } catch {
      setIsStarred(!nextStarred);
      addToast("Failed to star document", "error");
    }
  }

  function handleManualRetry() {
    persistChanges(title, content);
  }

  async function handleRestoreFromTrash() {
    try {
      await api.documents.toggleTrash(id, false, user);
      setDoc((prev) => (prev ? { ...prev, is_trashed: false } : prev));
      addToast("Document restored to your library", "success");
    } catch {
      addToast("Failed to restore document", "error");
    }
  }

  function handleRestoreVersion(versionData) {
    setTitle(versionData.title);
    setContent(versionData.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = versionData.content;
    }
    const { words: w, chars: c } = countWordsAndChars(versionData.content);
    useDocumentStore.getState().setCounts(w, c);
    persistChanges(versionData.title, versionData.content);
  }

  if (loading && !doc) {
    return (
      <div className="editor-loading-screen" role="status">
        <div className="loading-spinner" />
        <p>Opening document...</p>
      </div>
    );
  }

  if (error && !doc) {
    return (
      <div className="editor-error-screen">
        <div className="empty-state">
          <h3>Document Unavailable</h3>
          <p>{error || "This document could not be found or you do not have permission to view it."}</p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>
            ← Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page-wrap">
      {/* Top Navbar */}
      <header className="editor-navbar">
        <div className="editor-title-group">
          <button
            className="back-btn"
            aria-label="Back to dashboard"
            onClick={() => navigate("/dashboard")}
            title="Back to dashboard"
          >
            ←
          </button>

          <input
            className="doc-title-input"
            value={title}
            onChange={handleTitleChange}
            aria-label="Document title"
            placeholder="Untitled document"
          />

          <button
            className={`editor-star-btn ${isStarred ? "starred" : ""}`}
            onClick={handleToggleStar}
            aria-label={isStarred ? "Unstar document" : "Star document"}
            title={isStarred ? "Unstar document" : "Star document"}
          >
            {isStarred ? "★" : "☆"}
          </button>
        </div>

        <div className="editor-right-actions">
          {/* Save Status Indicator */}
          <div className="save-status" role="status" aria-live="polite">
            <span
              className={`save-dot ${
                saveStatus === "saving"
                  ? "saving"
                  : saveStatus === "failed"
                  ? "failed"
                  : "saved"
              }`}
            />
            {saveStatus === "saving" && <span>Saving...</span>}
            {saveStatus === "saved" && <span>Saved</span>}
            {saveStatus === "failed" && (
              <span className="save-failed-text">
                Save failed ·{" "}
                <button
                  type="button"
                  className="retry-inline-btn"
                  onClick={handleManualRetry}
                >
                  Retry
                </button>
              </span>
            )}
          </div>

          {/* Version History Button */}
          <button
            className="btn-ghost editor-action-btn"
            onClick={() => setIsHistoryOpen(true)}
            title="View revision history"
          >
            🕒 History
          </button>

          {/* Share Button */}
          <button
            className="btn-clay editor-action-btn"
            onClick={() => setIsShareOpen(true)}
            title="Share document with collaborators"
          >
            👥 Share
          </button>
        </div>
      </header>

      {/* Trashed Notice Banner */}
      {doc?.is_trashed && (
        <div className="trash-banner" style={{ background: "#fef3c7", color: "#92400e", padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #fde68a", fontSize: "13px" }}>
          <span>⚠️ This document is in your Trash folder.</span>
          <button
            type="button"
            className="btn-clay"
            style={{ padding: "4px 12px", fontSize: "12px" }}
            onClick={handleRestoreFromTrash}
          >
            Restore to Library
          </button>
        </div>
      )}

      {/* Formatting Toolbar */}
      <Toolbar editorRef={editorRef} onContentChange={handleContentChange} />

      {/* Editor Paper Canvas */}
      <main className="editor-canvas-wrap">
        <div
          className="paper"
          contentEditable
          suppressContentEditableWarning
          ref={editorRef}
          onInput={handleContentChange}
          onClick={handlePaperClick}
          aria-label="Document content"
          role="textbox"
          aria-multiline="true"
        />
      </main>

      {/* Editor Footer Status Bar */}
      <footer className="editor-footer">
        <span>
          {words} {words === 1 ? "word" : "words"} · {chars} {chars === 1 ? "character" : "characters"}
        </span>
        <span>Auto-saves a second after you stop typing</span>
      </footer>

      {/* Modals */}
      <ShareDocModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        document={{ ...doc, title }}
      />

      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        documentId={doc?.id || id}
        currentTitle={title}
        currentContent={content}
        onRestore={handleRestoreVersion}
      />
    </div>
  );
}

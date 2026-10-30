import { useState, useEffect } from "react";
import Modal from "./Modal";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { formatRelativeTime } from "../utils/documentUtils";

export default function VersionHistoryModal({
  isOpen,
  onClose,
  documentId,
  currentTitle,
  currentContent,
  onRestore,
}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen || !documentId) return;
    let mounted = true;

    async function loadVersions() {
      setLoading(true);
      try {
        const list = await api.versions.list(documentId);
        if (mounted) {
          setVersions(list);
          if (list.length > 0) {
            setSelectedVersion(list[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load versions:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadVersions();
    return () => {
      mounted = false;
    };
  }, [isOpen, documentId]);

  async function handleCreateSnapshot() {
    setCreating(true);
    try {
      const snap = await api.versions.createSnapshot(
        documentId,
        currentTitle,
        currentContent,
        user
      );
      setVersions((prev) => [snap, ...prev]);
      setSelectedVersion(snap);
      addToast("Created version snapshot", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to create snapshot", "error");
    } finally {
      setCreating(false);
    }
  }

  function handleRestoreSelected() {
    if (!selectedVersion) return;
    onRestore({
      title: selectedVersion.title,
      content: selectedVersion.content,
    });
    addToast(`Restored version from ${formatRelativeTime(selectedVersion.created_at)}`, "success");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Version History & Snapshots"
      maxWidth="720px"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <button
            className="btn-ghost"
            onClick={handleCreateSnapshot}
            disabled={creating}
          >
            {creating ? "Saving..." : "+ Take snapshot of current state"}
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-ghost" onClick={onClose}>
              Close
            </button>
            <button
              className="btn-clay"
              disabled={!selectedVersion}
              onClick={handleRestoreSelected}
            >
              Restore this version
            </button>
          </div>
        </div>
      }
    >
      <div className="version-modal-layout">
        {/* Left column: version timeline */}
        <div className="version-list-pane">
          {loading ? (
            <p style={{ padding: "12px", color: "var(--ink-soft)" }}>Loading snapshots...</p>
          ) : versions.length === 0 ? (
            <p style={{ padding: "12px", color: "var(--ink-soft)", fontSize: "13px" }}>
              No snapshots yet. Click "Take snapshot" below to record this revision.
            </p>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id}
                className={`version-item ${
                  selectedVersion?.id === ver.id ? "active" : ""
                }`}
                onClick={() => setSelectedVersion(ver)}
                role="button"
                tabIndex={0}
              >
                <div className="version-item-title">{ver.title}</div>
                <div className="version-item-time">
                  {new Date(ver.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right column: preview pane */}
        <div className="version-preview-pane">
          {selectedVersion ? (
            <div>
              <h3 style={{ marginBottom: "8px", fontSize: "16px" }}>
                {selectedVersion.title}
              </h3>
              <div
                className="version-preview-content"
                dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
              />
            </div>
          ) : (
            <p style={{ color: "var(--ink-soft)", textAlign: "center", marginTop: "40px" }}>
              Select a version to preview content.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

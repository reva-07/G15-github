import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime, extractPlainText } from "../utils/documentUtils";
import DropdownMenu from "./DropdownMenu";

export default function DocumentCard({
  document: doc,
  onDelete,
  onRename,
  onDuplicate,
  onToggleStar,
  onRestore,
  onShare,
  isTrashView = false,
}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleOpen() {
    if (isTrashView) return;
    navigate(`/documents/${doc.id}`);
  }

  function handleStarClick(e) {
    e.stopPropagation();
    if (onToggleStar) {
      onToggleStar(doc.id, !doc.is_starred);
    }
  }

  function handleDirectDelete(e) {
    e.stopPropagation();
    if (onDelete) {
      onDelete(doc.id, isTrashView);
    }
  }

  const preview = extractPlainText(doc.content);

  const menuItems = isTrashView
    ? [
        {
          label: "Restore Document",
          icon: "↺",
          onClick: () => onRestore && onRestore(doc.id),
        },
        {
          label: "Delete Permanently",
          icon: "🗑️",
          danger: true,
          onClick: () => onDelete && onDelete(doc.id, true),
        },
      ]
    : [
        {
          label: "Open Editor",
          icon: "✏️",
          onClick: handleOpen,
        },
        {
          label: doc.is_starred ? "Remove from Starred" : "Add to Starred",
          icon: doc.is_starred ? "★" : "☆",
          onClick: () => onToggleStar && onToggleStar(doc.id, !doc.is_starred),
        },
        {
          label: "Rename",
          icon: "🏷️",
          onClick: () => onRename && onRename(doc),
        },
        {
          label: "Duplicate",
          icon: "📋",
          onClick: () => onDuplicate && onDuplicate(doc.id),
        },
        {
          label: "Share",
          icon: "👥",
          onClick: () => onShare && onShare(doc),
        },
        { divider: true },
        {
          label: "Move to Trash",
          icon: "🗑️",
          danger: true,
          onClick: () => onDelete && onDelete(doc.id, false),
        },
      ];

  return (
    <div
      className={`doc-card ${isTrashView ? "doc-card-trashed" : ""} ${isMenuOpen ? "menu-open" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`${isTrashView ? "Trashed document" : "Open"} ${doc.title || "Untitled document"}`}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isTrashView) handleOpen();
      }}
    >
      {/* Document preview header */}
      <div className="doc-thumb">
        <div className="preview-paper">
          <div className="preview-heading">
            {doc.title || "Untitled document"}
          </div>
          <p className="preview-content">{preview}</p>
          <div className="preview-fade"></div>
        </div>

        {/* Star Button (top right over thumbnail) */}
        {!isTrashView && onToggleStar && (
          <button
            type="button"
            className={`doc-star-btn ${doc.is_starred ? "starred" : ""}`}
            onClick={handleStarClick}
            aria-label={doc.is_starred ? "Unstar document" : "Star document"}
            title={doc.is_starred ? "Unstar document" : "Star document"}
          >
            {doc.is_starred ? "★" : "☆"}
          </button>
        )}
      </div>

      {/* Document info footer */}
      <div className="doc-info">
        <div className="doc-title-row">
          <h3 className="doc-title-heading" title={doc.title}>
            {doc.title || "Untitled document"}
          </h3>
          <span className="doc-icon">DOC</span>
        </div>

        <div className="doc-meta">
          <span className="doc-meta-time">
            Edited {formatRelativeTime(doc.updated_at || doc.updatedAt)}
          </span>

          <div className="doc-card-actions" onClick={(e) => e.stopPropagation()}>
            {isTrashView ? (
              <>
                <button
                  type="button"
                  className="doc-restore"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRestore) onRestore(doc.id);
                  }}
                  aria-label={`Restore ${doc.title}`}
                  title="Restore document"
                >
                  Restore
                </button>
                <button
                  type="button"
                  className="doc-delete"
                  onClick={handleDirectDelete}
                  aria-label={`Delete permanently ${doc.title}`}
                  title="Delete permanently"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                className="doc-delete"
                onClick={handleDirectDelete}
                aria-label={`Move ${doc.title} to trash`}
                title="Move to Trash"
              >
                Delete
              </button>
            )}

            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="doc-menu-btn"
                  aria-label={`More options for ${doc.title}`}
                  title="More options"
                >
                  ⋮
                </button>
              }
              items={menuItems}
              align="right"
              direction="up"
              onOpenChange={setIsMenuOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

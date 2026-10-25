import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../utils/documentUtils";

export default function DocumentCard({ document: doc, onDelete }) {
  const navigate = useNavigate();

  function handleOpen() {
    navigate(`/document/${doc.id}`);
  }

  function handleDelete(e) {
    e.stopPropagation();

    if (window.confirm(`Delete "${doc.title}"?`)) {
      onDelete(doc.id);
    }
  }

  // Get readable text from saved HTML
  function getPreview(html) {
    if (!html) {
      return "Start writing your document...";
    }

    const temp = window.document.createElement("div");
    temp.innerHTML = html;

    const text = temp.textContent || temp.innerText || "";

    return text.trim() || "Start writing your document...";
  }

  const preview = getPreview(doc.content);

  return (
    <div
      className="doc-card"
      tabIndex={0}
      role="button"
      aria-label={`Open ${doc.title}`}
      onClick={handleOpen}
      onKeyDown={(e) => e.key === "Enter" && handleOpen()}
    >
      <span>
            Edited {formatRelativeTime(doc.updatedAt)}
          </span>
      {/* Document preview */}
      <div className="doc-thumb">
        <div className="preview-paper">
          <div className="preview-heading">
            {doc.title || "Untitled document"}
          </div>

          <p className="preview-content">
            {preview}
          </p>

          <div className="preview-fade"></div>
        </div>
      </div>

      {/* Document information */}
      <div className="doc-info">
        <div className="doc-title-row">
          <h3>{doc.title || "Untitled document"}</h3>

          <span className="doc-icon">DOC</span>
        </div>

        <div className="doc-meta">
          {/* <span>
            Edited {formatRelativeTime(doc.updatedAt)}
          </span> */}

          <button
            className="doc-delete"
            onClick={handleDelete}
            aria-label={`Delete ${doc.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../utils/documentUtils";

export default function DocumentCard({ document, onDelete }) {
  const navigate = useNavigate();

  function handleOpen() {
    navigate(`/document/${document.id}`);
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Delete "${document.title}"?`)) {
      onDelete(document.id);
    }
  }

  return (
    <div
      className="doc-card"
      tabIndex={0}
      role="button"
      aria-label={`Open ${document.title}`}
      onClick={handleOpen}
      onKeyDown={(e) => e.key === "Enter" && handleOpen()}
    >
      <div className="doc-thumb">
        <div className="lines"><div></div><div></div><div></div></div>
      </div>
      <h3>{document.title}</h3>
      <div className="doc-meta">
        <span>Edited {formatRelativeTime(document.updatedAt)}</span>
        <button className="doc-delete" onClick={handleDelete} aria-label={`Delete ${document.title}`}>
          Delete
        </button>
      </div>
    </div>
  );
}
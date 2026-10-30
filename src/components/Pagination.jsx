/**
 * Reusable Pagination Controls
 * Aligned with FEE-II syllabus: pagination, list slices, page size selection.
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-bar" role="navigation" aria-label="Pagination">
      <div className="pagination-summary">
        Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong> documents
      </div>

      <div className="pagination-controls">
        <label className="pagination-size-label">
          Per page:
          <select
            className="pagination-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Items per page"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </label>

        <button
          className="btn-ghost pagination-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          ← Prev
        </button>

        <span className="pagination-page-indicator">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          className="btn-ghost pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

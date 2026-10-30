export default function SearchBar({ value, onChange, placeholder = "Search documents by title or content..." }) {
  return (
    <div className="search-box">
      <span className="search-icon" aria-hidden="true">
        🔍
      </span>
      <input
        type="search"
        placeholder={placeholder}
        aria-label="Search documents"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => onChange("")}
          aria-label="Clear search input"
        >
          ✕
        </button>
      )}
    </div>
  );
}

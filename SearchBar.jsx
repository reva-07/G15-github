export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-box">
      <span aria-hidden="true">🔍</span>
      <input
        type="text"
        placeholder="Search documents..."
        aria-label="Search documents"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
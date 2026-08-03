/** Controlled search box used in the DataTable toolbar. */
const SearchInput = ({ value, onChange, placeholder = "Search records" }) => (
  <div className="search">
    <span className="search__icon" aria-hidden="true">
      ⌕
    </span>
    <input
      type="search"
      className="search__input"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
    {value && (
      <button
        type="button"
        className="search__clear"
        aria-label="Clear search"
        onClick={() => onChange("")}
      >
        ×
      </button>
    )}
  </div>
);

export default SearchInput;

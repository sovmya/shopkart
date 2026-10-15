function SearchBar({ search, setSearch, category, setCategory }) {
  const categories = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

  return (
    <div className="search-bar">
      <input
        className="input"
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="input"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((cat) => (
          <option key={cat} value={cat === "All Categories" ? "" : cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchBar;
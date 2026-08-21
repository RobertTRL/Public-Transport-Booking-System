import React, { useState } from "react";

const SearchBar = ({ placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
  e.preventDefault();

  const trimmedSearchTerm = searchTerm.trim();

  if (!trimmedSearchTerm) {
    return;
  }

  console.log("Searching for:", trimmedSearchTerm);
};

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <span className="search-icon">⌕</span>

      <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      aria-label="Search routes"
    />

      {searchTerm && (
        <button
          type="button"
          className="clear-search"
          onClick={() => setSearchTerm("")}
        >
          ×
        </button>
      )}

      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
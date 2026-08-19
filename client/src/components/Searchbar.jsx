import React, { useState } from "react";
import "../styles/SearchBar.css";

const SearchBar = ({ placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    console.log("Searching for:", searchTerm);
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <span className="search-icon">⌕</span>

      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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
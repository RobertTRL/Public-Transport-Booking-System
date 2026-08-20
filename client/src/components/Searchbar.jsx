import { useState } from "react";
import "../styles/user.css";
function SearchBar({ placeholder = "Search routes, destinations..." }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!searchTerm.trim()) {
      return;
    }

    console.log("Searching for:", searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <span className="search-icon" aria-hidden="true">
        🔍
      </span>

      <input
        type="search"
        value={searchTerm}
        placeholder={placeholder}
        aria-label="Search routes and destinations"
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      {searchTerm && (
        <button
          type="button"
          className="clear-search"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}

      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
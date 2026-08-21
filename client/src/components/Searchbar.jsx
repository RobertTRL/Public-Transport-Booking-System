import { useState } from "react";
import "../styles/user.css";

function SearchBar({ placeholder = "Search routes, destinations..." }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      setMessage("Please enter a route or destination.");
      return;
    }

    setMessage(`Searching for "${query}"...`);
    console.log("Searching for:", query);
  };

  const handleClear = () => {
    setSearchTerm("");
    setMessage("");
  };

  return (
    <div>
      <form className="search-bar" onSubmit={handleSubmit}>
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>

        <input
          type="search"
          value={searchTerm}
          placeholder={placeholder}
          aria-label="Search routes and destinations"
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setMessage("");
          }}
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

      {message && (
        <p className="search-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export default SearchBar;